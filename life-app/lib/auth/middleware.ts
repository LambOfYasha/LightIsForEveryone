// Clerk's server-side auth helper exposes the signed-in user's identity inside server actions and server components.
import { auth } from '@clerk/nextjs/server';
// Next.js `redirect` short-circuits execution and sends the user to a different route immediately.
import { redirect } from 'next/navigation';
// This helper loads the app-specific user record that corresponds to the Clerk user.
import { getUser } from '../user/getUser';
// These role helpers centralize permission logic so route guards stay readable and consistent.
import { hasRoleOrHigher, UserRole, hasPermission } from './roles';

/**
 * Ensures a request is associated with a Clerk user and returns that Clerk user ID.
 * This is the foundational guard that higher-level role and permission checks build on top of.
 */
export async function requireAuth() {
  try {
    // Ask Clerk for the currently authenticated user attached to this server-side request.
    const { userId } = await auth();
    
    // If Clerk does not provide a user ID, the visitor is not signed in and must be redirected.
    if (!userId) {
      console.log('No user ID found in auth context');
      redirect('/sign-in');
    }
    
    // Return the Clerk user ID so downstream guards can load the app-specific user record.
    return userId;
  } catch (error) {
    // Log unexpected auth failures so deployment and runtime issues are easier to diagnose.
    console.error('Auth error in requireAuth:', error);
    // During production build-time compatibility scenarios, return null instead of throwing a redirect.
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV) {
      return null;
    }
    // In a real request, failed auth resolution still sends the user to the sign-in page.
    redirect('/sign-in');
  }
}

/**
 * Requires the current user to have at least the specified role.
 * Returns the fully loaded app user record when the role check succeeds.
 */
export async function requireRole(requiredRole: UserRole) {
  try {
    // Start with the base Clerk auth check so only signed-in users continue.
    const userId = await requireAuth();
    
    // A missing identity never grants access.
    if (!userId) {
      // In a live request, a missing user ID still means the visitor must sign in.
      redirect('/sign-in');
    }
    
    // Load the app-specific user record because authorization is based on local roles, not only Clerk identity.
    const user = await getUser();
    
    // If the local user record is missing, treat the session as unusable and send the user to sign in again.
    if ('error' in user) {
      console.log('User not found in database:', user.error);
      redirect('/sign-in');
    }
    
    // Reject users whose role is lower than the role required by the caller.
    if (!hasRoleOrHigher(user.role, requiredRole)) {
      redirect('/unauthorized');
    }
    
    // Return the authorized user record so callers can continue their business logic.
    return user;
  } catch (error) {
    // Unexpected errors are treated as auth failures to avoid leaking privileged pages.
    console.error('Auth error in requireRole:', error);
    redirect('/sign-in');
  }
}

/**
 * Requires the current user to have a specific capability rather than only a minimum role.
 * This is useful when multiple roles share the same permission matrix.
 */
export async function requirePermission(permission: 'canCreatePosts' | 'canComment' | 'canCreateCommunities' | 'canModerate' | 'canManageUsers' | 'canManageTeachers' | 'canAccessAdminPanel' | 'canManageBlogs' | 'canDeleteMembers' | 'canGiveTeacherApprovals' | 'canDeleteOtherContent') {
  try {
    // Reuse the base auth check before evaluating any permission-specific logic.
    const userId = await requireAuth();
    
    // A missing identity never grants access.
    if (!userId) {
      // In a live request, missing auth means the user must sign in.
      redirect('/sign-in');
    }
    
    // Load the local user record because the permission matrix lives in app roles, not Clerk alone.
    const user = await getUser();
    
    // If the user record cannot be found locally, treat it as an invalid session.
    if ('error' in user) {
      console.log('User not found in database:', user.error);
      redirect('/sign-in');
    }
    
    // Deny access when the user's role does not include the requested capability.
    if (!hasPermission(user.role, permission)) {
      redirect('/unauthorized');
    }
    
    // Return the authorized user record so callers can continue safely.
    return user;
  } catch (error) {
    // Any unexpected failure is treated as an auth problem rather than allowing access by mistake.
    console.error('Auth error in requirePermission:', error);
    redirect('/sign-in');
  }
}

/**
 * Convenience wrapper for routes that require at least teacher-level access.
 */
export async function requireTeacher() {
  return requireRole('teacher');
}

/**
 * Convenience wrapper for moderator-only and moderator-above areas.
 */
export async function requireModerator() {
  return requireRole('moderator');
}

/**
 * Convenience wrapper for admin-only sections.
 */
export async function requireAdmin() {
  return requireRole('admin');
}

/**
 * Allows admins and all teacher variants to continue.
 * This is used where teaching staff and admins share the same screen or workflow.
 */
export async function requireAdminOrTeacher() {
  try {
    // Reuse the base auth guard before checking app-specific roles.
    const userId = await requireAuth();
    
    // A missing identity never grants access.
    if (!userId) {
      // In a real request, unauthenticated users still go to sign-in.
      redirect('/sign-in');
    }
    
    // Load the app user so local role checks can be evaluated.
    const user = await getUser();
    
    // Missing local user data invalidates the request even if Clerk has a session.
    if ('error' in user) {
      console.log('User not found in database:', user.error);
      redirect('/sign-in');
    }
    
    // Permit admins, all teacher tiers, and dev users for this broader shared access level.
    if (!['admin', 'teacher', 'junior_teacher', 'senior_teacher', 'lead_teacher', 'dev'].includes(user.role)) {
      redirect('/unauthorized');
    }
    
    // Return the validated local user record to the caller.
    return user;
  } catch (error) {
    // Fail safely by redirecting to sign-in if anything goes wrong during auth resolution.
    console.error('Auth error in requireAdminOrTeacher:', error);
    redirect('/sign-in');
  }
}

/**
 * Allows admins plus the higher teacher tiers that should have elevated staff access.
 */
export async function requireAdminOrSeniorTeacher() {
  try {
    // Authenticate first so role checks only run for signed-in sessions.
    const userId = await requireAuth();
    
    // A missing identity never grants access.
    if (!userId) {
      // Live unauthenticated traffic still gets redirected to sign-in.
      redirect('/sign-in');
    }
    
    // Resolve the local user record so application roles can be inspected.
    const user = await getUser();
    
    // A Clerk session without a local user record is treated as unauthorized.
    if ('error' in user) {
      console.log('User not found in database:', user.error);
      redirect('/sign-in');
    }
    
    // Only admins, senior teachers, lead teachers, and dev users are allowed through this guard.
    if (!['admin', 'senior_teacher', 'lead_teacher', 'dev'].includes(user.role)) {
      redirect('/unauthorized');
    }
    
    // Return the authorized user for the caller's downstream logic.
    return user;
  } catch (error) {
    // Unexpected issues are handled conservatively by redirecting to sign-in.
    console.error('Auth error in requireAdminOrSeniorTeacher:', error);
    redirect('/sign-in');
  }
}

/**
 * Allows only the narrowest elevated staff set: admins, lead teachers, and dev users.
 */
export async function requireAdminOrLeadTeacher() {
  try {
    // Authenticate first so the later role filter works on a real user session.
    const userId = await requireAuth();
    
    // A missing identity never grants access.
    if (!userId) {
      // Unauthenticated runtime requests are redirected to sign-in.
      redirect('/sign-in');
    }
    
    // Load the app-specific user record for local role evaluation.
    const user = await getUser();
    
    // Missing local user state is treated as an invalid or incomplete session.
    if ('error' in user) {
      console.log('User not found in database:', user.error);
      redirect('/sign-in');
    }
    
    // Permit only the most elevated teaching/admin roles for this guard.
    if (!['admin', 'lead_teacher', 'dev'].includes(user.role)) {
      redirect('/unauthorized');
    }
    
    // Return the authorized user so callers can continue their protected flow.
    return user;
  } catch (error) {
    // Fail closed if auth lookup or role evaluation throws unexpectedly.
    console.error('Auth error in requireAdminOrLeadTeacher:', error);
    redirect('/sign-in');
  }
}

/**
 * Returns the current local app user when available, or `null` when the visitor is unauthenticated.
 * Unlike the guard helpers above, this function does not force a redirect for ordinary guest access.
 */
export async function getCurrentUser() {
  try {
    // Resolve Clerk auth directly because this helper is informational rather than redirect-enforcing.
    const { userId } = await auth();
    
    // No signed-in Clerk user means the caller should receive `null` instead of being redirected.
    if (!userId) {
      // Runtime guest requests simply get a null user.
      return null;
    }
    
    // Load the corresponding local app user record once Clerk authentication is confirmed.
    const user = await getUser();
    
    // If the local user record is missing, treat the session as unusable and return null.
    if ('error' in user) {
      console.log('User not found in database:', user.error);
      return null;
    }
    
    // Return the local app user record for callers that need user context but not a hard redirect.
    return user;
  } catch (error) {
    // Unexpected auth issues degrade gracefully to `null` so non-protected pages can still render.
    console.error('Auth error in getCurrentUser:', error);
    return null;
  }
}