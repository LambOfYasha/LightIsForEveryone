'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';

// Import notification actions with error handling
let notificationActions;
try {
  notificationActions = require('@/action/notificationActions');
} catch (error) {
  console.error('Failed to import notification actions:', error);
  notificationActions = {
    getUserNotifications: async () => ({ success: false, error: 'Notification actions not available' }),
    markNotificationAsRead: async () => ({ success: false, error: 'Notification actions not available' }),
    markAllNotificationsAsRead: async () => ({ success: false, error: 'Notification actions not available' }),
    deleteNotification: async () => ({ success: false, error: 'Notification actions not available' }),
  };
}

// Try to import Radix UI popover, fallback to simple popover
let Popover, PopoverContent, PopoverTrigger;
try {
  const popoverModule = require('@/components/ui/popover');
  Popover = popoverModule.Popover;
  PopoverContent = popoverModule.PopoverContent;
  PopoverTrigger = popoverModule.PopoverTrigger;
} catch (error) {
  console.error('Failed to import Radix popover, using simple popover:', error);
  const simplePopoverModule = require('@/components/ui/simple-popover');
  Popover = simplePopoverModule.Popover;
  PopoverContent = simplePopoverModule.PopoverContent;
  PopoverTrigger = simplePopoverModule.PopoverTrigger;
}

interface NotificationIconProps {
  userId: string;
}

export default function NotificationIcon({ userId }: NotificationIconProps) {
  const { toast } = useToast();
  const { user, isLoaded } = useUser();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    // Don't load notifications if user is not authenticated
    if (!isLoaded || !user) {
      console.log('User not loaded or not authenticated, clearing notifications');
      setNotifications([]);
      setError(null);
      return;
    }

    console.log('Loading notifications for user:', user.id);
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await notificationActions.getUserNotifications(10, true); // Get 10 unread notifications
      console.log('Notification load result:', result);
      
      if (result.success) {
        setNotifications(result.notifications || []);
        console.log('Set notifications:', result.notifications?.length || 0);
      } else {
        // Handle authentication errors gracefully - don't log them as errors
        if (result.error?.includes('Please sign in') || result.error?.includes('User not authenticated')) {
          // This is expected behavior when user is not authenticated
          console.log('Authentication error, clearing notifications');
          setNotifications([]);
          return;
        }
        // Only log actual errors, not authentication issues
        console.warn('Failed to load notifications:', result.error);
        setError(result.error);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      // Only log unexpected errors, not authentication issues
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        const isAuthError = errorMessage.includes('please sign in') || 
                           errorMessage.includes('user not authenticated') ||
                           errorMessage.includes('unauthorized') ||
                           errorMessage.includes('authentication') ||
                           errorMessage.includes('not authenticated');
        
        if (!isAuthError) {
          console.error('Error loading notifications:', error);
        }
      }
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only load notifications if user is authenticated
    if (isLoaded && user) {
      console.log('User loaded and authenticated, loading notifications');
      loadNotifications();
      // Refresh notifications every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      console.log('User not loaded or not authenticated, clearing notifications');
      setNotifications([]);
      setError(null);
    }
  }, [isLoaded, user]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const result = await notificationActions.markNotificationAsRead(notificationId);
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => 
            n._id === notificationId ? { ...n, isRead: true } : n
          )
        );
        toast({
          title: 'Success',
          description: 'Notification marked as read',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to mark notification as read',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await notificationActions.markAllNotificationsAsRead();
      if (result.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast({
          title: 'Success',
          description: `${result.count} notifications marked as read`,
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to mark all notifications as read',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const result = await notificationActions.deleteNotification(notificationId);
      if (result.success) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        toast({
          title: 'Success',
          description: 'Notification deleted',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete notification',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      });
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'success':
        return 'default';
      default:
        return 'outline';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  console.log('Current notifications:', notifications.length, 'Unread:', unreadCount);

  // Don't render the notification icon if user is not loaded or not authenticated
  if (!isLoaded || !user) {
    console.log('Not rendering notification icon - user not loaded or not authenticated');
    return null;
  }

  // If there's an error, show a simple error state
  if (error) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => toast({
          title: 'Notification Error',
          description: error,
          variant: 'destructive',
        })}
      >
        <Bell className="h-5 w-5 text-red-500" />
      </Button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-96 overflow-y-auto" align="end">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Notifications</CardTitle>
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                Mark all read
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          ) : notifications.length > 0 ? (
            notifications.slice(0, 5).map((notification) => (
              <Card key={notification._id} className={!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                        {!notification.isRead && (
                          <Badge variant="secondary" className="text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-xs line-clamp-2">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                        <Badge variant={getSeverityVariant(notification.severity)} className="text-xs">
                          {notification.severity}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      {!notification.isRead && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() => handleMarkAsRead(notification._id)}
                        >
                          ✓
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-6 w-6 p-0 text-red-600"
                        onClick={() => handleDeleteNotification(notification._id)}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No new notifications</p>
            </div>
          )}
          {notifications.length > 5 && (
            <div className="text-center pt-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/manage/advanced-moderation?tab=notifications">
                  View all notifications
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </PopoverContent>
    </Popover>
  );
} 