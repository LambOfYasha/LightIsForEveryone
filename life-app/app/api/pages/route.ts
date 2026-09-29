import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import {
  canManagePages,
  getManagedPageSlugError,
  getPagePath,
  getPageRedirectTargetError,
  normalizeSitePagePayload,
} from '@/lib/pages';
import { createManagedPage, findPageIdBySlug, getPageBySlug, getPages } from '@/payload/lib/pages';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';
    const user = await getCurrentUser();
    const allowDraftAccess = canManagePages(user?.role) && includeUnpublished;

    if (slug) {
      const page = await getPageBySlug(slug, { includeUnpublished: allowDraftAccess });
      return NextResponse.json({ page });
    }

    const pages = await getPages({ includeUnpublished: allowDraftAccess });
    return NextResponse.json({ pages, total: pages.length });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!canManagePages(user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = normalizeSitePagePayload(await request.json());
    const slugError = getManagedPageSlugError(payload.slug);

    if (!payload.title || !payload.slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
    }
    if (slugError) {
      return NextResponse.json({ error: slugError }, { status: 400 });
    }
    if (payload.routeBehavior === 'render' && !payload.content) {
      return NextResponse.json({ error: 'Page content is required when this route shows a page' }, { status: 400 });
    }
    if (payload.routeBehavior === 'redirect' && !payload.redirectTo) {
      return NextResponse.json({ error: 'Choose a destination page when this route redirects visitors' }, { status: 400 });
    }
    if (payload.routeBehavior === 'redirect') {
      const redirectTargetError = getPageRedirectTargetError(payload.redirectTo);
      if (redirectTargetError) {
        return NextResponse.json({ error: redirectTargetError }, { status: 400 });
      }
      const redirectPathname = payload.redirectTo.startsWith('/')
        ? new URL(payload.redirectTo, 'https://managed-page.local').pathname
        : null;
      if (redirectPathname === getPagePath(payload.slug)) {
        return NextResponse.json({ error: 'A page cannot redirect to itself' }, { status: 400 });
      }
    }

    const existingPage = await findPageIdBySlug(payload.slug);
    if (existingPage) {
      return NextResponse.json({ error: 'A page with this slug already exists' }, { status: 409 });
    }

    const page = await createManagedPage(payload);
    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}
