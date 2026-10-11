'use server';

import { auth } from '@clerk/nextjs/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { getUser } from '@/lib/user/getUser';
import { NotificationsService } from '@/lib/ai/notificationsService';

export interface TicketData {
  _id?: string;
  title: string;
  description: string;
  category: 'technical' | 'account' | 'content' | 'feature' | 'bug' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId: string;
  userEmail: string;
  userName: string;
  adminResponse?: string;
  adminResponseAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketFilters {
  userId?: string;
  search?: string;
  status?: string;
  category?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

export async function createTicket(ticketData: Omit<TicketData, '_id' | 'createdAt' | 'updatedAt' | 'status'>) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify the user is creating a ticket for themselves
    if (userId !== ticketData.userId) {
      return { success: false, error: 'Unauthorized to create ticket for another user' };
    }

    const ticket = {
      _type: 'helpTicket',
      title: ticketData.title,
      description: ticketData.description,
      category: ticketData.category,
      status: 'open',
      priority: ticketData.priority,
      userId: ticketData.userId,
      userEmail: ticketData.userEmail,
      userName: ticketData.userName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false
    };

    const result = await adminClient.create(ticket);

    // Send notification to user
    try {
      const currentUser = await getUser();
      if (!('error' in currentUser)) {
        // Map user role for notification
        const mapRoleForNotification = (role: string): 'user' | 'teacher' | 'admin' => {
          if (role === 'admin') return 'admin';
          if (role === 'teacher' || role === 'junior_teacher' || role === 'senior_teacher' || role === 'lead_teacher') return 'teacher';
          return 'user';
        };

        await NotificationsService.sendTicketNotification(
          result._id,
          ticketData.title,
          ticketData.category,
          ticketData.priority,
          ticketData.userId,
          mapRoleForNotification(currentUser.role),
          'created'
        );

        // Send notification to admins
        await NotificationsService.sendTicketAdminNotification(
          result._id,
          ticketData.title,
          ticketData.category,
          ticketData.priority,
          ticketData.userId,
          ticketData.userName,
          ticketData.userEmail,
          ticketData.priority === 'urgent'
        );
      }
    } catch (notificationError) {
      console.error('Error sending ticket notifications:', notificationError);
      // Don't fail the ticket creation if notifications fail
    }

    return { 
      success: true, 
      ticket: result,
      message: 'Ticket created successfully' 
    };
  } catch (error) {
    console.error('Error creating ticket:', error);
    return { success: false, error: 'Failed to create ticket' };
  }
}

export async function searchTickets(filters: TicketFilters = {}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Build GROQ query with filters
    let query = `*[_type == "helpTicket" && isDeleted != true`;
    
    // If userId is provided, filter by user (for user's own tickets)
    if (filters.userId) {
      query += ` && userId == "${filters.userId}"`;
    }
    
    // If no userId filter, check if user is admin to see all tickets
    if (!filters.userId) {
      const currentUser = await getUser();
      if ('error' in currentUser || !['admin', 'moderator'].includes(currentUser.role)) {
        return { success: false, error: 'Insufficient permissions' };
      }
    }
    
    if (filters.search) {
      query += ` && (title match "*${filters.search}*" || description match "*${filters.search}*")`;
    }
    
    if (filters.status && filters.status !== 'all') {
      query += ` && status == "${filters.status}"`;
    }
    
    if (filters.category && filters.category !== 'all') {
      query += ` && category == "${filters.category}"`;
    }
    
    if (filters.priority && filters.priority !== 'all') {
      query += ` && priority == "${filters.priority}"`;
    }
    
    query += `]`;
    
    // Add sorting (newest first)
    query += ` | order(createdAt desc)`;
    
    // Add pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const start = (page - 1) * limit;
    query += ` [${start}...${start + limit}]`;
    
    // Add projection
    query += ` {
      _id,
      title,
      description,
      category,
      status,
      priority,
      userId,
      userEmail,
      userName,
      adminResponse,
      adminResponseAt,
      createdAt,
      updatedAt
    }`;

    const tickets = await adminClient.fetch(query);
    
    // Get total count for pagination
    let countQuery = `count(*[_type == "helpTicket" && isDeleted != true`;
    if (filters.userId) {
      countQuery += ` && userId == "${filters.userId}"`;
    }
    if (filters.search) {
      countQuery += ` && (title match "*${filters.search}*" || description match "*${filters.search}*")`;
    }
    if (filters.status && filters.status !== 'all') {
      countQuery += ` && status == "${filters.status}"`;
    }
    if (filters.category && filters.category !== 'all') {
      countQuery += ` && category == "${filters.category}"`;
    }
    if (filters.priority && filters.priority !== 'all') {
      countQuery += ` && priority == "${filters.priority}"`;
    }
    countQuery += `])`;
    
    const totalCount = await adminClient.fetch(countQuery);

    return {
      success: true,
      tickets,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  } catch (error) {
    console.error('Error searching tickets:', error);
    return { success: false, error: 'Failed to search tickets' };
  }
}

export async function getTicketById(ticketId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const ticket = await adminClient.fetch(`*[_type == "helpTicket" && _id == $ticketId && isDeleted != true][0] {
      _id,
      title,
      description,
      category,
      status,
      priority,
      userId,
      userEmail,
      userName,
      adminResponse,
      adminResponseAt,
      createdAt,
      updatedAt
    }`, { ticketId });

    if (!ticket) {
      return { success: false, error: 'Ticket not found' };
    }

    // Check if user can access this ticket
    const currentUser = await getUser();
    if ('error' in currentUser) {
      return { success: false, error: 'User not found' };
    }

    // User can access their own tickets or admins can access all
    if (ticket.userId !== userId && !['admin', 'moderator'].includes(currentUser.role)) {
      return { success: false, error: 'Unauthorized to access this ticket' };
    }

    return { success: true, ticket };
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return { success: false, error: 'Failed to fetch ticket' };
  }
}

export async function updateTicketStatus(ticketId: string, status: 'open' | 'in_progress' | 'resolved' | 'closed', adminResponse?: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const currentUser = await getUser();
    if ('error' in currentUser || !['admin', 'moderator'].includes(currentUser.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }

    // Get the ticket first
    const ticket = await adminClient.fetch(`*[_type == "helpTicket" && _id == $ticketId && isDeleted != true][0]`, { ticketId });
    
    if (!ticket) {
      return { success: false, error: 'Ticket not found' };
    }

    const updateData: any = {
      status,
      updatedAt: new Date().toISOString()
    };

    // If admin response is provided, add it
    if (adminResponse) {
      updateData.adminResponse = adminResponse;
      updateData.adminResponseAt = new Date().toISOString();
    }

    await adminClient
      .patch(ticketId)
      .set(updateData)
      .commit();

    // Send notification to user about ticket update
    try {
      const ticket = await adminClient.fetch(`*[_type == "helpTicket" && _id == $ticketId && isDeleted != true][0] {
        userId,
        userEmail,
        userName,
        title,
        category,
        priority
      }`, { ticketId });

      if (ticket) {
        // Get user role for notification
        const user = await adminClient.fetch(`*[_type == "user" && id == $userId][0] {
          role
        }`, { userId: ticket.userId });

        if (user) {
          const mapRoleForNotification = (role: string): 'user' | 'teacher' | 'admin' => {
            if (role === 'admin') return 'admin';
            if (role === 'teacher' || role === 'junior_teacher' || role === 'senior_teacher' || role === 'lead_teacher') return 'teacher';
            return 'user';
          };

          await NotificationsService.sendTicketNotification(
            ticketId,
            ticket.title,
            ticket.category,
            ticket.priority,
            ticket.userId,
            mapRoleForNotification(user.role),
            status as 'updated' | 'resolved' | 'closed',
            adminResponse
          );
        }
      }
    } catch (notificationError) {
      console.error('Error sending ticket update notification:', notificationError);
      // Don't fail the ticket update if notifications fail
    }

    return { 
      success: true, 
      message: 'Ticket status updated successfully' 
    };
  } catch (error) {
    console.error('Error updating ticket status:', error);
    return { success: false, error: 'Failed to update ticket status' };
  }
}

export async function deleteTicket(ticketId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const currentUser = await getUser();
    if ('error' in currentUser) {
      return { success: false, error: 'User not found' };
    }

    // Get the ticket first
    const ticket = await adminClient.fetch(`*[_type == "helpTicket" && _id == $ticketId && isDeleted != true][0]`, { ticketId });
    
    if (!ticket) {
      return { success: false, error: 'Ticket not found' };
    }

    // User can delete their own tickets or admins can delete any
    if (ticket.userId !== userId && !['admin', 'moderator'].includes(currentUser.role)) {
      return { success: false, error: 'Unauthorized to delete this ticket' };
    }

    // Soft delete the ticket
    await adminClient
      .patch(ticketId)
      .set({ 
        isDeleted: true, 
        deletedAt: new Date().toISOString(),
        deletedBy: currentUser._id
      })
      .commit();

    return { 
      success: true, 
      message: 'Ticket deleted successfully' 
    };
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return { success: false, error: 'Failed to delete ticket' };
  }
}

export async function getTicketStats() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const currentUser = await getUser();
    if ('error' in currentUser || !['admin', 'moderator'].includes(currentUser.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }

    const stats = await adminClient.fetch(`{
      "totalTickets": count(*[_type == "helpTicket" && isDeleted != true]),
      "openTickets": count(*[_type == "helpTicket" && isDeleted != true && status == "open"]),
      "inProgressTickets": count(*[_type == "helpTicket" && isDeleted != true && status == "in_progress"]),
      "resolvedTickets": count(*[_type == "helpTicket" && isDeleted != true && status == "resolved"]),
      "closedTickets": count(*[_type == "helpTicket" && isDeleted != true && status == "closed"]),
      "urgentTickets": count(*[_type == "helpTicket" && isDeleted != true && priority == "urgent"]),
      "highPriorityTickets": count(*[_type == "helpTicket" && isDeleted != true && priority == "high"]),
      "categoryBreakdown": {
        "technical": count(*[_type == "helpTicket" && isDeleted != true && category == "technical"]),
        "account": count(*[_type == "helpTicket" && isDeleted != true && category == "account"]),
        "content": count(*[_type == "helpTicket" && isDeleted != true && category == "content"]),
        "feature": count(*[_type == "helpTicket" && isDeleted != true && category == "feature"]),
        "bug": count(*[_type == "helpTicket" && isDeleted != true && category == "bug"]),
        "other": count(*[_type == "helpTicket" && isDeleted != true && category == "other"])
      },
      "recentTickets": count(*[_type == "helpTicket" && isDeleted != true && _createdAt >= $startOfWeek])
    }`, {
      startOfWeek: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    return { success: true, stats };
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    return { success: false, error: 'Failed to fetch ticket statistics' };
  }
}
