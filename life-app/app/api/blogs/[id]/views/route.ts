import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/adminClient';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 });
    }

    // Increment the view count
    const result = await adminClient
      .patch(id)
      .inc({ viewCount: 1 })
      .commit();

    return NextResponse.json({ 
      success: true, 
      viewCount: result.viewCount 
    });

  } catch (error) {
    console.error('Error incrementing view count:', error);
    return NextResponse.json(
      { error: 'Failed to increment view count' }, 
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 });
    }

    // Get the current view count
    const blog = await adminClient.getDocument(id);
    
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      viewCount: blog.viewCount || 0 
    });

  } catch (error) {
    console.error('Error getting view count:', error);
    return NextResponse.json(
      { error: 'Failed to get view count' }, 
      { status: 500 }
    );
  }
} 