import { defineQuery } from "groq";
import { client } from "@/sanity/lib/client";
import { getUser } from "./getUser";
import { getUserAnalytics } from "./getUserAnalytics";
import { getUserPosts } from "./getUserPosts";
import { getUserNotifications } from "@/action/notificationActions";
import { getFavoriteStats } from "./getUserFavorites";

export interface DashboardData {
  user: {
    _id: string;
    username: string;
    role: string;
    imageURL?: string;
  };
  stats: {
    postsCreated: number;
    totalViews: number;
    totalComments: number;
    communitiesJoined: number;
    favoritesSaved: number;
    engagementRate: number;
    weeklyGrowth: number;
  };
  posts: {
    recent: any[];
    total: number;
    thisMonth: number;
    thisYear: number;
  };
  communities: {
    joined: any[];
    total: number;
    active: number;
  };
  notifications: {
    recent: any[];
    unread: number;
    total: number;
  };
  analytics: {
    weeklyActivity: {
      day: string;
      posts: number;
      views: number;
      comments: number;
    }[];
    engagementTrends: {
      period: string;
      views: number;
      likes: number;
      comments: number;
    }[];
    topContent: any[];
  };
  recentActivity: {
    type: 'post' | 'comment' | 'community' | 'favorite';
    title: string;
    time: string;
    id: string;
    metadata: any;
  }[];
}

export async function getUserDashboardData(): Promise<DashboardData | { error: string }> {
  try {
    const user = await getUser();
    
    if ("error" in user) {
      return { error: user.error };
    }

    // Calculate date ranges
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Fetch all data in parallel
    const [
      postsData,
      communitiesData,
      notificationsData,
      analyticsData,
      userPosts,
      userAnalytics,
      favoriteStats
    ] = await Promise.all([
      // Get user's posts with engagement data
      client.fetch(defineQuery(`
        {
          "recent": *[_type == "post" && author._ref == $userId && (isDeleted == false || isDeleted == null)] | order(publishedAt desc)[0...5] {
            _id,
            title,
            slug,
            publishedAt,
            viewCount,
            likeCount,
            commentCount,
            isApproved,
            communityQuestion->{
              _id,
              title,
              slug
            }
          },
          "total": count(*[_type == "post" && author._ref == $userId && (isDeleted == false || isDeleted == null)]),
          "thisMonth": count(*[_type == "post" && author._ref == $userId && publishedAt >= $startOfMonth && (isDeleted == false || isDeleted == null)]),
          "thisYear": count(*[_type == "post" && author._ref == $userId && publishedAt >= $startOfYear && (isDeleted == false || isDeleted == null)])
        }
      `), { 
        userId: user._id, 
        startOfMonth: startOfMonth.toISOString(),
        startOfYear: startOfYear.toISOString()
      }),

      // Get user's communities
      client.fetch(defineQuery(`
        {
          "joined": *[_type == "community" && members[]._ref == $userId && (isDeleted == false || isDeleted == null)] | order(_createdAt desc)[0...5] {
            _id,
            title,
            slug,
            _createdAt,
            members[]->{
              _id,
              username
            },
            posts[]->{
              _id,
              title
            }
          },
          "total": count(*[_type == "community" && members[]._ref == $userId && (isDeleted == false || isDeleted == null)]),
          "active": count(*[_type == "community" && members[]._ref == $userId && (isDeleted == false || isDeleted == null) && _createdAt >= $startOfMonth])
        }
      `), { 
        userId: user._id,
        startOfMonth: startOfMonth.toISOString()
      }),

      // Get notifications
      getUserNotifications(10, false),

      // Get analytics data
      getUserAnalytics(),

      // Get user posts for recent activity
      getUserPosts(10),

      // Get user analytics
      getUserAnalytics(),
      
      // Get favorite stats
      getFavoriteStats()
    ]);

    // Calculate stats
    const posts = postsData.recent || [];
    const communities = communitiesData.joined || [];
    const notifications = notificationsData.success ? (notificationsData.notifications ?? []) : [];
    const analytics = analyticsData;
    const favorites = favoriteStats;

    // Calculate engagement metrics
    const totalViews = posts.reduce((sum: number, post: any) => sum + (post.viewCount || 0), 0);
    const totalComments = posts.reduce((sum: number, post: any) => sum + (post.commentCount || 0), 0);
    const engagementRate = posts.length > 0 ? 
      (totalComments / (posts.length * 10)) * 100 : 0;

    // Calculate weekly growth (mock for now)
    const weeklyGrowth = posts.length > 0 ? Math.max(0, posts.length - 2) : 0;

    // Generate weekly activity data
    const weeklyActivity = generateWeeklyActivity(posts);

    // Generate recent activity
    const recentActivity = generateRecentActivity(posts, communities, notifications);

    // Generate engagement trends
    const engagementTrends = generateEngagementTrends(posts);

    // Get top content
    const topContent = posts
      .sort((a: any, b: any) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 3);

    const dashboardData: DashboardData = {
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        imageURL: user.imageURL
      },
      stats: {
        postsCreated: postsData.total || 0,
        totalViews,
        totalComments,
        communitiesJoined: communitiesData.total || 0,
        favoritesSaved: ('total' in favorites ? favorites.total : 0),
        engagementRate: Math.round(engagementRate * 10) / 10,
        weeklyGrowth
      },
      posts: {
        recent: posts,
        total: postsData.total || 0,
        thisMonth: postsData.thisMonth || 0,
        thisYear: postsData.thisYear || 0
      },
      communities: {
        joined: communities,
        total: communitiesData.total || 0,
        active: communitiesData.active || 0
      },
      notifications: {
        recent: notifications.slice(0, 5),
        unread: notifications.filter((n: any) => !n.isRead).length,
        total: notifications.length
      },
      analytics: {
        weeklyActivity,
        engagementTrends,
        topContent
      },
      recentActivity
    };

    return dashboardData;
  } catch (error) {
    console.error("Error getting dashboard data:", error);
    return { error: "Failed to get dashboard data" };
  }
}

function generateWeeklyActivity(posts: any[]) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  
  return days.map((day, index) => {
    const dayPosts = posts.filter((post: any) => {
      const postDate = new Date(post.publishedAt);
      return postDate.getDay() === index;
    });
    
    const views = dayPosts.reduce((sum: number, post: any) => sum + (post.viewCount || 0), 0);
    const comments = dayPosts.reduce((sum: number, post: any) => sum + (post.commentCount || 0), 0);
    
    return {
      day,
      posts: dayPosts.length,
      views,
      comments
    };
  });
}

function generateRecentActivity(posts: any[], communities: any[], notifications: any[]) {
  const activities: DashboardData['recentActivity'] = [];

  // Add recent posts
  posts.slice(0, 3).forEach((post: any) => {
    activities.push({
      type: 'post' as const,
      title: post.title,
      time: new Date(post.publishedAt).toLocaleDateString(),
      id: post._id,
      metadata: {
        views: post.viewCount || 0,
        comments: post.commentCount || 0
      }
    });
  });

  // Add recent community activity
  communities.slice(0, 2).forEach((community: any) => {
    activities.push({
      type: 'community' as const,
      title: community.title,
      time: new Date(community._createdAt).toLocaleDateString(),
      id: community._id,
      metadata: {
        members: community.members?.length || 0,
        posts: community.posts?.length || 0
      }
    });
  });

  // Add recent notifications
  notifications.slice(0, 2).forEach((notification: any) => {
    activities.push({
      type: 'comment' as const, // Using comment type for notifications
      title: notification.title,
      time: new Date(notification.createdAt).toLocaleDateString(),
      id: notification._id,
      metadata: {
        severity: notification.severity,
        isRead: notification.isRead
      }
    });
  });

  // Sort by time and return top 5
  return activities
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 5);
}

function generateEngagementTrends(posts: any[]) {
  const periods = ['This Week', 'Last Week', 'This Month', 'Last Month'];
  
  return periods.map((period, index) => {
    // Mock data - in real implementation, you'd calculate based on actual time periods
    const baseViews = posts.reduce((sum: number, post: any) => sum + (post.viewCount || 0), 0);
    const baseComments = posts.reduce((sum: number, post: any) => sum + (post.commentCount || 0), 0);
    
    const multiplier = 1 - (index * 0.2); // Decreasing trend
    
    return {
      period,
      views: Math.round(baseViews * multiplier),
      likes: 0, // This query does not provide per-period likes.
      comments: Math.round(baseComments * multiplier)
    };
  });
} 