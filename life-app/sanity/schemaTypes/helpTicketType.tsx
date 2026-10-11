import { defineField, defineType } from "sanity";
import { HelpCircle } from "lucide-react";

export const helpTicketType = defineType({
  name: 'helpTicket',
  title: 'Help Ticket',
  type: 'document',
  icon: HelpCircle,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Brief description of the issue',
      validation: (Rule) => Rule.required().min(5).max(200),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Detailed description of the issue',
      rows: 4,
      validation: (Rule) => Rule.required().min(10).max(2000),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Type of issue',
      options: {
        list: [
          { title: 'Technical Issue', value: 'technical' },
          { title: 'Account Problem', value: 'account' },
          { title: 'Content Issue', value: 'content' },
          { title: 'Feature Request', value: 'feature' },
          { title: 'Bug Report', value: 'bug' },
          { title: 'Other', value: 'other' },
        ],
        layout: 'radio'
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      description: 'Current status of the ticket',
      options: {
        list: [
          { title: 'Open', value: 'open' },
          { title: 'In Progress', value: 'in_progress' },
          { title: 'Resolved', value: 'resolved' },
          { title: 'Closed', value: 'closed' },
        ],
        layout: 'radio'
      },
      initialValue: 'open',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'string',
      description: 'Priority level of the ticket',
      options: {
        list: [
          { title: 'Low', value: 'low' },
          { title: 'Medium', value: 'medium' },
          { title: 'High', value: 'high' },
          { title: 'Urgent', value: 'urgent' },
        ],
        layout: 'radio'
      },
      initialValue: 'medium',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'userId',
      title: 'User ID',
      type: 'string',
      description: 'Clerk user ID of the ticket creator',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'userEmail',
      title: 'User Email',
      type: 'string',
      description: 'Email address of the ticket creator',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'userName',
      title: 'User Name',
      type: 'string',
      description: 'Display name of the ticket creator',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'adminResponse',
      title: 'Admin Response',
      type: 'text',
      description: 'Response from admin/support team',
      rows: 4,
    }),
    defineField({
      name: 'adminResponseAt',
      title: 'Admin Response Date',
      type: 'datetime',
      description: 'When the admin response was added',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      description: 'When the ticket was created',
      initialValue: new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      description: 'When the ticket was last updated',
      initialValue: new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isDeleted',
      title: 'Is Deleted',
      type: 'boolean',
      description: 'Whether this ticket has been deleted',
      initialValue: false,
    }),
    defineField({
      name: 'deletedAt',
      title: 'Deleted At',
      type: 'datetime',
      description: 'When the ticket was deleted',
    }),
    defineField({
      name: 'deletedBy',
      title: 'Deleted By',
      type: 'string',
      description: 'ID of the user who deleted this ticket',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
      status: 'status',
      priority: 'priority',
      userName: 'userName',
      createdAt: 'createdAt',
    },
    prepare({ title, category, status, priority, userName, createdAt }: {
      title?: string,
      category?: string,
      status?: string,
      priority?: string,
      userName?: string,
      createdAt?: string
    }) {
      const statusColors = {
        open: '🔵',
        in_progress: '🟡',
        resolved: '🟢',
        closed: '⚫'
      };
      
      const priorityColors = {
        low: '🟢',
        medium: '🟡',
        high: '🟠',
        urgent: '🔴'
      };

      const statusIcon = statusColors[status as keyof typeof statusColors] || '❓';
      const priorityIcon = priorityColors[priority as keyof typeof priorityColors] || '❓';
      
      const date = createdAt ? new Date(createdAt).toLocaleDateString() : 'No date';
      
      return {
        title: title || 'Untitled Ticket',
        subtitle: `${statusIcon} ${status?.toUpperCase() || 'UNKNOWN'} • ${priorityIcon} ${priority?.toUpperCase() || 'UNKNOWN'} • ${category || 'No category'} • ${userName || 'Unknown user'} • ${date}`,
        media: HelpCircle,
      }
    }
  },
  orderings: [
    {
      title: 'Created Date (Newest)',
      name: 'createdAtDesc',
      by: [
        { field: 'createdAt', direction: 'desc' }
      ]
    },
    {
      title: 'Created Date (Oldest)',
      name: 'createdAtAsc',
      by: [
        { field: 'createdAt', direction: 'asc' }
      ]
    },
    {
      title: 'Status',
      name: 'status',
      by: [
        { field: 'status', direction: 'asc' }
      ]
    },
    {
      title: 'Priority',
      name: 'priority',
      by: [
        { field: 'priority', direction: 'desc' }
      ]
    },
    {
      title: 'Updated Date (Newest)',
      name: 'updatedAtDesc',
      by: [
        { field: 'updatedAt', direction: 'desc' }
      ]
    }
  ]
});
