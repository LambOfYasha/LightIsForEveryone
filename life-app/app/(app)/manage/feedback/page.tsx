'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Filter,
  Calendar,
  User,
  Reply,
  Eye,
  Trash2,
  Star,
  TrendingUp
} from 'lucide-react';
import { searchFeedback, updateFeedback, deleteFeedback, getFeedbackStats } from '@/action/feedbackActions';
import { sendFeedbackUpdatedNotification, sendFeedbackResponseNotification } from '@/action/feedbackNotificationActions';
import { useToast } from '@/hooks/use-toast';
import { RoleGuard } from '@/components/auth/RoleGuard';

interface Feedback {
  _id: string;
  title: string;
  content: string;
  category: string;
  status: 'new' | 'under_review' | 'in_progress' | 'implemented' | 'rejected' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  isAnonymous: boolean;
  adminResponse?: string;
  adminResponseAt?: string;
  assignedTo?: string;
  tags?: string[];
}

interface FeedbackStats {
  total: number;
  new: number;
  underReview: number;
  inProgress: number;
  implemented: number;
  rejected: number;
  closed: number;
  byCategory: string[];
  byPriority: string[];
}

export default function AdminFeedbackPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [updating, setUpdating] = useState(false);

  // Load feedback and stats on component mount
  useEffect(() => {
    loadFeedback();
    loadStats();
  }, []);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const result = await searchFeedback({
        search: searchQuery,
        status: statusFilter === 'all' ? undefined : statusFilter,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        priority: priorityFilter === 'all' ? undefined : priorityFilter
      });

      if (result.success && result.feedback) {
        setFeedback(result.feedback);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load feedback",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
      toast({
        title: "Error",
        description: "Failed to load feedback",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await getFeedbackStats();
      if (result.success && result.stats) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleStatusUpdate = async (feedbackId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const result = await updateFeedback(feedbackId, { status: newStatus as any });
      
      if (result.success) {
        // Send notification to user if they have a userId
        const feedbackItem = feedback.find(f => f._id === feedbackId);
        if (feedbackItem?.userId) {
          await sendFeedbackUpdatedNotification(
            feedbackId,
            feedbackItem.title,
            feedbackItem.category,
            feedbackItem.userId,
            newStatus as any
          );
        }

        toast({
          title: "Success",
          description: "Feedback status updated successfully",
        });
        loadFeedback();
        loadStats();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update feedback status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating feedback status:', error);
      toast({
        title: "Error",
        description: "Failed to update feedback status",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleResponseSubmit = async () => {
    if (!selectedFeedback || !adminResponse.trim()) return;

    setUpdating(true);
    try {
      const result = await updateFeedback(selectedFeedback._id, { 
        adminResponse: adminResponse.trim(),
        adminResponseAt: new Date().toISOString()
      });
      
      if (result.success) {
        // Send notification to user if they have a userId
        if (selectedFeedback.userId) {
          await sendFeedbackResponseNotification(
            selectedFeedback._id,
            selectedFeedback.title,
            selectedFeedback.category,
            selectedFeedback.userId,
            adminResponse.trim()
          );
        }

        toast({
          title: "Success",
          description: "Response sent successfully",
        });
        setAdminResponse('');
        setSelectedFeedback(null);
        loadFeedback();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send response",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending response:', error);
      toast({
        title: "Error",
        description: "Failed to send response",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (feedbackId: string) => {
    if (!confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await deleteFeedback(feedbackId);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Feedback deleted successfully",
        });
        loadFeedback();
        loadStats();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete feedback",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to delete feedback",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      new: 'default',
      under_review: 'secondary',
      in_progress: 'outline',
      implemented: 'default',
      rejected: 'destructive',
      closed: 'secondary'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'outline',
      medium: 'default',
      high: 'destructive',
      critical: 'destructive'
    } as const;

    return (
      <Badge variant={variants[priority as keyof typeof variants] || 'default'}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <RoleGuard allowedRoles={['admin', 'moderator']}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold mb-2">Feedback Management</h1>
            <p className="text-muted-foreground">
              Manage and respond to user feedback
            </p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Feedback</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">New</p>
                      <p className="text-2xl font-bold">{stats.new}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Implemented</p>
                      <p className="text-2xl font-bold">{stats.implemented}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Closed</p>
                      <p className="text-2xl font-bold">{stats.closed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search feedback..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="implemented">Implemented</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="ui_ux">UI/UX</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="accessibility">Accessibility</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4">
                <Button onClick={loadFeedback} disabled={loading}>
                  {loading ? 'Loading...' : 'Apply Filters'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Feedback List */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback ({feedback.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading feedback...</p>
                </div>
              ) : feedback.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No feedback found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedback.map((item) => (
                    <Card key={item._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{item.title}</h3>
                              {getStatusBadge(item.status)}
                              {getPriorityBadge(item.priority)}
                            </div>
                            
                            <p className="text-muted-foreground mb-3 line-clamp-2">
                              {item.content}
                            </p>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {item.isAnonymous ? 'Anonymous' : (item.userName || 'Unknown')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(item.createdAt)}
                              </div>
                              <Badge variant="outline">{item.category}</Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedFeedback(item)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            <Select
                              value={item.status}
                              onValueChange={(value) => handleStatusUpdate(item._id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="under_review">Under Review</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="implemented">Implemented</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(item._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback Detail Modal */}
          {selectedFeedback && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedFeedback.title}</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFeedback(null)}
                    >
                      Close
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedFeedback.status)}
                    {getPriorityBadge(selectedFeedback.priority)}
                    <Badge variant="outline">{selectedFeedback.category}</Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Content:</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {selectedFeedback.content}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Submitted by:</span>
                      <p className="text-muted-foreground">
                        {selectedFeedback.isAnonymous ? 'Anonymous' : (selectedFeedback.userName || 'Unknown')}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>
                      <p className="text-muted-foreground">
                        {selectedFeedback.userEmail || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>
                      <p className="text-muted-foreground">
                        {formatDate(selectedFeedback.createdAt)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Updated:</span>
                      <p className="text-muted-foreground">
                        {formatDate(selectedFeedback.updatedAt)}
                      </p>
                    </div>
                  </div>
                  
                  {selectedFeedback.adminResponse && (
                    <div>
                      <h4 className="font-medium mb-2">Admin Response:</h4>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {selectedFeedback.adminResponse}
                      </p>
                      {selectedFeedback.adminResponseAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Response sent: {formatDate(selectedFeedback.adminResponseAt)}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium mb-2">Send Response:</h4>
                    <Textarea
                      placeholder="Type your response here..."
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      rows={4}
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        onClick={handleResponseSubmit}
                        disabled={updating || !adminResponse.trim()}
                      >
                        {updating ? 'Sending...' : 'Send Response'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
