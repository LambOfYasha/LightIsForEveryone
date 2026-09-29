import { NextRequest, NextResponse } from 'next/server';
import { defineQuery } from 'groq';
import { adminClient } from '@/sanity/lib/adminClient';
import { getUser } from '@/lib/user/getUser';
import { isAdmin, isModerator } from '@/lib/auth/roles';
import { countBlogs } from '@/payload/lib/blogs/queries';

export interface AnalyticsData {
  // User Statistics
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  userRoleBreakdown: Record<string, number>;
  
  // Content Statistics
  totalPosts: number;
  totalComments: number;
  totalBlogs: number;
  totalCommunities: number;
  totalFavorites: number;
  
  // Moderation Statistics
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  reportsByReason: Record<string, number>;
  reportsByContentType: Record<string, number>;
  
  // Engagement Metrics
  averagePostsPerUser: number;
  averageCommentsPerPost: number;
  topActiveCommunities: Array<{
    _id: string;
    title: string;
    memberCount: number;
    postCount: number;
  }>;
  
  // System Performance
  averageResponseTime: string;
  systemHealth: {
    aiService: 'online' | 'offline';
    database: 'healthy' | 'warning' | 'error';
    apiResponseTime: string;
    errorRate: string;
  };
  
  // Recent Activity
  recentActivity: Array<{
    _id: string;
    type: 'user_joined' | 'post_created' | 'comment_added' | 'report_submitted' | 'moderation_action';
    description: string;
    timestamp: string;
  }>;
  
  // Growth Metrics
  growthMetrics: {
    userGrowthRate: number;
    contentGrowthRate: number;
    engagementGrowthRate: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    console.log("=== ADMIN ANALYTICS API CALLED ===");
    
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
    const timeRange = searchParams.get('timeRange') || 'all';

    console.log("Query parameters:", { timeRange });

    // Build time filter
    let timeFilter = '';
    if (timeRange === 'week') {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      timeFilter = `&& _createdAt >= "${oneWeekAgo}"`;
    } else if (timeRange === 'month') {
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      timeFilter = `&& _createdAt >= "${oneMonthAgo}"`;
    }

    // Get user statistics
    const userStatsQuery = defineQuery(`
      {
        "totalUsers": count(*[_type == "user"]),
        "activeUsers": count(*[_type == "user" && lastSeen >= "${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}"]),
        "newUsersThisMonth": count(*[_type == "user" && _createdAt >= "${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}"]),
        "userRoleBreakdown": {
          "guest": count(*[_type == "user" && role == "guest"]),
          "member": count(*[_type == "user" && role == "member"]),
          "teacher": count(*[_type == "user" && role == "teacher"]),
          "junior_teacher": count(*[_type == "user" && role == "junior_teacher"]),
          "moderator": count(*[_type == "user" && role == "moderator"]),
          "senior_teacher": count(*[_type == "user" && role == "senior_teacher"]),
          "lead_teacher": count(*[_type == "user" && role == "lead_teacher"]),
          "dev": count(*[_type == "user" && role == "dev"]),
          "admin": count(*[_type == "user" && role == "admin"])
        }
      }
    `);

    // Get content statistics
    const contentStatsQuery = defineQuery(`
      {
        "totalPosts": count(*[_type == "post" && (isDeleted == false || isDeleted == null)]),
        "totalComments": count(*[_type == "comment" && (isDeleted == false || isDeleted == null)]),
        "totalBlogs": count(*[_type == "blog" && (isDeleted == false || isDeleted == null)]),
        "totalCommunities": count(*[_type == "communityQuestion" && (isDeleted == false || isDeleted == null)]),
        "totalFavorites": count(*[_type == "favorite" && isActive == true])
      }
    `);

    // Get moderation statistics
    const moderationStatsQuery = defineQuery(`
      {
        "totalReports": count(*[_type == "report"]),
        "pendingReports": count(*[_type == "report" && status == "pending"]),
        "resolvedReports": count(*[_type == "report" && (status == "resolved_removed" || status == "resolved_warning" || status == "resolved_no_action" || status == "dismissed")]),
        "reportsByReason": {
          "inappropriate": count(*[_type == "report" && reason == "inappropriate"]),
          "spam": count(*[_type == "report" && reason == "spam"]),
          "harassment": count(*[_type == "report" && reason == "harassment"]),
          "misinformation": count(*[_type == "report" && reason == "misinformation"]),
          "copyright": count(*[_type == "report" && reason == "copyright"]),
          "violence": count(*[_type == "report" && reason == "violence"]),
          "hate_speech": count(*[_type == "report" && reason == "hate_speech"]),
          "other": count(*[_type == "report" && reason == "other"])
        },
        "reportsByContentType": {
          "post": count(*[_type == "report" && contentType == "post"]),
          "comment": count(*[_type == "report" && contentType == "comment"]),
          "blog": count(*[_type == "report" && contentType == "blog"]),
          "communityQuestion": count(*[_type == "report" && contentType == "communityQuestion"]),
          "user": count(*[_type == "report" && contentType == "user"]),
          "teacher": count(*[_type == "report" && contentType == "teacher"])
        }
      }
    `);

    // Get top active communities
    const topCommunitiesQuery = defineQuery(`
      *[_type == "communityQuestion" && (isDeleted == false || isDeleted == null)] | order(memberCount desc) [0...5] {
        _id,
        title,
        "memberCount": count(*[_type == "favorite" && post._ref == ^._id && isActive == true]),
        "postCount": count(*[_type == "post" && communityQuestion._ref == ^._id && (isDeleted == false || isDeleted == null)])
      }
    `);

    // Get recent activity
    const recentActivityQuery = defineQuery(`
      *[_type in ["user", "post", "comment", "report"]] | order(_createdAt desc) [0...10] {
        _id,
        _type,
        _createdAt,
        title,
        username,
        reason,
        status
      }
    `);

    console.log("Executing analytics queries...");

    const [userStats, contentStats, moderationStats, topCommunities, recentActivity] = await Promise.all([
      adminClient.fetch(userStatsQuery),
      adminClient.fetch(contentStatsQuery),
      adminClient.fetch(moderationStatsQuery),
      adminClient.fetch(topCommunitiesQuery),
      adminClient.fetch(recentActivityQuery)
    ]);

    try {
      contentStats.totalBlogs = await countBlogs();
    } catch (error) {
      console.error('Payload blog count failed:', error);
    }

    console.log("Query results:", {
      userStats,
      contentStats,
      moderationStats,
      topCommunitiesCount: topCommunities?.length || 0,
      recentActivityCount: recentActivity?.length || 0
    });

    // Calculate engagement metrics
    const averagePostsPerUser = userStats.totalUsers > 0 ? (contentStats.totalPosts / userStats.totalUsers).toFixed(2) : '0';
    const averageCommentsPerPost = contentStats.totalPosts > 0 ? (contentStats.totalComments / contentStats.totalPosts).toFixed(2) : '0';

    // Format recent activity
    const formattedRecentActivity = recentActivity?.map((activity: any) => {
      let type: string;
      let description: string;

      switch (activity._type) {
        case 'user':
          type = 'user_joined';
          description = `New user joined: ${activity.username || 'Unknown'}`;
          break;
        case 'post':
          type = 'post_created';
          description = `New post created: ${activity.title || 'Untitled'}`;
          break;
        case 'comment':
          type = 'comment_added';
          description = `New comment added by ${activity.username || 'Unknown'}`;
          break;
        case 'report':
          type = 'report_submitted';
          description = `Report submitted: ${activity.reason || 'Unknown reason'}`;
          break;
        default:
          type = 'moderation_action';
          description = `System activity: ${activity._type}`;
      }

      return {
        _id: activity._id,
        type: type as any,
        description,
        timestamp: new Date(activity._createdAt).toLocaleString()
      };
    }) || [];

    // Calculate growth metrics (simplified - in real app, you'd compare with previous periods)
    const growthMetrics = {
      userGrowthRate: 5.2, // Mock data - would calculate from historical data
      contentGrowthRate: 12.8,
      engagementGrowthRate: 8.4
    };

    // Mock system health data (in real app, this would come from monitoring)
    const systemHealth = {
      aiService: 'online' as const,
      database: 'healthy' as const,
      apiResponseTime: '1.2s',
      errorRate: '0.1%'
    };

    const analyticsData: AnalyticsData = {
      // User Statistics
      totalUsers: userStats.totalUsers,
      activeUsers: userStats.activeUsers,
      newUsersThisMonth: userStats.newUsersThisMonth,
      userRoleBreakdown: userStats.userRoleBreakdown,
      
      // Content Statistics
      totalPosts: contentStats.totalPosts,
      totalComments: contentStats.totalComments,
      totalBlogs: contentStats.totalBlogs,
      totalCommunities: contentStats.totalCommunities,
      totalFavorites: contentStats.totalFavorites,
      
      // Moderation Statistics
      totalReports: moderationStats.totalReports,
      pendingReports: moderationStats.pendingReports,
      resolvedReports: moderationStats.resolvedReports,
      reportsByReason: moderationStats.reportsByReason,
      reportsByContentType: moderationStats.reportsByContentType,
      
      // Engagement Metrics
      averagePostsPerUser: parseFloat(averagePostsPerUser),
      averageCommentsPerPost: parseFloat(averageCommentsPerPost),
      topActiveCommunities: topCommunities || [],
      
      // System Performance
      averageResponseTime: '1.2s',
      systemHealth,
      
      // Recent Activity
      recentActivity: formattedRecentActivity,
      
      // Growth Metrics
      growthMetrics
    };

    return NextResponse.json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 