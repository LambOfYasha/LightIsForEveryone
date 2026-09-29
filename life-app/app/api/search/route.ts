import { NextResponse } from 'next/server';
import { defineQuery } from 'groq';
import { client } from '@/sanity/lib/client';
import { searchBlogs } from '@/payload/lib/blogs/queries';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type'); // 'all', 'blogs', 'communities', 'responses', 'comments'
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] });
    }

    const searchTerm = query.trim();

    // Base search query for blogs
    const blogSearchQuery = defineQuery(`
      *[_type == "blog" && (isDeleted == false || isDeleted == null) && (
        title match $searchTerm + "*" ||
        description match $searchTerm + "*" ||
        content[0].children[0].text match $searchTerm + "*" ||
        tags[]->name match $searchTerm + "*"
      )] | order(createdAt desc) [0...$limit] {
        _id,
        _type,
        title,
        description,
        "slug": slug.current,
        "author": author->{
          _id,
          username,
          imageURL
        },
        createdAt,
        image,
        "excerpt": content[0].children[0].text,
        "tags": tags[]->{
          _id,
          name,
          "slug": slug.current,
          color
        }
      }
    `);

    // Base search query for community questions
    const communitySearchQuery = defineQuery(`
      *[_type == "communityQuestion" && (isDeleted == false || isDeleted == null) && (
        title match $searchTerm + "*" ||
        description match $searchTerm + "*"
      )] | order(createdAt desc) [0...$limit] {
        _id,
        _type,
        title,
        description,
        "slug": slug.current,
        "moderator": moderator->{
          _id,
          username,
          imageURL
        },
        createdAt,
        image
      }
    `);

    // Base search query for community responses (posts)
    const responseSearchQuery = defineQuery(`
      *[_type == "post" && (isDeleted == false || isDeleted == null) && (
        title match $searchTerm + "*" ||
        body[0].children[0].text match $searchTerm + "*"
      )] | order(publishedAt desc) [0...$limit] {
        _id,
        _type,
        title,
        "slug": slug.current,
        "author": author->{
          _id,
          username,
          imageURL
        },
        "communityQuestion": communityQuestion->{
          _id,
          title,
          "slug": slug.current
        },
        publishedAt,
        isApproved,
        "excerpt": body[0].children[0].text
      }
    `);

    // Base search query for comments
    const commentSearchQuery = defineQuery(`
      *[_type == "comment" && (isDeleted == false || isDeleted == null) && (
        content match $searchTerm + "*"
      )] | order(createdAt desc) [0...$limit] {
        _id,
        _type,
        content,
        "author": author->{
          _id,
          username,
          imageURL
        },
        "post": post->{
          _id,
          title,
          "slug": slug.current,
          _type
        },
        createdAt,
        postType
      }
    `);

    let results = [];

    // Execute searches based on type filter
    if (type === 'all' || type === 'blogs' || !type) {
      const blogs = await searchBlogs(searchTerm, limit);
      results.push(...blogs.map((blog: any) => ({ ...blog, searchType: 'blog' })));
    }

    if (type === 'all' || type === 'communities' || !type) {
      const communities = await client.fetch(communitySearchQuery, { searchTerm, limit });
      results.push(...communities.map((community: any) => ({ ...community, searchType: 'community' })));
    }

    if (type === 'all' || type === 'responses' || !type) {
      const responses = await client.fetch(responseSearchQuery, { searchTerm, limit });
      results.push(...responses.map((response: any) => ({ ...response, searchType: 'response' })));
    }

    if (type === 'all' || type === 'comments' || !type) {
      const comments = await client.fetch(commentSearchQuery, { searchTerm, limit });
      results.push(...comments.map((comment: any) => ({ ...comment, searchType: 'comment' })));
    }

    // Sort results by relevance (exact matches first, then partial matches)
    results.sort((a, b) => {
      const aTitle = a.title?.toLowerCase() || '';
      const bTitle = b.title?.toLowerCase() || '';
      const searchLower = searchTerm.toLowerCase();
      
      const aExactMatch = aTitle.startsWith(searchLower);
      const bExactMatch = bTitle.startsWith(searchLower);
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      return new Date(b.createdAt || b.publishedAt).getTime() - new Date(a.createdAt || a.publishedAt).getTime();
    });

    // Limit total results
    results = results.slice(0, limit);

    return NextResponse.json({ 
      results,
      query: searchTerm,
      total: results.length
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
} 