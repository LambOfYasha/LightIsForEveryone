'use server';

import { createNotification } from '@/sanity/lib/notifications';

export async function sendFeedbackCreatedNotification(
  feedbackId: string,
  feedbackTitle: string,
  feedbackCategory: string,
  feedbackPriority: string,
  userId?: string,
  userName?: string,
  userEmail?: string
) {
  try {
    // Notify all admins about new feedback
    const adminNotification = await createNotification({
      isRead: false,
      type: 'system',
      title: 'New Feedback Received',
      message: `New ${feedbackCategory} feedback: "${feedbackTitle}"`,
      severity: feedbackPriority === 'critical' ? 'error' : feedbackPriority === 'high' ? 'warning' : 'info',
      recipientId: 'admin', // Special ID for all admins
      recipientRole: 'admin',
      data: {
        feedbackId,
        feedbackTitle,
        feedbackCategory,
        feedbackPriority,
        userName,
        userEmail,
      }
    });

    // If user is signed in, notify them that their feedback was received
    if (userId) {
      const userNotification = await createNotification({
        isRead: false,
      type: 'system',
        title: 'Feedback Received',
        message: `Thank you for your feedback: "${feedbackTitle}". We'll review it and get back to you.`,
        severity: 'success',
        recipientId: userId,
        recipientRole: 'user',
        data: {
          feedbackId,
          feedbackTitle,
          feedbackCategory,
        }
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error('Send feedback created notification error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send notification' 
    };
  }
}

export async function sendFeedbackUpdatedNotification(
  feedbackId: string,
  feedbackTitle: string,
  feedbackCategory: string,
  userId: string,
  status: 'under_review' | 'in_progress' | 'implemented' | 'rejected' | 'closed',
  adminResponse?: string
) {
  try {
    let title = '';
    let message = '';
    let severity: 'info' | 'warning' | 'error' | 'success' = 'info';

    switch (status) {
      case 'under_review':
        title = 'Feedback Under Review';
        message = `Your feedback "${feedbackTitle}" is now under review.`;
        severity = 'info';
        break;
      case 'in_progress':
        title = 'Feedback In Progress';
        message = `We're working on your feedback "${feedbackTitle}".`;
        severity = 'info';
        break;
      case 'implemented':
        title = 'Feedback Implemented';
        message = `Great news! Your feedback "${feedbackTitle}" has been implemented.`;
        severity = 'success';
        break;
      case 'rejected':
        title = 'Feedback Update';
        message = `Your feedback "${feedbackTitle}" has been reviewed but won't be implemented at this time.`;
        severity = 'warning';
        break;
      case 'closed':
        title = 'Feedback Closed';
        message = `Your feedback "${feedbackTitle}" has been closed.`;
        severity = 'info';
        break;
    }

    if (adminResponse) {
      message += ` Admin response: ${adminResponse}`;
    }

    const notification = await createNotification({
      isRead: false,
      type: 'system',
      title,
      message,
      severity,
      recipientId: userId,
      recipientRole: 'user',
      data: {
        feedbackId,
        feedbackTitle,
        feedbackCategory,
        adminResponse,
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('Send feedback updated notification error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send notification' 
    };
  }
}

export async function sendFeedbackResponseNotification(
  feedbackId: string,
  feedbackTitle: string,
  feedbackCategory: string,
  userId: string,
  adminResponse: string
) {
  try {
    const notification = await createNotification({
      isRead: false,
      type: 'system',
      title: 'Response to Your Feedback',
      message: `We've responded to your feedback "${feedbackTitle}". Check it out!`,
      severity: 'info',
      recipientId: userId,
      recipientRole: 'user',
      data: {
        feedbackId,
        feedbackTitle,
        feedbackCategory,
        adminResponse,
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('Send feedback response notification error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send notification' 
    };
  }
}
