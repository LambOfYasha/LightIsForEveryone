'use server';

import { auth } from '@clerk/nextjs/server';
import { getUser } from '@/lib/user/getUser';
import { client } from '@/sanity/lib/client';
import { adminClient } from '@/sanity/lib/adminClient';
import { sendFeedbackCreatedNotification } from './feedbackNotificationActions';

export interface FeedbackData {
  _id?: string;
  title: string;
  content: string;
  category: 'general' | 'bug' | 'feature' | 'ui_ux' | 'content' | 'performance' | 'accessibility' | 'other';
  status?: 'new' | 'under_review' | 'in_progress' | 'implemented' | 'rejected' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  userEmail?: string;
  userName?: string;
  isAnonymous?: boolean;
  adminResponse?: string;
  adminResponseAt?: string;
  assignedTo?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FeedbackFilters {
  status?: string;
  category?: string;
  priority?: string;
  assignedTo?: string;
  isAnonymous?: boolean;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function createFeedback(feedbackData: Omit<FeedbackData, '_id' | 'createdAt' | 'updatedAt'>) {
  try {
    const { userId } = await auth();
    
    // If user is signed in, get their details
    let userDetails = {
      userId: undefined as string | undefined,
      userEmail: undefined as string | undefined,
      userName: undefined as string | undefined,
    };

    if (userId && !feedbackData.isAnonymous) {
      const userResult = await getUser();
      if ('_id' in userResult) {
        userDetails = {
          userId: userResult._id,
          userEmail: userResult.email,
          userName: userResult.username,
        };
      }
    }

    const now = new Date().toISOString();
    
    const feedback = {
      _type: 'feedback',
      title: feedbackData.title,
      content: feedbackData.content,
      category: feedbackData.category,
      status: feedbackData.status || 'new',
      priority: feedbackData.priority || 'medium',
      userId: userDetails.userId,
      userEmail: feedbackData.userEmail || userDetails.userEmail,
      userName: feedbackData.userName || userDetails.userName,
      isAnonymous: feedbackData.isAnonymous || false,
      tags: feedbackData.tags || [],
      createdAt: now,
      updatedAt: now,
    };

    const result = await adminClient.create(feedback);
    
    // Send notification
    await sendFeedbackCreatedNotification(
      result._id,
      feedback.title,
      feedback.category,
      feedback.priority,
      userDetails.userId,
      userDetails.userName,
      userDetails.userEmail
    );
    
    return { 
      success: true, 
      feedback: { 
        _id: result._id, 
        ...feedback 
      } 
    };
  } catch (error: any) {
    console.error('Create feedback error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create feedback' 
    };
  }
}

export async function getFeedback(feedbackId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      return { success: false, error: 'User not found' };
    }

    const feedback = await client.fetch(
      `*[_type == "feedback" && _id == $feedbackId][0]`,
      { feedbackId }
    );

    if (!feedback) {
      return { success: false, error: 'Feedback not found' };
    }

    // Check if user can view this feedback (admin or the author)
    const isAdmin = userResult.role === 'admin';
    const isAuthor = feedback.userId === userResult._id;

    if (!isAdmin && !isAuthor) {
      return { success: false, error: 'Access denied' };
    }

    return { success: true, feedback };
  } catch (error: any) {
    console.error('Get feedback error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to fetch feedback' 
    };
  }
}

export async function updateFeedback(feedbackId: string, updates: Partial<FeedbackData>) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      return { success: false, error: 'User not found' };
    }

    // Check if user is admin
    if (userResult.role !== 'admin') {
      return { success: false, error: 'Admin access required' };
    }

    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // If admin is responding, set the response timestamp
    if (updates.adminResponse && !updates.adminResponseAt) {
      updateData.adminResponseAt = new Date().toISOString();
    }

    const result = await adminClient
      .patch(feedbackId)
      .set(updateData)
      .commit();

    return { success: true, feedback: result };
  } catch (error: any) {
    console.error('Update feedback error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to update feedback' 
    };
  }
}

export async function deleteFeedback(feedbackId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      return { success: false, error: 'User not found' };
    }

    // Check if user is admin
    if (userResult.role !== 'admin') {
      return { success: false, error: 'Admin access required' };
    }

    await adminClient.delete(feedbackId);
    
    return { success: true };
  } catch (error: any) {
    console.error('Delete feedback error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to delete feedback' 
    };
  }
}

export async function searchFeedback(filters: FeedbackFilters = {}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      return { success: false, error: 'User not found' };
    }

    // Build query based on user role
    let query = '*[_type == "feedback"';
    const params: any = {};

    // Non-admin users can only see their own feedback
    if (userResult.role !== 'admin') {
      query += ' && userId == $userId';
      params.userId = userResult._id;
    }

    // Apply filters
    if (filters.status) {
      query += ' && status == $status';
      params.status = filters.status;
    }

    if (filters.category) {
      query += ' && category == $category';
      params.category = filters.category;
    }

    if (filters.priority) {
      query += ' && priority == $priority';
      params.priority = filters.priority;
    }

    if (filters.assignedTo) {
      query += ' && assignedTo == $assignedTo';
      params.assignedTo = filters.assignedTo;
    }

    if (filters.isAnonymous !== undefined) {
      query += ' && isAnonymous == $isAnonymous';
      params.isAnonymous = filters.isAnonymous;
    }

    if (filters.dateFrom) {
      query += ' && createdAt >= $dateFrom';
      params.dateFrom = filters.dateFrom;
    }

    if (filters.dateTo) {
      query += ' && createdAt <= $dateTo';
      params.dateTo = filters.dateTo;
    }

    if (filters.search) {
      query += ' && (title match $search || content match $search)';
      params.search = `*${filters.search}*`;
    }

    query += '] | order(createdAt desc)';

    const feedback = await client.fetch(query, params);
    
    return { success: true, feedback };
  } catch (error: any) {
    console.error('Search feedback error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to search feedback' 
    };
  }
}

export async function getFeedbackStats() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Authentication required' };
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      return { success: false, error: 'User not found' };
    }

    // Check if user is admin
    if (userResult.role !== 'admin') {
      return { success: false, error: 'Admin access required' };
    }

    const stats = await client.fetch(`
      {
        "total": count(*[_type == "feedback"]),
        "new": count(*[_type == "feedback" && status == "new"]),
        "underReview": count(*[_type == "feedback" && status == "under_review"]),
        "inProgress": count(*[_type == "feedback" && status == "in_progress"]),
        "implemented": count(*[_type == "feedback" && status == "implemented"]),
        "rejected": count(*[_type == "feedback" && status == "rejected"]),
        "closed": count(*[_type == "feedback" && status == "closed"]),
        "byCategory": array::unique(*[_type == "feedback"].category),
        "byPriority": array::unique(*[_type == "feedback"].priority)
      }
    `);

    return { success: true, stats };
  } catch (error: any) {
    console.error('Get feedback stats error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to fetch feedback stats' 
    };
  }
}
