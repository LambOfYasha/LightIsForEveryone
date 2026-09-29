'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';

interface NotificationIconProps {
  userId: string;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  createdAt: string;
  type: string;
}

export default function SimpleNotificationIcon({ userId }: NotificationIconProps) {
  const { toast } = useToast();
  const { user, isLoaded } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load notifications from localStorage or create initial ones
  const loadNotifications = () => {
    if (!isLoaded || !user) {
      setNotifications([]);
      return;
    }

    setIsLoading(true);
    try {
      const storageKey = `notifications_${user.id}`;
      const storedNotifications = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
      
      if (storedNotifications) {
        // Load existing notifications from localStorage
        setNotifications(JSON.parse(storedNotifications));
      } else {
        // Create initial mock notifications only if none exist
        const mockNotifications: Notification[] = [
          {
            _id: '1',
            title: 'Welcome!',
            message: 'Welcome to the platform. We hope you enjoy your experience.',
            severity: 'info',
            isRead: false,
            createdAt: new Date().toISOString(),
            type: 'system'
          },
          {
            _id: '2',
            title: 'System Update',
            message: 'We have updated our system with new features.',
            severity: 'success',
            isRead: false,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            type: 'system'
          }
        ];
        
        setNotifications(mockNotifications);
        if (typeof window !== 'undefined') window.localStorage.setItem(storageKey, JSON.stringify(mockNotifications));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save notifications to localStorage
  const saveNotifications = (newNotifications: Notification[]) => {
    if (user) {
      const storageKey = `notifications_${user.id}`;
      if (typeof window !== 'undefined') window.localStorage.setItem(storageKey, JSON.stringify(newNotifications));
    }
  };

  useEffect(() => {
    // Only load notifications if user is authenticated
    if (isLoaded && user) {
      loadNotifications();
    } else if (!isLoaded || !user) {
      setNotifications([]);
    }
  }, [isLoaded, user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (notificationId: string) => {
    const updatedNotifications = notifications.map(n => 
      n._id === notificationId ? { ...n, isRead: true } : n
    );
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
    
    toast({
      title: 'Success',
      description: 'Notification marked as read',
    });
  };

  const handleMarkAllAsRead = async () => {
    const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
    
    toast({
      title: 'Success',
      description: 'All notifications marked as read',
    });
  };

  const handleDeleteNotification = async (notificationId: string) => {
    const updatedNotifications = notifications.filter(n => n._id !== notificationId);
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
    
    toast({
      title: 'Success',
      description: 'Notification deleted',
    });
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

  // Don't render the notification icon if user is not loaded or not authenticated
  if (!isLoaded || !user) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
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

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
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
        </div>
      )}
    </div>
  );
} 