import { client } from './client'
import { adminClient } from './adminClient'

export interface Notification {
  _id: string;
  type: 'moderation' | 'appeal' | 'guideline' | 'system' | 'bulk' | 'feedback';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  recipientId: string;
  recipientRole: 'user' | 'teacher' | 'admin';
  data?: {
    contentId?: string;
    contentType?: string;
    appealId?: string;
    guidelineId?: string;
    batchId?: string;
    testMessage?: string;
    userName?: string;
    userEmail?: string;
    adminResponse?: string;
    feedbackId?: string;
    feedbackTitle?: string;
    feedbackCategory?: string;
    feedbackPriority?: string;
  };
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
}

export async function createNotification(notification: Omit<Notification, '_id' | 'createdAt'>): Promise<Notification> {
  const doc = await adminClient.create({
    _type: 'notification',
    type: notification.type,
    title: notification.title,
    message: notification.message,
    severity: notification.severity,
    recipientId: notification.recipientId,
    recipientRole: notification.recipientRole,
    isRead: notification.isRead,
    data: notification.data,
    expiresAt: notification.expiresAt,
  })

  return {
    _id: doc._id,
    type: doc.type,
    title: doc.title,
    message: doc.message,
    severity: doc.severity,
    recipientId: doc.recipientId,
    recipientRole: doc.recipientRole,
    data: doc.data,
    isRead: doc.isRead,
    createdAt: doc._createdAt,
    expiresAt: doc.expiresAt,
  }
}

export async function getUserNotifications(
  userId: string,
  limit: number = 50,
  unreadOnly: boolean = false
): Promise<Notification[]> {
  let query = `*[_type == "notification" && recipientId == $userId]`
  
  if (unreadOnly) {
    query += ` && isRead == false`
  }
  
  query += ` | order(_createdAt desc) [0...$limit]`

  try {
    const notifications = await client.fetch(query, { userId, limit })
    
    // Ensure we always return an array, even if the query returns null
    if (!notifications || !Array.isArray(notifications)) {
      return []
    }
    
    return notifications.map((notification: any) => ({
      _id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      severity: notification.severity,
      recipientId: notification.recipientId,
      recipientRole: notification.recipientRole,
      data: notification.data,
      isRead: notification.isRead,
      createdAt: notification._createdAt,
      expiresAt: notification.expiresAt,
    }))
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

export async function markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
  try {
    await adminClient
      .patch(notificationId)
      .set({ isRead: true })
      .commit()
    return true
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return false
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  try {
    const notifications = await client.fetch(
      `*[_type == "notification" && recipientId == $userId && isRead == false]`,
      { userId }
    )
    
    if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
      return 0
    }

    const transaction = adminClient.transaction()
    notifications.forEach((notification: any) => {
      transaction.patch(notification._id, { set: { isRead: true } })
    })
    
    await transaction.commit()
    return notifications.length
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return 0
  }
}

export async function deleteNotification(notificationId: string, userId: string): Promise<boolean> {
  try {
    await adminClient.delete(notificationId)
    return true
  } catch (error) {
    console.error('Error deleting notification:', error)
    return false
  }
}

export async function getNotificationStats(userId: string): Promise<{
  total: number;
  unread: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
}> {
  try {
    const notifications = await client.fetch(
      `*[_type == "notification" && recipientId == $userId]`,
      { userId }
    )

    // Ensure we have an array
    if (!notifications || !Array.isArray(notifications)) {
      return {
        total: 0,
        unread: 0,
        byType: {},
        bySeverity: {}
      }
    }

    const unread = notifications.filter((n: any) => !n.isRead).length
    const byType: Record<string, number> = {}
    const bySeverity: Record<string, number> = {}

    notifications.forEach((notification: any) => {
      byType[notification.type] = (byType[notification.type] || 0) + 1
      bySeverity[notification.severity] = (bySeverity[notification.severity] || 0) + 1
    })

    return {
      total: notifications.length,
      unread,
      byType,
      bySeverity,
    }
  } catch (error) {
    console.error('Error getting notification stats:', error)
    return {
      total: 0,
      unread: 0,
      byType: {},
      bySeverity: {}
    }
  }
} 