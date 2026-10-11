import { NextRequest, NextResponse } from 'next/server';
import { defineQuery } from 'groq';
import { adminClient } from '@/sanity/lib/adminClient';
import { getUser } from '@/lib/user/getUser';
import { hasRoleOrHigher, isAdmin, isModerator } from '@/lib/auth/roles';

export interface AdminCommunityData {
  _id: string;
  title: string;
  slug: string | { current: string };
  description?: string;
  image?: {
    asset: {
      _ref: string;
    };
    alt?: string;
  };
  moderator: {
    _id: string;
    username: string;
    imageURL?: string;
    role: string;
  };
  createdAt: string;
  isActive: boolean;
  isDeleted: boolean;
  memberCount: number;
  postCount: number;
  lastActivity?: string;
  status: 'active' | 'moderated' | 'suspended' | 'archived';
}

export async function GET(request: NextRequest) {
  try {
    console.log("=== ADMIN COMMUNITIES API CALLED ===");
    
    const user = await getUser();
    
    // Check for authentication error
    if ("error" in user) {
      console.error("Authentication error:", user.error);
      return NextResponse.json({ error: user.error }, { status: 401 });
    }

    // Check if user exists
    if (!user || !user._id) {
      console.error("User not found or missing ID");
      return NextResponse.json({ error: 'User authentication failed' }, { status: 401 });
    }

    // Check if user has admin or moderator role
    if (!isAdmin(user.role) && !isModerator(user.role)) {
      console.error("User does not have admin or moderator role:", user.role);
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log("Query parameters:", { search, status, sortBy, sortOrder, page, limit });

    // Build the GROQ query with filters
    const filterConditions = ['_type == "communityQuestion"'];
    
    if (search) {
      filterConditions.push(`(title match "*${search}*" || description match "*${search}*")`);
    }
    
    if (status !== 'all') {
      filterConditions.push(`status == "${status}"`);
    }
    
    filterConditions.push('(isDeleted == false || isDeleted == null)');

    const filterString = filterConditions.join(' && ');
    console.log("Filter string:", filterString);

    const communitiesQuery = defineQuery(`
      *[${filterString}] | order(${sortBy} ${sortOrder}) [${(page - 1) * limit}...${page * limit}] {
        _id,
        title,
        slug,
        description,
        image,
        status,
        isActive,
        isDeleted,
        createdAt,
        lastActivity,
        "moderator": moderator->{
          _id,
          username,
          imageURL,
          role
        },
        "memberCount": count(*[_type == "favorite" && post._ref == ^._id && isActive == true]),
        "postCount": count(*[_type == "post" && communityQuestion._ref == ^._id && (isDeleted == false || isDeleted == null)])
      }
    `);

    const totalQuery = defineQuery(`
      count(*[${filterString}])
    `);

    console.log("Executing queries...");

    const [communities, total] = await Promise.all([
      adminClient.fetch(communitiesQuery),
      adminClient.fetch(totalQuery)
    ]);

    console.log("Query results:", {
      communitiesCount: communities?.length || 0,
      total,
      communities: communities?.map((c: { _id: string; title: string; status: string }) => ({ _id: c._id, title: c.title, status: c.status }))
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      communities,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('Error fetching communities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser();
    
    // Check for authentication error
    if ("error" in user) {
      console.error("Authentication error:", user.error);
      return NextResponse.json({ error: user.error }, { status: 401 });
    }

    // Check if user exists
    if (!user || !user._id) {
      console.error("User not found or missing ID");
      return NextResponse.json({ error: 'User authentication failed' }, { status: 401 });
    }

    // Check if user has admin role
    if (!isAdmin(user.role)) {
      console.error("User does not have admin role:", user.role);
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { communityId, updates } = body;

    if (!communityId || !updates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update the community
    const updatedCommunity = await adminClient
      .patch(communityId)
      .set(updates)
      .commit();

    return NextResponse.json({
      success: true,
      community: updatedCommunity
    });

  } catch (error) {
    console.error('Error updating community:', error);
    return NextResponse.json(
      { error: 'Failed to update community' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser();
    
    // Check for authentication error
    if ("error" in user) {
      console.error("Authentication error:", user.error);
      return NextResponse.json({ error: user.error }, { status: 401 });
    }

    // Check if user exists
    if (!user || !user._id) {
      console.error("User not found or missing ID");
      return NextResponse.json({ error: 'User authentication failed' }, { status: 401 });
    }

    // Check if user has admin role
    if (!isAdmin(user.role)) {
      console.error("User does not have admin role:", user.role);
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get('id');

    if (!communityId) {
      return NextResponse.json({ error: 'Community ID required' }, { status: 400 });
    }

    // Soft delete the community
    const deletedCommunity = await adminClient
      .patch(communityId)
      .set({
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: user._id
      })
      .commit();

    return NextResponse.json({
      success: true,
      message: 'Community deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting community:', error);
    return NextResponse.json(
      { error: 'Failed to delete community' },
      { status: 500 }
    );
  }
} 