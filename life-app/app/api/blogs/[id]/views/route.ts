import { NextRequest, NextResponse } from 'next/server';
import { getBlogById, incrementBlogViews } from '@/payload/lib/blogs/queries';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 });
    }
    const blog = await incrementBlogViews(id);
    return NextResponse.json({ success: true, viewCount: blog.viewCount });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return NextResponse.json({ error: 'Failed to increment view count' }, { status: 500 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 });
    }
    const blog = await getBlogById(id);
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, viewCount: blog.viewCount || 0 });
  } catch (error) {
    console.error('Error getting view count:', error);
    return NextResponse.json({ error: 'Failed to get view count' }, { status: 500 });
  }
}
