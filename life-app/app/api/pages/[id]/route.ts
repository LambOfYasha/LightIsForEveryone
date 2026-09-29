import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import {
  canManagePages,
  getManagedPageSlugError,
  getPagePath,
  getPageRedirectTargetError,
  normalizeSitePagePayload,
} from '@/lib/pages';
import { deleteManagedPage, findPageIdBySlug, updateManagedPage } from '@/payload/lib/pages';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const existingPage = await findPageIdBySlug(payload.slug, id);
    if (existingPage) {
      return NextResponse.json({ error: 'A page with this slug already exists' }, { status: 409 });
    }

    const page = await updateManagedPage(id, payload);
    return NextResponse.json({ page });
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!canManagePages(user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await deleteManagedPage(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}
