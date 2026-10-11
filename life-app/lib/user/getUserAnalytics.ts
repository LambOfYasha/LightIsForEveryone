import { defineQuery } from "groq";
import { client } from "@/sanity/lib/client";
import { getUser } from "./getUser";

export interface UserAnalytics {
  posts: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    thisMonth: number;
    thisYear: number;
    averageLength: number;
    mostActiveMonth: string;
  };
  comments: {
    total: number;
    thisMonth: number;
    thisYear: number;
    averageLength: number;
    mostActiveMonth: string;
  };
  engagement: {
    totalViews: number;
    totalFavorites: number;
    responseRate: number;
  };
  activity: {
    lastActivity: string;
    mostActiveDay: string;
    activityStreak: number;
  };
}

export async function getUserAnalytics(): Promise<UserAnalytics | { error: string }> {
  try {
    const user = await getUser();
    
    if ("error" in user) {
      return { error: user.error };
    }

    // Get posts analytics
    const postsAnalyticsQuery = defineQuery(`
      {
        "total": count(*[_type == "post" && author._ref == $userId && (isDeleted == false || isDeleted == null)]),
        "approved": count(*[_type == "post" && author._ref == $userId && isApproved == true && (isDeleted == false || isDeleted == null)]),
        "pending": count(*[_type == "post" && author._ref == $userId && isApproved == false && (isDeleted == false || isDeleted == null)]),
        "rejected": count(*[_type == "post" && author._ref == $userId && isApproved == false && isRejected == true && (isDeleted == false || isDeleted == null)]),
        "thisMonth": count(*[_type == "post" && author._ref == $userId && publishedAt >= $startOfMonth && (isDeleted == false || isDeleted == null)]),
        "thisYear": count(*[_type == "post" && author._ref == $userId && publishedAt >= $startOfYear && (isDeleted == false || isDeleted == null)]),
        "posts": *[_type == "post" && author._ref == $userId && (isDeleted == false || isDeleted == null)] {
          publishedAt,
          body
        }
      }
    `);

    // Get comments analytics
    const commentsAnalyticsQuery = defineQuery(`
      {
        "total": count(*[_type == "comment" && author._ref == $userId && (isDeleted == false || isDeleted == null)]),
        "thisMonth": count(*[_type == "comment" && author._ref == $userId && publishedAt >= $startOfMonth && (isDeleted == false || isDeleted == null)]),
        "thisYear": count(*[_type == "comment" && author._ref == $userId && publishedAt >= $startOfYear && (isDeleted == false || isDeleted == null)]),
        "comments": *[_type == "comment" && author._ref == $userId && (isDeleted == false || isDeleted == null)] {
          publishedAt,
          body
        }
      }
    `);

    // Get engagement analytics
    const engagementQuery = defineQuery(`
      {
        "totalFavorites": count(*[_type == "favorite" && post->author._ref == $userId && (post->isDeleted == false || post->isDeleted == null)]),
        "posts": *[_type == "post" && author._ref == $userId && (isDeleted == false || isDeleted == null)] {
          viewCount,
          favoriteCount,
          rating
        }
      }
    `);

    // Calculate date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();

    // Execute queries
    const [postsData, commentsData, engagementData] = await Promise.all([
      client.fetch(postsAnalyticsQuery, { 
        userId: user._id, 
        startOfMonth, 
        startOfYear 
      }),
      client.fetch(commentsAnalyticsQuery, { 
        userId: user._id, 
        startOfMonth, 
        startOfYear 
      }),
      client.fetch(engagementQuery, { userId: user._id })
    ]);

    // Calculate averages and analytics
    const posts = postsData.posts || [];
    const comments = commentsData.comments || [];
    
    // Calculate average post length
    const totalPostLength = posts.reduce((sum: number, post: any) => {
      return sum + (post.body ? post.body.length : 0);
    }, 0);
    const averagePostLength = posts.length > 0 ? Math.round(totalPostLength / posts.length) : 0;

    // Calculate average comment length
    const totalCommentLength = comments.reduce((sum: number, comment: any) => {
      return sum + (comment.body ? comment.body.length : 0);
    }, 0);
    const averageCommentLength = comments.length > 0 ? Math.round(totalCommentLength / comments.length) : 0;

    // Calculate most active month for posts
    const postMonths: number[] = posts.map((post: any) => new Date(post.publishedAt).getMonth());
    const mostActivePostMonth = postMonths.length > 0 
      ? new Date(2024, postMonths.reduce((a: number, b: number) => 
          postMonths.filter(v => v === a).length >= postMonths.filter(v => v === b).length ? a : b
        )).toLocaleDateString('en-US', { month: 'long' })
      : 'No activity';

    // Calculate most active month for comments
    const commentMonths: number[] = comments.map((comment: any) => new Date(comment.publishedAt).getMonth());
    const mostActiveCommentMonth = commentMonths.length > 0 
      ? new Date(2024, commentMonths.reduce((a: number, b: number) => 
          commentMonths.filter(v => v === a).length >= commentMonths.filter(v => v === b).length ? a : b
        )).toLocaleDateString('en-US', { month: 'long' })
      : 'No activity';

    // Calculate engagement metrics
    const engagementPosts = engagementData.posts || [];
    const totalViews = engagementPosts.reduce((sum: number, post: any) => sum + (post.viewCount || 0), 0);
    const totalFavorites = engagementData.totalFavorites || 0;

    // Calculate response rate (posts with comments)
    const postsWithComments = posts.filter((post: any) => post.commentCount > 0).length;
    const responseRate = posts.length > 0 ? Math.round((postsWithComments / posts.length) * 100) : 0;

    // Get last activity
    const allActivities = [...posts, ...comments].sort((a: any, b: any) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    const lastActivity = allActivities.length > 0 
      ? new Date(allActivities[0].publishedAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'No activity';

    const analytics: UserAnalytics = {
      posts: {
        total: postsData.total || 0,
        approved: postsData.approved || 0,
        pending: postsData.pending || 0,
        rejected: postsData.rejected || 0,
        thisMonth: postsData.thisMonth || 0,
        thisYear: postsData.thisYear || 0,
        averageLength: averagePostLength,
        mostActiveMonth: mostActivePostMonth,
      },
      comments: {
        total: commentsData.total || 0,
        thisMonth: commentsData.thisMonth || 0,
        thisYear: commentsData.thisYear || 0,
        averageLength: averageCommentLength,
        mostActiveMonth: mostActiveCommentMonth,
      },
      engagement: {
        totalViews,
        totalFavorites,
        responseRate,
      },
      activity: {
        lastActivity,
        mostActiveDay: 'Monday', // This would need more complex calculation
        activityStreak: 0, // This would need more complex calculation
      },
    };

    return analytics;
  } catch (error) {
    console.error("Error getting user analytics:", error);
    return { error: "Failed to get user analytics" };
  }
} 