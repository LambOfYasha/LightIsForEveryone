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
  HelpCircle, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Filter,
  Calendar,
  User,
  Reply,
  Eye,
  Trash2
} from 'lucide-react';
import { searchTickets, updateTicketStatus, deleteTicket, getTicketStats } from '@/action/helpActions';
import { useToast } from '@/hooks/use-toast';
import { RoleGuard } from '@/components/auth/RoleGuard';

interface Ticket {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  userId: string;
  userEmail: string;
  userName: string;
  adminResponse?: string;
  adminResponseAt?: string;
}

interface TicketStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  urgentTickets: number;
  highPriorityTickets: number;
  categoryBreakdown: Record<string, number>;
  recentTickets: number;
}

export default function AdminHelpTicketsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [updating, setUpdating] = useState(false);

  // Load tickets and stats on component mount
  useEffect(() => {
    loadTickets();
    loadStats();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const result = await searchTickets({
        search: searchQuery,
        status: statusFilter === 'all' ? undefined : statusFilter,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        priority: priorityFilter === 'all' ? undefined : priorityFilter
      });

      if (result.success && result.tickets) {
        setTickets(result.tickets);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load tickets",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load tickets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await getTicketStats();
      if (result.success && result.stats) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleUpdateTicket = async (ticketId: string, status: string) => {
    setUpdating(true);
    try {
      const result = await updateTicketStatus(
        ticketId, 
        status as 'open' | 'in_progress' | 'resolved' | 'closed',
        adminResponse || undefined
      );

      if (result.success) {
        toast({
          title: "Success",
          description: "Ticket updated successfully",
        });
        setAdminResponse('');
        setSelectedTicket(null);
        loadTickets();
        loadStats();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update ticket",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await deleteTicket(ticketId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Ticket deleted successfully",
        });
        loadTickets();
        loadStats();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete ticket",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast({
        title: "Error",
        description: "Failed to delete ticket",
        variant: "destructive"
      });
    }
  };

  const handleSearch = () => {
    loadTickets();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <HelpCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      open: 'default',
      in_progress: 'secondary',
      resolved: 'outline',
      closed: 'secondary'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'outline',
      medium: 'default',
      high: 'destructive',
      urgent: 'destructive'
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
            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold mb-2">Help Ticket Management</h1>
            <p className="text-muted-foreground">
              Manage and respond to user support tickets
            </p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                      <p className="text-2xl font-bold">{stats.totalTickets}</p>
                    </div>
                    <HelpCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Open Tickets</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.openTickets}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.inProgressTickets}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Urgent</p>
                      <p className="text-2xl font-bold text-red-600">{stats.urgentTickets}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="tickets" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tickets">All Tickets</TabsTrigger>
              <TabsTrigger value="respond">Respond to Ticket</TabsTrigger>
            </TabsList>

            <TabsContent value="tickets" className="mt-6">
              <div className="space-y-6">
                {/* Search and Filter Controls */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            placeholder="Search tickets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="account">Account</SelectItem>
                          <SelectItem value="content">Content</SelectItem>
                          <SelectItem value="feature">Feature</SelectItem>
                          <SelectItem value="bug">Bug</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleSearch} disabled={loading}>
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Tickets List */}
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading tickets...</p>
                  </div>
                ) : tickets.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
                      <p className="text-muted-foreground">
                        No tickets match your search criteria.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <Card key={ticket._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-3 mb-2">
                                {getStatusIcon(ticket.status)}
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg mb-1">{ticket.title}</h3>
                                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                                    {ticket.description}
                                  </p>
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {getStatusBadge(ticket.status)}
                                    {getPriorityBadge(ticket.priority)}
                                    <Badge variant="outline">{ticket.category}</Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {ticket.userName} ({ticket.userEmail})
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      Created: {formatDate(ticket.createdAt)}
                                    </div>
                                    {ticket.updatedAt !== ticket.createdAt && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Updated: {formatDate(ticket.updatedAt)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedTicket(ticket)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTicket(ticket._id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>

                          {ticket.adminResponse && (
                            <div className="mt-4 p-4 bg-muted rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4 text-primary" />
                                <span className="font-medium text-sm">Admin Response</span>
                                {ticket.adminResponseAt && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(ticket.adminResponseAt)}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm">{ticket.adminResponse}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="respond" className="mt-6">
              {selectedTicket ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Reply className="h-5 w-5" />
                      Respond to Ticket
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{selectedTicket.title}</h3>
                      <p className="text-muted-foreground mb-4">{selectedTicket.description}</p>
                      <div className="flex gap-2 mb-4">
                        {getStatusBadge(selectedTicket.status)}
                        {getPriorityBadge(selectedTicket.priority)}
                        <Badge variant="outline">{selectedTicket.category}</Badge>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="adminResponse" className="block text-sm font-medium mb-2">
                        Admin Response
                      </label>
                      <Textarea
                        id="adminResponse"
                        value={adminResponse}
                        onChange={(e) => setAdminResponse(e.target.value)}
                        placeholder="Enter your response to the user..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium mb-2">
                        Update Status
                      </label>
                      <Select defaultValue={selectedTicket.status}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUpdateTicket(selectedTicket._id, 'resolved')}
                        disabled={updating}
                      >
                        {updating ? 'Updating...' : 'Mark as Resolved'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedTicket(null);
                          setAdminResponse('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Reply className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Select a Ticket</h3>
                    <p className="text-muted-foreground">
                      Click "View" on a ticket from the All Tickets tab to respond to it.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RoleGuard>
  );
}
