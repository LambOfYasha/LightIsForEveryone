'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  Ban,
  Eye,
  MessageSquare,
  Users,
  TrendingDown,
  TrendingUp,
  Activity,
  Flag,
  Clock,
  User,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getImageUrl } from '@/lib/utils';

export interface ModerationReport {
  _id: string;
  communityId: string;
  communityTitle: string;
  reporterId: string;
  reporterName: string;
  reportType: 'spam' | 'inappropriate' | 'harassment' | 'other';
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  action?: string;
}

export interface CommunityHealth {
  _id: string;
  title: string;
  healthScore: number;
  reportCount: number;
  activeReports: number;
  memberGrowth: number;
  postGrowth: number;
  lastActivity: string;
  moderatorActivity: number;
}

export default function CommunityModeration() {
  const { toast } = useToast();
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [communityHealth, setCommunityHealth] = useState<CommunityHealth[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadModerationData();
  }, []);

  const loadModerationData = async () => {
    setLoading(true);
    try {
      // Load reports and community health data
      // This would be implemented with actual API calls
      const mockReports: ModerationReport[] = [
        {
          _id: '1',
          communityId: 'community1',
          communityTitle: 'Biblical Studies',
          reporterId: 'user1',
          reporterName: 'John Doe',
          reportType: 'inappropriate',
          description: 'Inappropriate content in recent post',
          status: 'pending',
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          _id: '2',
          communityId: 'community2',
          communityTitle: 'Spiritual Life',
          reporterId: 'user2',
          reporterName: 'Jane Smith',
          reportType: 'spam',
          description: 'Multiple spam posts detected',
          createdAt: '2024-01-15T10:45:00Z',
          status: 'reviewed',
          reviewedAt: '2024-01-15T11:00:00Z',
          reviewedBy: 'admin1',
          action: 'warned'
        }
      ];

      const mockHealth: CommunityHealth[] = [
        {
          _id: 'community1',
          title: 'Biblical Studies',
          healthScore: 85,
          reportCount: 2,
          activeReports: 1,
          memberGrowth: 12,
          postGrowth: 8,
          lastActivity: '2024-01-15T12:00:00Z',
          moderatorActivity: 95
        },
        {
          _id: 'community2',
          title: 'Spiritual Life',
          healthScore: 72,
          reportCount: 5,
          activeReports: 2,
          memberGrowth: -3,
          postGrowth: 15,
          lastActivity: '2024-01-15T11:30:00Z',
          moderatorActivity: 60
        }
      ];

      setReports(mockReports);
      setCommunityHealth(mockHealth);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load moderation data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: string, status: string) => {
    try {
      // This would be implemented with actual API call
      console.log('Taking action on report:', reportId, action, status);
      
      toast({
        title: 'Success',
        description: 'Report action completed successfully',
      });
      
      loadModerationData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process report action',
        variant: 'destructive',
      });
    }
  };

  const getReportTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'spam': return 'destructive';
      case 'inappropriate': return 'secondary';
      case 'harassment': return 'destructive';
      case 'other': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'reviewed': return 'secondary';
      case 'resolved': return 'default';
      case 'dismissed': return 'outline';
      default: return 'outline';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredReports = reports.filter(report => {
    if (filterStatus !== 'all' && report.status !== filterStatus) return false;
    if (filterType !== 'all' && report.reportType !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Community Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Community Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {communityHealth.map((community) => (
              <div key={community._id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{community.title}</h3>
                  <Badge variant={community.healthScore >= 80 ? 'default' : community.healthScore >= 60 ? 'secondary' : 'destructive'}>
                    {community.healthScore}/100
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Reports:</span>
                    <span className={community.reportCount > 3 ? 'text-red-600' : 'text-gray-600'}>
                      {community.reportCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Reports:</span>
                    <span className={community.activeReports > 0 ? 'text-red-600' : 'text-gray-600'}>
                      {community.activeReports}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Member Growth:</span>
                    <span className={community.memberGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                      {community.memberGrowth > 0 ? '+' : ''}{community.memberGrowth}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Moderator Activity:</span>
                    <span className={community.moderatorActivity >= 80 ? 'text-green-600' : 'text-yellow-600'}>
                      {community.moderatorActivity}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reports Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5" />
              Moderation Reports ({filteredReports.length})
            </CardTitle>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="inappropriate">Inappropriate</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Community</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-2"></div>
                        Loading reports...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Flag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">No reports found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => (
                    <TableRow key={report._id}>
                      <TableCell>
                        <div className="font-medium">{report.communityTitle}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback>
                              <User className="w-3 h-3" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{report.reporterName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getReportTypeBadgeVariant(report.reportType)}>
                          {report.reportType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(report.status)}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-gray-500" />
                          {new Date(report.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedReport(report);
                              setShowReportDialog(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {report.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleReportAction(report._id, 'warn', 'reviewed')}
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleReportAction(report._id, 'ban', 'resolved')}
                              >
                                <Ban className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Report Details Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Community</label>
                  <p className="text-sm text-gray-600">{selectedReport.communityTitle}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Reporter</label>
                  <p className="text-sm text-gray-600">{selectedReport.reporterName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Report Type</label>
                  <Badge variant={getReportTypeBadgeVariant(selectedReport.reportType)}>
                    {selectedReport.reportType}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge variant={getStatusBadgeVariant(selectedReport.status)}>
                    {selectedReport.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Reported On</label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedReport.createdAt).toLocaleString()}
                  </p>
                </div>
                {selectedReport.reviewedAt && (
                  <div>
                    <label className="text-sm font-medium">Reviewed On</label>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedReport.reviewedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-gray-600 mt-1">{selectedReport.description}</p>
              </div>

              {selectedReport.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => {
                      handleReportAction(selectedReport._id, 'warn', 'reviewed');
                      setShowReportDialog(false);
                    }}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Warn User
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      handleReportAction(selectedReport._id, 'dismiss', 'dismissed');
                      setShowReportDialog(false);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Dismiss Report
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Ban className="w-4 h-4 mr-2" />
                        Ban User
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Ban User</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to ban this user? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => {
                            handleReportAction(selectedReport._id, 'ban', 'resolved');
                            setShowReportDialog(false);
                          }}
                        >
                          Ban User
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 