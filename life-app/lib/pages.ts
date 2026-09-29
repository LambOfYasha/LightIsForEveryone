export interface SitePage {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  content: string;
  isPublished: boolean;
  routeBehavior: SitePageRouteBehavior;
  redirectTo?: string;
  redirectType: SitePageRedirectType;
  createdAt?: string;
  updatedAt?: string;
  _createdAt?: string;
  _updatedAt?: string;
}

export type SitePageRouteBehavior = 'render' | 'redirect';

export type SitePageRedirectType = 'temporary' | 'permanent';

export interface SitePagePayload {
  title: string;
  slug: string;
  description: string;
  content: string;
  isPublished: boolean;
  routeBehavior: SitePageRouteBehavior;
  redirectTo: string;
  redirectType: SitePageRedirectType;
}

export const MANAGED_STATIC_PAGE_SLUGS = ['about', 'contact', 'faq', 'guidelines', 'privacy', 'terms'] as const;

export const RESERVED_SYSTEM_PAGE_SLUGS = [
  'admin',
  'api',
  'blogs',
  'cms-api',
  'community-questions',
  'dashboard',
  'debug-users',
  'feedback',
  'help',
  'lessons',
  'maintenance',
  'manage',
  'members',
  'profile',
  'responses',
  'search',
  'sign-in',
  'sign-up',
  'staff',
  'studio',
  'tags',
  'test-guest',
  'test-spoiler',
  'trpc',
  'unauthorized',
] as const;

export function normalizePageSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizePagePathname(value: string): string {
  const segments = value
    .split('/')
    .map((segment) => normalizePageSlug(segment))
    .filter(Boolean);

  return segments.length ? `/${segments.join('/')}` : '';
}

export function isExternalPageRedirectTarget(value: string): boolean {
  return /^https?:\/\//i.test(typeof value === 'string' ? value.trim() : '');
}

export function normalizePageRedirectTarget(value: string): string {
  const trimmed = typeof value === 'string' ? value.trim() : '';

  if (!trimmed) {
    return '';
  }

  if (trimmed === '/') {
    return '/';
  }

  if (trimmed.startsWith('//')) {
    return '';
  }

  if (isExternalPageRedirectTarget(trimmed)) {
    try {
      const externalUrl = new URL(trimmed);

      return ['http:', 'https:'].includes(externalUrl.protocol) ? externalUrl.toString() : '';
    } catch {
      return '';
    }
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return '';
  }

  try {
    const internalUrl = new URL(trimmed.startsWith('/') ? trimmed : `/${trimmed}`, 'https://managed-page.local');
    const normalizedPathname = normalizePagePathname(internalUrl.pathname);

    if (!normalizedPathname && internalUrl.pathname !== '/') {
      return '';
    }

    return `${normalizedPathname || '/'}${internalUrl.search}${internalUrl.hash}`;
  } catch {
    return '';
  }
}

export function getPageRedirectTargetError(value: string): string | null {
  const trimmed = typeof value === 'string' ? value.trim() : '';

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith('//')) {
    return 'Use a full external URL that starts with http:// or https://.';
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) && !isExternalPageRedirectTarget(trimmed)) {
    return 'Only http and https external URLs are supported.';
  }

  if (!normalizePageRedirectTarget(trimmed)) {
    return 'Use an internal path like /contact or a full external URL like https://example.com.';
  }

  return null;
}

export function isReservedSystemPageSlug(value: string): boolean {
  const normalized = normalizePageSlug(value);

  return Boolean(normalized && RESERVED_SYSTEM_PAGE_SLUGS.includes(normalized as (typeof RESERVED_SYSTEM_PAGE_SLUGS)[number]));
}

export function getManagedPageSlugError(value: string): string | null {
  const normalized = normalizePageSlug(value);

  if (!normalized) {
    return null;
  }

  if (isReservedSystemPageSlug(normalized)) {
    return `The /${normalized} route is already used by the app and cannot be managed from this screen.`;
  }

  return null;
}

export function normalizeSitePagePayload(input: Partial<SitePagePayload>): SitePagePayload {
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  const description = typeof input.description === 'string' ? input.description.trim() : '';
  const content = typeof input.content === 'string' ? input.content.trim() : '';
  const slugSource = typeof input.slug === 'string' && input.slug.trim() ? input.slug : title;
  const routeBehavior = input.routeBehavior === 'redirect' ? 'redirect' : 'render';
  const redirectType = input.redirectType === 'permanent' ? 'permanent' : 'temporary';
  const redirectTo =
    routeBehavior === 'redirect' && typeof input.redirectTo === 'string'
      ? normalizePageRedirectTarget(input.redirectTo)
      : '';

  return {
    title,
    slug: normalizePageSlug(slugSource),
    description,
    content,
    isPublished: typeof input.isPublished === 'boolean' ? input.isPublished : true,
    routeBehavior,
    redirectTo,
    redirectType,
  };
}

export function canManagePages(role?: string | null): boolean {
  return role === 'admin' || role === 'dev';
}

export function getPagePath(slug: string): string {
  return `/${normalizePageSlug(slug)}`;
}
