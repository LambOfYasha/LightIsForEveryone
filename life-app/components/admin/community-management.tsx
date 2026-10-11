'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Search, 
  Edit, 
  Trash2, 
  Shield, 
  Users, 
  UserPlus, 
  Filter,
  MoreHorizontal,
  Eye,
  Ban,
  CheckCircle,
  Download,
  RefreshCw,
  MessageSquare,
  Calendar,
  Tag,
  Settings,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getImageUrl } from '@/lib/utils';
import Link from 'next/link';

export interface CommunityData {
  _id: string;
  title: string;
  slug: string | { current: string };
  description?: string;
  image?: {
    asset: {
      _ref: string;
    };
    alt?: string;
  };
  moderator: {
    _id: string;
    username: string;
    imageURL?: string;
    role: string;
  };
  createdAt: string;
  isActive: boolean;
  isDeleted: boolean;
  memberCount: number;
  postCount: number;
  lastActivity?: string;
  status: 'active' | 'moderated' | 'suspended' | 'archived';
}

export interface CommunityFilters {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export default function CommunityManagement() {
  const { toast } = useToast();
  const [communities, setCommunities] = useState<CommunityData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<CommunityFilters>({
    search: '',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [showCommunityDialog, setShowCommunityDialog] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityData | null>(null);
  const [stats, setStats] = useState({
    totalCommunities: 0,
    activeCommunities: 0,
    totalMembers: 0,
    totalPosts: 0,
    averageMembersPerCommunity: 0,
    averagePostsPerCommunity: 0
  });

  const loadCommunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/admin/communities?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          toast({
            title: 'Authentication Error',
            description: errorData.error || 'Please sign in to access this feature',
            variant: 'destructive',
          });
          return;
        } else if (response.status === 403) {
          toast({
            title: 'Permission Denied',
            description: errorData.error || 'You do not have permission to access this feature',
            variant: 'destructive',
          });
          return;
        } else {
          toast({
            title: 'Error',
            description: errorData.error || 'Failed to load communities',
            variant: 'destructive',
          });
          return;
        }
      }

      const data = await response.json();

      if (data.success) {
        setCommunities(data.communities);
        setPagination(data.pagination);
        
        // Calculate stats
        const totalMembers = data.communities.reduce((sum: number, comm: CommunityData) => sum + comm.memberCount, 0);
        const totalPosts = data.communities.reduce((sum: number, comm: CommunityData) => sum + comm.postCount, 0);
        const activeCommunities = data.communities.filter((comm: CommunityData) => comm.isActive).length;
        
        setStats({
          totalCommunities: data.pagination.total,
          activeCommunities,
          totalMembers,
          totalPosts,
          averageMembersPerCommunity: data.pagination.total > 0 ? Math.round(totalMembers / data.pagination.total) : 0,
          averagePostsPerCommunity: data.pagination.total > 0 ? Math.round(totalPosts / data.pagination.total) : 0
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to load communities',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading communities:', error);
      toast({
        title: 'Error',
        description: 'Failed to load communities. Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunities();
  }, [filters]);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleFilterChange = (key: keyof CommunityFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleStatusUpdate = async (communityId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/communities', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          communityId,
          updates: { status: newStatus }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          toast({
            title: 'Authentication Error',
            description: errorData.error || 'Please sign in to access this feature',
            variant: 'destructive',
          });
          return;
        } else if (response.status === 403) {
          toast({
            title: 'Permission Denied',
            description: errorData.error || 'You do not have permission to perform this action',
            variant: 'destructive',
          });
          return;
        } else {
          toast({
            title: 'Error',
            description: errorData.error || 'Failed to update community status',
            variant: 'destructive',
          });
          return;
        }
      }

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Community status updated successfully',
        });
        loadCommunities();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update community status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating community status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update community status. Please check your connection and try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCommunity = async (communityId: string) => {
    try {
      const response = await fetch(`/api/admin/communities?id=${communityId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          toast({
            title: 'Authentication Error',
            description: errorData.error || 'Please sign in to access this feature',
            variant: 'destructive',
          });
          return;
        } else if (response.status === 403) {
          toast({
            title: 'Permission Denied',
            description: errorData.error || 'You do not have permission to perform this action',
            variant: 'destructive',
          });
          return;
        } else {
          toast({
            title: 'Error',
            description: errorData.error || 'Failed to delete community',
            variant: 'destructive',
          });
          return;
        }
      }

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Community deleted successfully',
        });
        loadCommunities();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete community',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting community:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete community. Please check your connection and try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedCommunities.length === 0) {
      toast({
        title: 'Warning',
        description: 'Please select communities first',
        variant: 'destructive',
      });
      return;
    }

    try {
      let updates = {};
      switch (action) {
        case 'activate':
          updates = { isActive: true, status: 'active' };
          break;
        case 'suspend':
          updates = { isActive: false, status: 'suspended' };
          break;
        case 'archive':
          updates = { status: 'archived' };
          break;
        default:
          return;
      }

      // Update each selected community
      const updatePromises = selectedCommunities.map(communityId =>
        fetch('/api/admin/communities', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            communityId,
            updates
          })
        }).then(async response => {
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update community');
          }
          return response.json();
        })
      );

      await Promise.all(updatePromises);

      toast({
        title: 'Success',
        description: `Successfully updated ${selectedCommunities.length} communities`,
      });
      setSelectedCommunities([]);
      loadCommunities();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast({
        title: 'Error',
        description: 'Failed to perform bulk action. Please check your connection and try again.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'moderated': return 'secondary';
      case 'suspended': return 'destructive';
      case 'archived': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Communities</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCommunities}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCommunities}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Members</CardTitle>
            <Activity className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageMembersPerCommunity}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averagePostsPerCommunity}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search communities..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="moderated">Moderated</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortBy || 'createdAt'} onValueChange={(value) => handleFilterChange('sortBy', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="memberCount">Members</SelectItem>
                <SelectItem value="postCount">Posts</SelectItem>
                <SelectItem value="lastActivity">Last Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedCommunities.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedCommunities.length} community(ies) selected
              </span>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkAction('activate')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Activate
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkAction('suspend')}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Suspend
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkAction('archive')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Archive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Communities Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Communities ({pagination.total})</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadCommunities} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input 
                      type="checkbox" 
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCommunities(communities.map(comm => comm._id));
                        } else {
                          setSelectedCommunities([]);
                        }
                      }}
                      checked={selectedCommunities.length === communities.length && communities.length > 0}
                    />
                  </TableHead>
                  <TableHead>Community</TableHead>
                  <TableHead>Moderator</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Posts</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                        Loading communities...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : communities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">No communities found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  communities.map((community) => (
                    <TableRow key={community._id}>
                      <TableCell>
                        <input 
                          type="checkbox" 
                          checked={selectedCommunities.includes(community._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCommunities(prev => [...prev, community._id]);
                            } else {
                              setSelectedCommunities(prev => prev.filter(id => id !== community._id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            {community.image && getImageUrl(community.image.asset._ref) ? (
                              <AvatarImage 
                                src={getImageUrl(community.image.asset._ref)!} 
                                alt={community.title}
                              />
                            ) : null}
                            <AvatarFallback>
                              <Users className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{community.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {community.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                            {community.moderator.imageURL && getImageUrl(community.moderator.imageURL) ? (
                              <AvatarImage 
                                src={getImageUrl(community.moderator.imageURL)!} 
                                alt={community.moderator.username}
                              />
                            ) : null}
                            <AvatarFallback>
                              <Shield className="w-3 h-3" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{community.moderator.username}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-gray-500" />
                          {community.memberCount.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1 text-gray-500" />
                          {community.postCount.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(community.status)}>
                          {community.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                          {new Date(community.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/community-questions/${typeof community.slug === 'string' ? community.slug : community.slug?.current}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Select 
                            value={community.status} 
                            onValueChange={(value) => handleStatusUpdate(community._id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="moderated">Moderated</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedCommunity(community);
                              setShowCommunityDialog(true);
                            }}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Community</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{community.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCommunity(community._id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} communities
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 py-2 text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Community Details Dialog */}
      <Dialog open={showCommunityDialog} onOpenChange={setShowCommunityDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Community Details</DialogTitle>
          </DialogHeader>
          {selectedCommunity && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <p className="text-sm text-gray-600">{selectedCommunity.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <p className="text-sm text-gray-600">{selectedCommunity.description || 'No description'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <div className="mt-1">
                      <Badge variant={getStatusBadgeVariant(selectedCommunity.status)}>
                        {selectedCommunity.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Moderator</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Avatar className="w-6 h-6">
                        {selectedCommunity.moderator.imageURL && getImageUrl(selectedCommunity.moderator.imageURL) ? (
                          <AvatarImage 
                            src={getImageUrl(selectedCommunity.moderator.imageURL)!} 
                            alt={selectedCommunity.moderator.username}
                          />
                        ) : null}
                        <AvatarFallback>
                          <Shield className="w-3 h-3" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{selectedCommunity.moderator.username}</span>
                      <Badge variant="outline">{selectedCommunity.moderator.role}</Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Created</label>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedCommunity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Activity</label>
                    <p className="text-sm text-gray-600">
                      {selectedCommunity.lastActivity ? new Date(selectedCommunity.lastActivity).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Slug</label>
                    <p className="text-sm text-gray-600">{typeof selectedCommunity.slug === 'string' ? selectedCommunity.slug : selectedCommunity.slug?.current}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{selectedCommunity.memberCount.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Members</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{selectedCommunity.postCount.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {selectedCommunity.memberCount > 0 ? Math.round(selectedCommunity.postCount / selectedCommunity.memberCount * 100) / 100 : 0}
                  </div>
                  <div className="text-sm text-gray-600">Posts/Member</div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Link href={`/community-questions/${typeof selectedCommunity.slug === 'string' ? selectedCommunity.slug : selectedCommunity.slug?.current}`}>
                  <Button>
                    <Eye className="w-4 h-4 mr-2" />
                    View Community
                  </Button>
                </Link>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Community
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 