// Clerk's edge middleware wrapper authenticates requests before the rest of the middleware logic runs.
// `createRouteMatcher` turns path patterns into reusable checks for auth and maintenance rules.
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
// Next.js request and response helpers are used to inspect URLs and issue redirects from middleware.
import { NextRequest, NextResponse } from 'next/server';
// This helper decides whether a signed-in role is allowed to bypass maintenance mode.
import { canBypassMaintenanceMode } from '@/lib/admin-settings';
// Page helpers normalize slugs and prevent CMS-driven redirects from hijacking reserved system routes.
import { isReservedSystemPageSlug, type SitePageRedirectType, normalizePageSlug } from '@/lib/pages';
// The Sanity client lets middleware read CMS-managed settings before a page is rendered.
import { client } from '@/sanity/lib/client';

// These routes require a signed-in user before the request is allowed to continue.
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', // Protect all dashboard pages and their nested routes.
  '/admin(.*)', // Protect the entire admin area.
  '/api/admin(.*)', // Protect admin-only API endpoints.
  '/api/blogs(.*)', // Protect blog endpoints that live under the authenticated blog API namespace.
  '/api/communities(.*)', // Protect community endpoints by default unless a more specific guest exception matches.
  '/api/reports(.*)', // Protect report endpoints because they are tied to authenticated moderation/user flows.
  '/api/search(.*)', // Protect the app's search endpoints under the current access policy.
  '/api/user(.*)', // Protect user profile and user-role endpoints.
  '/api/webhooks(.*)', // Protect webhook endpoints inside the Clerk-aware middleware pipeline.
]);

// These more specific API routes remain available to guests even though broader parent prefixes are protected.
const isPublicApiRoute = createRouteMatcher([
  '/api/user/guest(.*)', // Allow guest bootstrap or guest user flows.
  '/api/comments/guest(.*)', // Allow guest comment submission endpoints.
  '/api/communities/guest(.*)', // Allow guest-safe community endpoints.
  '/api/moderation(.*)', // Allow the public moderation flow used by guest features.
]);

// These routes must remain reachable during maintenance to avoid redirect loops and allow privileged sign-in.
const isMaintenanceBypassRoute = createRouteMatcher([
  '/maintenance(.*)', // Let the maintenance page render even when maintenance mode is enabled.
  '/sign-in(.*)', // Let admins and developers sign in while the rest of the site is paused.
  '/sign-up(.*)', // Keep sign-up reachable when the product's maintenance policy allows it.
]);

// This is the minimal Sanity payload needed to decide whether a managed page should redirect.
interface ManagedPageRedirectLookup {
  redirectTo?: string;
  redirectType?: SitePageRedirectType;
}

// This is the minimal admin settings payload needed to decide whether maintenance mode is enabled.
interface MaintenanceModeLookup {
  maintenanceMode?: boolean;
}

// This is the smallest user projection needed to determine maintenance bypass permissions.
interface AuthenticatedUserRoleLookup {
  role?: string;
}

// This GROQ query finds a published managed page whose route behavior is set to redirect.
const managedPageRedirectLookupQuery = `*[_type == "page" && slug.current == $slug && isPublished == true && coalesce(routeBehavior, "render") == "redirect" && defined(redirectTo)][0] {
  redirectTo,
  "redirectType": coalesce(redirectType, "temporary")
}`;

// This GROQ query reads the singleton maintenance-mode flag from admin settings.
const maintenanceModeLookupQuery = `*[_type == "adminSettings"][0] {
  maintenanceMode
}`;

// This GROQ query fetches only the signed-in user's role so middleware can evaluate bypass rules cheaply.
const authenticatedUserRoleLookupQuery = `*[_type in ["user", "teacher"] && id == $id][0] {
  role
}`;

/**
 * Returns true only for normal GET or HEAD requests that are not API or framework internal requests.
 */
function isPageRequest(req: NextRequest) {
  // Ignore POST, PUT, DELETE, and other non-navigation methods because they are not page renders.
  if (!['GET', 'HEAD'].includes(req.method)) {
    return false;
  }

  // Read the pathname once so the same normalized path is used for all checks below.
  const { pathname } = req.nextUrl;

  // A page request must exist and must not target API handlers, tRPC, or Next.js internals.
  return Boolean(pathname && !pathname.startsWith('/api') && !pathname.startsWith('/trpc') && !pathname.startsWith('/_next'));
}

/**
 * Returns true only for single-segment site pages like `/about` or `/contact`.
 * Managed page redirects are limited to these top-level slugs so nested app routes are not queried in Sanity.
 */
function isTopLevelPageRequest(req: NextRequest) {
  // Managed page redirects only apply to normal navigational requests.
  if (!['GET', 'HEAD'].includes(req.method)) {
    return false;
  }

  // Reuse the pathname to determine whether the URL is a simple top-level page slug.
  const { pathname } = req.nextUrl;

  // Ignore the homepage, APIs, tRPC, and framework internals because they are not managed page candidates.
  if (!pathname || pathname === '/' || pathname.startsWith('/api') || pathname.startsWith('/trpc') || pathname.startsWith('/_next')) {
    return false;
  }

  // A top-level page has exactly one non-empty path segment.
  return pathname.split('/').filter(Boolean).length === 1;
}

/**
 * Checks whether a managed page redirect is configured for the current request.
 * If a redirect is found, returns a redirect response; otherwise, returns null.
 */
async function getManagedPageRedirectResponse(req: NextRequest) {
  // Skip this entire lookup for routes that are not eligible CMS-managed top-level pages.
  if (!isTopLevelPageRequest(req)) {
    return null;
  }

  // Convert the URL path into the slug format expected by the Sanity page documents.
  const slug = normalizePageSlug(req.nextUrl.pathname);

  // Do not let Sanity override built-in routes like `/admin`, `/search`, or other reserved slugs.
  if (!slug || isReservedSystemPageSlug(slug)) {
    return null;
  }

  try {
    // Fetch the redirect rule from Sanity using the normalized slug.
    const redirectRule = await client.fetch<ManagedPageRedirectLookup | null>(
      managedPageRedirectLookupQuery,
      { slug }
    );

    // If Sanity has no redirect target for this slug, the request should continue to the page component.
    if (!redirectRule?.redirectTo) {
      return null;
    }

    // Construct the redirect destination URL.
    const destination = new URL(redirectRule.redirectTo, req.url);

    // Ensure the redirect does not loop back to the original URL.
    if (destination.origin === req.nextUrl.origin && destination.pathname === req.nextUrl.pathname) {
      return null;
    }

    // Return a redirect response with the correct status code.
    return NextResponse.redirect(
      destination,
      redirectRule.redirectType === 'permanent' ? 308 : 307
    );
  } catch (error) {
    console.error('Failed to resolve managed page redirect:', error);
    return null;
  }
}

/**
 * Reads the site-wide maintenance toggle from Sanity.
 * If the lookup fails, the middleware defaults to `false` so the site stays available.
 */
async function isMaintenanceModeEnabled() {
  try {
    // Fetch only the maintenance flag from the singleton admin settings document.
    const settings = await client.fetch<MaintenanceModeLookup | null>(maintenanceModeLookupQuery);

    // Coerce an optional value into a plain boolean for downstream checks.
    return Boolean(settings?.maintenanceMode);
  } catch (error) {
    // Fail open so transient CMS issues do not force the site into downtime.
    console.error('Failed to read maintenance mode settings:', error);
    return false;
  }
}

/**
 * Looks up the authenticated user's role so maintenance mode can allow privileged bypasses.
 */
async function getAuthenticatedUserRole(userId: string) {
  try {
    // Fetch only the role field to keep the middleware query lightweight.
    const userRecord = await client.fetch<AuthenticatedUserRoleLookup | null>(
      authenticatedUserRoleLookupQuery,
      { id: userId }
    );

    // Normalize missing records to null so callers can treat the user as non-privileged.
    return userRecord?.role || null;
  } catch (error) {
    // Fail closed on bypass checks so only positively identified privileged users skip maintenance.
    console.error('Failed to read authenticated user role for maintenance mode:', error);
    return null;
  }
}

/**
 * Returns a maintenance mode response if the site is in maintenance mode and the user is not privileged.
 */
async function getMaintenanceModeResponse(userId: string | null | undefined, req: NextRequest) {
  // Only real page navigations should be sent to the maintenance screen.
  // API routes and explicit maintenance bypass routes should continue without interruption.
  if (!isPageRequest(req) || isMaintenanceBypassRoute(req)) {
    return null;
  }

  // Check the global maintenance toggle before performing any additional auth-related work.
  const maintenanceModeEnabled = await isMaintenanceModeEnabled();

  // If the site is not in maintenance mode, leave the request untouched.
  if (!maintenanceModeEnabled) {
    return null;
  }

  // A signed-in user may still be allowed through if their role is marked as a maintenance bypass role.
  if (userId) {
    // Load the role only when Clerk has already authenticated the request.
    const role = await getAuthenticatedUserRole(userId);

    // Admin/dev-style users can continue to the requested page during maintenance.
    if (canBypassMaintenanceMode(role)) {
      return null;
    }
  }

  // Build an absolute URL for the maintenance page using the same origin as the current request.
  const maintenanceUrl = new URL('/maintenance', req.url);
  // Preserve the visitor's original path so the maintenance page can explain what was interrupted.
  const currentPath = `${req.nextUrl.pathname}${req.nextUrl.search}`;

  // Avoid overwriting the query string when the visitor is already on the maintenance page itself.
  if (currentPath && currentPath !== '/maintenance') {
    maintenanceUrl.searchParams.set('from', currentPath);
  }

  // Redirect all non-privileged visitors to the maintenance page.
  return NextResponse.redirect(maintenanceUrl);
}

/**
 * This is the single middleware entry point that Next.js executes for matched routes.
 * Clerk resolves the auth context first, then this function layers on app-specific rules.
 */
const middleware = clerkMiddleware(async (auth, req) => {
  // Ask Clerk for the current authenticated user, if any.
  const { userId } = await auth();

  // Enforce sign-in on protected routes before any other redirect system runs.
  if (isProtectedRoute(req) && !userId) {
    // Some child API routes are intentionally public even though their parent prefixes are protected.
    if (isPublicApiRoute(req)) {
      return;
    }

    // API callers expect JSON, so return 401 instead of redirecting them to an HTML sign-in page.
    if (req.nextUrl.pathname.startsWith('/api') || req.nextUrl.pathname.startsWith('/trpc')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build the sign-in URL on the same origin as the incoming request.
    const signInUrl = new URL('/sign-in', req.url);
    // Preserve the original destination so the app can send the user back after login.
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // If the user is allowed to see the route from an auth perspective, check maintenance mode next.
  const maintenanceModeResponse = await getMaintenanceModeResponse(userId, req);

  // Stop immediately when maintenance mode wants to take over the response.
  if (maintenanceModeResponse) {
    return maintenanceModeResponse;
  }

  // Finally, let the CMS redirect top-level pages when a managed redirect exists.
  const managedRedirectResponse = await getManagedPageRedirectResponse(req);

  // Return the CMS redirect if one was configured; otherwise the request falls through to Next.js normally.
  if (managedRedirectResponse) {
    return managedRedirectResponse;
  }
});

// Export this middleware as the file's default so Next.js picks it up automatically at the app boundary.
export default middleware;

// Tell Next.js exactly which URLs should execute this middleware to avoid running it on static assets.
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};