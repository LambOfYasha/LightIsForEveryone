'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  GraduationCap,
  Star,
  User,
  Save,
  Loader2,
  Pencil
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getImageUrl } from '@/lib/utils';

export interface BaseUserData {
  _id: string;
  username: string;
  email: string;
  role: string;
  joinedAt: string;
  isReported: boolean;
  isActive: boolean;
  lastActive: string;
  postCount: number;
  commentCount: number;
  reportCount: number;
  imageURL?: string;
  bio?: string;
}

export interface BaseFilters {
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProfileField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'tags' | 'select';
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  /** Only show this field when this function returns true for the item */
  visibleWhen?: (item: any) => boolean;
}

export interface ManagementConfig {
  title: string;
  icon: React.ComponentType<any>;
  dataType: 'users' | 'teachers';
  roles: { value: string; label: string }[];
  additionalFilters?: { key: string; label: string; options: { value: string; label: string }[] }[];
  additionalColumns?: { key: string; label: string; render: (item: any) => React.ReactNode }[];
  profileFields?: ProfileField[];
  getRoleBadgeVariant: (role: string) => React.ComponentProps<typeof Badge>["variant"];
  getStatusBadgeVariant: (item: any) => React.ComponentProps<typeof Badge>["variant"];
  loadData: (filters: any) => Promise<any>;
  updateRole: (id: string, role: string) => Promise<any>;
  toggleStatus: (id: string, active: boolean) => Promise<any>;
  deleteItem: (id: string) => Promise<any>;
  bulkUpdate: (ids: string[], updates: any) => Promise<any>;
  updateProfile?: (id: string, data: Record<string, any>) => Promise<any>;
  createItem?: (data: Record<string, any>) => Promise<any>;
  createFields?: ProfileField[];
}

interface SharedManagementProps {
  config: ManagementConfig;
  initialData?: any[];
}

export default function SharedManagement({ config, initialData = [] }: SharedManagementProps) {
  const { toast } = useToast();
  const [data, setData] = useState<any[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<BaseFilters>({
    search: '',
    role: 'all',
    status: 'all',
    sortBy: 'joinedAt',
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
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState<Record<string, any>>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createFormData, setCreateFormData] = useState<Record<string, any>>({});
  const [creatingItem, setCreatingItem] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await config.loadData(filters);
      if (result.success) {
        setData(result[config.dataType] || result.users || result.teachers);
        setPagination(result.pagination);
      } else {
        toast({
          title: 'Error',
          description: result.error || `Failed to load ${config.title.toLowerCase()}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to load ${config.title.toLowerCase()}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleFilterChange = (key: keyof BaseFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleRoleUpdate = async (itemId: string, newRole: string) => {
    try {
      const result = await config.updateRole(itemId, newRole);
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        loadData();
      } else {
        toast({
          title: 'Error',
          description: result.error || `Failed to update ${config.title.toLowerCase()} role`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update ${config.title.toLowerCase()} role`,
        variant: 'destructive',
      });
    }
  };

  const handleStatusToggle = async (itemId: string, isActive: boolean) => {
    try {
      const result = await config.toggleStatus(itemId, isActive);
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        loadData();
      } else {
        toast({
          title: 'Error',
          description: result.error || `Failed to update ${config.title.toLowerCase()} status`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update ${config.title.toLowerCase()} status`,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const result = await config.deleteItem(itemId);
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        loadData();
      } else {
        toast({
          title: 'Error',
          description: result.error || `Failed to delete ${config.title.toLowerCase()}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete ${config.title.toLowerCase()}`,
        variant: 'destructive',
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) {
      toast({
        title: 'Warning',
        description: 'Please select items first',
        variant: 'destructive',
      });
      return;
    }

    try {
      let result;
      switch (action) {
        case 'activate':
          result = await config.bulkUpdate(selectedItems, { isActive: true });
          break;
        case 'deactivate':
          result = await config.bulkUpdate(selectedItems, { isActive: false });
          break;
        case 'delete':
          // Handle bulk delete
          break;
        default:
          return;
      }

      if (result?.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        setSelectedItems([]);
        loadData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to perform bulk action',
        variant: 'destructive',
      });
    }
  };

  const handleCreateFieldChange = (key: string, value: any) => {
    setCreateFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleOpenCreateDialog = () => {
    const initialData: Record<string, any> = {};
    config.createFields?.forEach(field => {
      if (field.type === 'tags') initialData[field.key] = [];
      else if (field.type === 'number') initialData[field.key] = '';
      else initialData[field.key] = '';
    });
    setCreateFormData(initialData);
    setShowCreateDialog(true);
  };

  const handleCreateItem = async () => {
    if (!config.createItem) return;

    // Validate required fields
    const missingFields = config.createFields
      ?.filter(f => f.required && !createFormData[f.key])
      ?.map(f => f.label);
    if (missingFields && missingFields.length > 0) {
      toast({ title: 'Validation Error', description: `Please fill in: ${missingFields.join(', ')}`, variant: 'destructive' });
      return;
    }

    setCreatingItem(true);
    try {
      const result = await config.createItem(createFormData);
      if (result.success) {
        toast({ title: 'Success', description: result.message || `${config.title.slice(0, -1)} created successfully` });
        setShowCreateDialog(false);
        setCreateFormData({});
        loadData();
      } else {
        toast({ title: 'Error', description: result.error || 'Failed to create', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create', variant: 'destructive' });
    } finally {
      setCreatingItem(false);
    }
  };

  const handleOpenDetails = (item: any) => {
    setEditingItem(item);
    setShowItemDialog(true);
    setIsEditingProfile(false);
    // Initialize form data from item
    const initialData: Record<string, any> = {};
    config.profileFields?.forEach(field => {
      initialData[field.key] = item[field.key] ?? (field.type === 'tags' ? [] : field.type === 'number' ? 0 : '');
    });
    setProfileFormData(initialData);
  };

  const handleProfileFieldChange = (key: string, value: any) => {
    setProfileFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveProfile = async () => {
    if (!editingItem || !config.updateProfile) return;
    setSavingProfile(true);
    try {
      const result = await config.updateProfile(editingItem._id, profileFormData);
      if (result.success) {
        toast({ title: 'Success', description: result.message || 'Profile updated successfully' });
        setIsEditingProfile(false);
        loadData();
      } else {
        toast({ title: 'Error', description: result.error || 'Failed to update profile', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    } finally {
      setSavingProfile(false);
    }
  };

  const IconComponent = config.icon;

  return (
    <div className="space-y-6">
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
                placeholder={`Search ${config.title.toLowerCase()}...`}
                className="pl-10"
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            <Select value={filters.role || 'all'} onValueChange={(value) => handleFilterChange('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {config.roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {config.additionalFilters?.map((filter) => (
              <Select 
                key={filter.key}
                value={String(filters[filter.key as keyof BaseFilters] || 'all')}
                onValueChange={(value) => handleFilterChange(filter.key as keyof BaseFilters, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{filter.label}</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}

            <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedItems.length} {config.title.toLowerCase()}(s) selected
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
                  onClick={() => handleBulkAction('deactivate')}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Deactivate
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {config.title}</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedItems.length} {config.title.toLowerCase()}(s)? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleBulkAction('delete')}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{config.title} ({pagination.total})</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              {config.createItem && config.createFields && (
                <Button size="sm" onClick={handleOpenCreateDialog}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add {config.title.slice(0, -1)}
                </Button>
              )}
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
                          setSelectedItems(data.map(item => item._id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                      checked={selectedItems.length === data.length && data.length > 0}
                    />
                  </TableHead>
                  <TableHead>{config.title.slice(0, -1)}</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  {config.additionalColumns?.map((column) => (
                    <TableHead key={column.key}>{column.label}</TableHead>
                  ))}
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                        Loading {config.title.toLowerCase()}...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <IconComponent className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">No {config.title.toLowerCase()} found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <input 
                          type="checkbox" 
                          checked={selectedItems.includes(item._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems(prev => [...prev, item._id]);
                            } else {
                              setSelectedItems(prev => prev.filter(id => id !== item._id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            {item.imageURL && getImageUrl(item.imageURL) ? (
                              <AvatarImage 
                                src={getImageUrl(item.imageURL)!} 
                                alt={item.username}
                              />
                            ) : null}
                            <AvatarFallback>
                              <User className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{item.username}</div>
                            <div className="text-sm text-gray-500">ID: {item._id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.email}</TableCell>
                      <TableCell>
                        <Badge variant={config.getRoleBadgeVariant(item.role)}>
                          {item.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      {config.additionalColumns?.map((column) => (
                        <TableCell key={column.key}>
                          {column.render(item)}
                        </TableCell>
                      ))}
                      <TableCell>{new Date(item.joinedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={config.getStatusBadgeVariant(item)}>
                          {item.isReported ? 'Reported' : item.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleOpenDetails(item)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Select 
                            value={item.role} 
                            onValueChange={(value) => handleRoleUpdate(item._id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {config.roles.map((role) => (
                                <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusToggle(item._id, !item.isActive)}
                          >
                            {item.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete {config.title.slice(0, -1)}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {item.username}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteItem(item._id)}>
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
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} {config.title.toLowerCase()}
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

      {/* Item Details Dialog */}
      <Dialog open={showItemDialog} onOpenChange={(open) => { setShowItemDialog(open); if (!open) setIsEditingProfile(false); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{config.title.slice(0, -1)} Details</DialogTitle>
              {config.updateProfile && config.profileFields && config.profileFields.length > 0 && !isEditingProfile && (
                <Button size="sm" variant="outline" onClick={() => setIsEditingProfile(true)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Username</label>
                  <p className="text-sm text-gray-600">{editingItem.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-gray-600">{editingItem.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Badge variant={config.getRoleBadgeVariant(editingItem.role)}>
                    {editingItem.role.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge variant={config.getStatusBadgeVariant(editingItem)}>
                    {editingItem.isReported ? 'Reported' : editingItem.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Joined</label>
                  <p className="text-sm text-gray-600">
                    {new Date(editingItem.joinedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Last Active</label>
                  <p className="text-sm text-gray-600">
                    {editingItem.lastActive ? new Date(editingItem.lastActive).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
              
              {config.dataType === 'teachers' && editingItem.specializations && (
                <div>
                  <label className="text-sm font-medium">Specializations</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editingItem.specializations?.map((spec: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{editingItem.postCount || 0}</div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{editingItem.commentCount || 0}</div>
                  <div className="text-sm text-gray-600">Comments</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{editingItem.reportCount || 0}</div>
                  <div className="text-sm text-gray-600">Reports</div>
                </div>
              </div>

              {/* Editable Profile Section */}
              {config.profileFields && config.profileFields.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Profile Sections
                  </h3>
                  {isEditingProfile ? (
                    <div className="space-y-4">
                      {config.profileFields
                        .filter(field => !field.visibleWhen || field.visibleWhen(editingItem))
                        .map(field => (
                          <div key={field.key} className="space-y-1">
                            <Label htmlFor={`profile-${field.key}`} className="text-sm font-medium">
                              {field.label}
                            </Label>
                            {field.description && (
                              <p className="text-xs text-muted-foreground">{field.description}</p>
                            )}
                            {field.type === 'text' && (
                              <Input
                                id={`profile-${field.key}`}
                                placeholder={field.placeholder}
                                value={profileFormData[field.key] || ''}
                                onChange={(e) => handleProfileFieldChange(field.key, e.target.value)}
                              />
                            )}
                            {field.type === 'textarea' && (
                              <Textarea
                                id={`profile-${field.key}`}
                                placeholder={field.placeholder}
                                value={profileFormData[field.key] || ''}
                                onChange={(e) => handleProfileFieldChange(field.key, e.target.value)}
                                rows={3}
                              />
                            )}
                            {field.type === 'number' && (
                              <Input
                                id={`profile-${field.key}`}
                                type="number"
                                placeholder={field.placeholder}
                                value={profileFormData[field.key] ?? ''}
                                onChange={(e) => handleProfileFieldChange(field.key, e.target.value ? Number(e.target.value) : undefined)}
                              />
                            )}
                            {field.type === 'tags' && (
                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-1">
                                  {(profileFormData[field.key] || []).map((tag: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="gap-1">
                                      {tag}
                                      <button
                                        type="button"
                                        className="ml-1 text-xs hover:text-destructive"
                                        onClick={() => {
                                          const updated = [...(profileFormData[field.key] || [])];
                                          updated.splice(i, 1);
                                          handleProfileFieldChange(field.key, updated);
                                        }}
                                      >
                                        ×
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                                <Input
                                  placeholder={field.placeholder || 'Type and press Enter to add...'}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const val = (e.target as HTMLInputElement).value.trim();
                                      if (val) {
                                        handleProfileFieldChange(field.key, [...(profileFormData[field.key] || []), val]);
                                        (e.target as HTMLInputElement).value = '';
                                      }
                                    }
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" onClick={handleSaveProfile} disabled={savingProfile}>
                          {savingProfile ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsEditingProfile(false)} disabled={savingProfile}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {config.profileFields
                        .filter(field => !field.visibleWhen || field.visibleWhen(editingItem))
                        .map(field => (
                          <div key={field.key}>
                            <label className="text-sm font-medium text-muted-foreground">{field.label}</label>
                            {field.description && (
                              <p className="text-xs text-muted-foreground">{field.description}</p>
                            )}
                            {field.type === 'tags' ? (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {(editingItem[field.key] || []).length > 0 ? (
                                  (editingItem[field.key] || []).map((tag: string, i: number) => (
                                    <Badge key={i} variant="outline">{tag}</Badge>
                                  ))
                                ) : (
                                  <span className="text-sm text-muted-foreground italic">Not set</span>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm mt-1">
                                {editingItem[field.key] || <span className="text-muted-foreground italic">Not set</span>}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Item Dialog */}
      {config.createItem && config.createFields && (
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New {config.title.slice(0, -1)}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {config.createFields.map(field => (
                <div key={field.key} className="space-y-1">
                  <Label htmlFor={`create-${field.key}`} className="text-sm font-medium">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {field.description && (
                    <p className="text-xs text-muted-foreground">{field.description}</p>
                  )}
                  {field.type === 'text' && (
                    <Input
                      id={`create-${field.key}`}
                      placeholder={field.placeholder}
                      value={createFormData[field.key] || ''}
                      onChange={(e) => handleCreateFieldChange(field.key, e.target.value)}
                    />
                  )}
                  {field.type === 'textarea' && (
                    <Textarea
                      id={`create-${field.key}`}
                      placeholder={field.placeholder}
                      value={createFormData[field.key] || ''}
                      onChange={(e) => handleCreateFieldChange(field.key, e.target.value)}
                      rows={3}
                    />
                  )}
                  {field.type === 'number' && (
                    <Input
                      id={`create-${field.key}`}
                      type="number"
                      placeholder={field.placeholder}
                      value={createFormData[field.key] ?? ''}
                      onChange={(e) => handleCreateFieldChange(field.key, e.target.value ? Number(e.target.value) : undefined)}
                    />
                  )}
                  {field.type === 'select' && field.options && (
                    <Select
                      value={createFormData[field.key] || ''}
                      onValueChange={(value) => handleCreateFieldChange(field.key, value)}
                    >
                      <SelectTrigger id={`create-${field.key}`}>
                        <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {field.type === 'tags' && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {(createFormData[field.key] || []).map((tag: string, i: number) => (
                          <Badge key={i} variant="secondary" className="gap-1">
                            {tag}
                            <button
                              type="button"
                              className="ml-1 text-xs hover:text-destructive"
                              onClick={() => {
                                const updated = [...(createFormData[field.key] || [])];
                                updated.splice(i, 1);
                                handleCreateFieldChange(field.key, updated);
                              }}
                            >
                              &times;
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder={field.placeholder || 'Type and press Enter to add...'}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val) {
                              handleCreateFieldChange(field.key, [...(createFormData[field.key] || []), val]);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button onClick={handleCreateItem} disabled={creatingItem} className="flex-1">
                  {creatingItem ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  Create {config.title.slice(0, -1)}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={creatingItem}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}