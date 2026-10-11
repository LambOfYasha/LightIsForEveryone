import { defineField, defineType } from "sanity";
import { MessageSquare } from "lucide-react";

export const feedbackType = defineType({
  name: 'feedback',
  title: 'Feedback',
  type: 'document',
  icon: MessageSquare,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Brief title for the feedback',
      validation: (Rule) => Rule.required().min(5).max(200),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'text',
      description: 'Detailed feedback content',
      rows: 6,
      validation: (Rule) => Rule.required().min(10).max(5000),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Type of feedback',
      options: {
        list: [
          { title: 'General Feedback', value: 'general' },
          { title: 'Bug Report', value: 'bug' },
          { title: 'Feature Request', value: 'feature' },
          { title: 'UI/UX Improvement', value: 'ui_ux' },
          { title: 'Content Suggestion', value: 'content' },
          { title: 'Performance Issue', value: 'performance' },
          { title: 'Accessibility', value: 'accessibility' },
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
      description: 'Current status of the feedback',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'Under Review', value: 'under_review' },
          { title: 'In Progress', value: 'in_progress' },
          { title: 'Implemented', value: 'implemented' },
          { title: 'Rejected', value: 'rejected' },
          { title: 'Closed', value: 'closed' },
        ],
        layout: 'radio'
      },
      initialValue: 'new',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'string',
      description: 'Priority level of the feedback',
      options: {
        list: [
          { title: 'Low', value: 'low' },
          { title: 'Medium', value: 'medium' },
          { title: 'High', value: 'high' },
          { title: 'Critical', value: 'critical' },
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
      description: 'Clerk user ID of the feedback submitter (null for anonymous)',
    }),
    defineField({
      name: 'userEmail',
      title: 'User Email',
      type: 'string',
      description: 'Email address of the feedback submitter',
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: 'userName',
      title: 'User Name',
      type: 'string',
      description: 'Display name of the feedback submitter',
    }),
    defineField({
      name: 'isAnonymous',
      title: 'Anonymous',
      type: 'boolean',
      description: 'Whether the feedback was submitted anonymously',
      initialValue: false,
    }),
    defineField({
      name: 'adminResponse',
      title: 'Admin Response',
      type: 'text',
      description: 'Response from admin team',
      rows: 4,
    }),
    defineField({
      name: 'adminResponseAt',
      title: 'Admin Response Date',
      type: 'datetime',
      description: 'When the admin response was added',
    }),
    defineField({
      name: 'assignedTo',
      title: 'Assigned To',
      type: 'string',
      description: 'Admin user ID assigned to handle this feedback',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Tags to categorize the feedback',
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      description: 'When the feedback was created',
      initialValue: new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      description: 'When the feedback was last updated',
      initialValue: new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
      status: 'status',
      userName: 'userName',
      createdAt: 'createdAt'
    },
    prepare(selection) {
      const { title, category, status, userName, createdAt } = selection;
      const date = new Date(createdAt).toLocaleDateString();
      return {
        title: title || 'Untitled Feedback',
        subtitle: `${category} • ${status} • ${userName || 'Anonymous'} • ${date}`,
        media: MessageSquare
      };
    }
  },
  orderings: [
    {
      title: 'Created Date (Newest)',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }]
    },
    {
      title: 'Created Date (Oldest)',
      name: 'createdAtAsc',
      by: [{ field: 'createdAt', direction: 'asc' }]
    },
    {
      title: 'Status',
      name: 'statusAsc',
      by: [{ field: 'status', direction: 'asc' }]
    },
    {
      title: 'Priority',
      name: 'priorityDesc',
      by: [{ field: 'priority', direction: 'desc' }]
    }
  ]
});
