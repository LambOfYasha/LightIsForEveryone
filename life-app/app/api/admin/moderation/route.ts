import { NextRequest, NextResponse } from 'next/server';
import { defineQuery } from 'groq';
import { adminClient } from '@/sanity/lib/adminClient';
import { getUser } from '@/lib/user/getUser';
import { isAdmin, isModerator } from '@/lib/auth/roles';

export interface ModerationReport {
  _id: string;
  reason: string;
  description?: string;
  status: 'pending' | 'investigating' | 'resolved_removed' | 'resolved_warning' | 'resolved_no_action' | 'dismissed';
  contentType: 'post' | 'comment' | 'blog' | 'communityQuestion' | 'user' | 'teacher';
  actionTaken?: 'none' | 'removed' | 'warned' | 'suspended' | 'banned';
  createdAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
  reporter: {
    _id: string;
    username: string;
    imageURL?: string;
    role: string;
  };
  reviewedBy?: {
    _id: string;
    username: string;
    imageURL?: string;
    role: string;
  };
  reportedContent?: {
    _id: string;
    title?: string;
    content?: string;
    username?: string;
  };
}

export interface ModerationStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  averageResolutionTime: string;
  reportsByType: Record<string, number>;
  reportsByReason: Record<string, number>;
  recentActivity: Array<{
    _id: string;
    type: 'report' | 'review';
    content: string;
    status: string;
    time: string;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    console.log("=== ADMIN MODERATION API CALLED ===");
    
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
    const status = searchParams.get('status') || 'all';
    const contentType = searchParams.get('contentType') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log("Query parameters:", { status, contentType, page, limit });

    // Build the GROQ query with filters
    const filterConditions = ['_type == "report"'];
    
    if (status !== 'all') {
      filterConditions.push(`status == "${status}"`);
    }
    
    if (contentType !== 'all') {
      filterConditions.push(`contentType == "${contentType}"`);
    }

    const filterString = filterConditions.join(' && ');
    console.log("Filter string:", filterString);

    // Get reports with pagination
    const reportsQuery = defineQuery(`
      *[${filterString}] | order(createdAt desc) [${(page - 1) * limit}...${page * limit}] {
        _id,
        reason,
        description,
        status,
        contentType,
        actionTaken,
        createdAt,
        reviewedAt,
        reviewNotes,
        "reporter": reporter->{
          _id,
          username,
          imageURL,
          role
        },
        "reviewedBy": reviewedBy->{
          _id,
          username,
          imageURL,
          role
        },
        "reportedContent": reportedContent->{
          _id,
          title,
          content,
          username
        }
      }
    `);

    // Get total count
    const totalQuery = defineQuery(`
      count(*[${filterString}])
    `);

    // Get statistics
    const statsQuery = defineQuery(`
      {
        "totalReports": count(*[_type == "report"]),
        "pendingReports": count(*[_type == "report" && status == "pending"]),
        "resolvedReports": count(*[_type == "report" && (status == "resolved_removed" || status == "resolved_warning" || status == "resolved_no_action" || status == "dismissed")]),
        "reportsByType": {
          "post": count(*[_type == "report" && contentType == "post"]),
          "comment": count(*[_type == "report" && contentType == "comment"]),
          "blog": count(*[_type == "report" && contentType == "blog"]),
          "communityQuestion": count(*[_type == "report" && contentType == "communityQuestion"]),
          "user": count(*[_type == "report" && contentType == "user"]),
          "teacher": count(*[_type == "report" && contentType == "teacher"])
        },
        "reportsByReason": {
          "inappropriate": count(*[_type == "report" && reason == "inappropriate"]),
          "spam": count(*[_type == "report" && reason == "spam"]),
          "harassment": count(*[_type == "report" && reason == "harassment"]),
          "misinformation": count(*[_type == "report" && reason == "misinformation"]),
          "copyright": count(*[_type == "report" && reason == "copyright"]),
          "violence": count(*[_type == "report" && reason == "violence"]),
          "hate_speech": count(*[_type == "report" && reason == "hate_speech"]),
          "other": count(*[_type == "report" && reason == "other"])
        }
      }
    `);

    // Get recent activity
    const recentActivityQuery = defineQuery(`
      *[_type == "report"] | order(createdAt desc) [0...10] {
        _id,
        reason,
        status,
        contentType,
        createdAt,
        "reporter": reporter->username
      }
    `);

    console.log("Executing queries...");

    const [reports, total, stats, recentActivity] = await Promise.all([
      adminClient.fetch(reportsQuery),
      adminClient.fetch(totalQuery),
      adminClient.fetch(statsQuery),
      adminClient.fetch(recentActivityQuery)
    ]);

    console.log("Query results:", {
      reportsCount: reports?.length || 0,
      total,
      stats,
      recentActivityCount: recentActivity?.length || 0
    });

    // Calculate average resolution time
    const resolvedReportsQuery = defineQuery(`
      *[_type == "report" && reviewedAt != null] {
        createdAt,
        reviewedAt
      }
    `);

    const resolvedReports = await adminClient.fetch(resolvedReportsQuery);
    
    let averageResolutionTime = '0 hours';
    if (resolvedReports && resolvedReports.length > 0) {
      const totalTime = resolvedReports.reduce((acc: number, report: any) => {
        const created = new Date(report.createdAt).getTime();
        const reviewed = new Date(report.reviewedAt).getTime();
        return acc + (reviewed - created);
      }, 0);
      
      const averageMs = totalTime / resolvedReports.length;
      const averageHours = averageMs / (1000 * 60 * 60);
      averageResolutionTime = `${averageHours.toFixed(1)} hours`;
    }

    // Format recent activity
    const formattedRecentActivity = recentActivity?.map((activity: any) => ({
      _id: activity._id,
      type: 'report' as const,
      content: `${activity.reason} - ${activity.contentType}`,
      status: activity.status,
      time: new Date(activity.createdAt).toLocaleString()
    })) || [];

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      stats: {
        ...stats,
        averageResolutionTime,
        recentActivity: formattedRecentActivity
      }
    });

  } catch (error) {
    console.error('Error fetching moderation data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch moderation data' },
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

    // Check if user has admin or moderator role
    if (!isAdmin(user.role) && !isModerator(user.role)) {
      console.error("User does not have admin or moderator role:", user.role);
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { reportId, updates } = body;

    if (!reportId || !updates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Add review information
    const updateData = {
      ...updates,
      reviewedBy: {
        _type: 'reference',
        _ref: user._id
      },
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update the report
    const updatedReport = await adminClient
      .patch(reportId)
      .set(updateData)
      .commit();

    console.log("Report updated:", updatedReport._id);

    return NextResponse.json({
      success: true,
      report: updatedReport
    });

  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
} 