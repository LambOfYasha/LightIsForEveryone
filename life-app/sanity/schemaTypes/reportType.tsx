import {defineField, defineType} from "sanity";
import { Flag, AlertTriangle } from "lucide-react";

export const reportType = defineType({
  name: 'report',
  title: 'Report',
  type: 'document',
  icon: Flag,
  fields: [
    defineField({
      name: 'reporter',
      title: 'Reporter',
      type: 'reference',
      to: [{type: 'user'}, {type: 'teacher'}],
      description: 'The user who submitted the report',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'reportedContent',
      title: 'Reported Content',
      type: 'reference',
      to: [
        {type: 'post'}, 
        {type: 'comment'}, 
        {type: 'blog'}, 
        {type: 'communityQuestion'},
        {type: 'user'},
        {type: 'teacher'}
      ],
      description: 'The content that was reported',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'contentType',
      title: 'Content Type',
      type: 'string',
      description: 'The type of content being reported',
      options: {
        list: [
          {title: 'Community Response', value: 'post'},
          {title: 'Comment', value: 'comment'},
          {title: 'Blog Post', value: 'blog'},
          {title: 'Community Question', value: 'communityQuestion'},
          {title: 'User', value: 'user'},
          {title: 'Teacher', value: 'teacher'},
        ],
        layout: 'dropdown'
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'reason',
      title: 'Report Reason',
      type: 'string',
      description: 'The reason for the report',
      options: {
        list: [
          {title: 'Inappropriate Content', value: 'inappropriate'},
          {title: 'Spam', value: 'spam'},
          {title: 'Harassment', value: 'harassment'},
          {title: 'Misinformation', value: 'misinformation'},
          {title: 'Copyright Violation', value: 'copyright'},
          {title: 'Violence', value: 'violence'},
          {title: 'Hate Speech', value: 'hate_speech'},
          {title: 'Other', value: 'other'},
        ],
        layout: 'dropdown'
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Additional Details',
      type: 'text',
      description: 'Additional details about the report (optional)',
      validation: (Rule) => Rule.max(1000),
    }),
    defineField({
      name: 'status',
      title: 'Report Status',
      type: 'string',
      description: 'The current status of the report',
      options: {
        list: [
          {title: 'Pending Review', value: 'pending'},
          {title: 'Under Investigation', value: 'investigating'},
          {title: 'Resolved - Content Removed', value: 'resolved_removed'},
          {title: 'Resolved - Warning Issued', value: 'resolved_warning'},
          {title: 'Resolved - No Action', value: 'resolved_no_action'},
          {title: 'Dismissed', value: 'dismissed'},
        ],
        layout: 'dropdown'
      },
      initialValue: 'pending',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'reviewedBy',
      title: 'Reviewed By',
      type: 'reference',
      to: [{type: 'user'}, {type: 'teacher'}],
      description: 'The admin or moderator who reviewed this report',
    }),
    defineField({
      name: 'reviewedAt',
      title: 'Reviewed At',
      type: 'datetime',
      description: 'When this report was reviewed',
    }),
    defineField({
      name: 'reviewNotes',
      title: 'Review Notes',
      type: 'text',
      description: 'Notes from the admin/moderator review',
      validation: (Rule) => Rule.max(1000),
    }),
    defineField({
      name: 'actionTaken',
      title: 'Action Taken',
      type: 'string',
      description: 'What action was taken on the reported content',
      options: {
        list: [
          {title: 'No Action', value: 'none'},
          {title: 'Content Removed', value: 'removed'},
          {title: 'User Warned', value: 'warned'},
          {title: 'User Suspended', value: 'suspended'},
          {title: 'User Banned', value: 'banned'},
        ],
        layout: 'dropdown'
      },
    }),
    defineField({
      name: 'createdAt',
      title: 'Reported At',
      type: 'datetime',
      description: 'When the report was submitted',
      initialValue: new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      description: 'When the report was last updated',
    }),
  ],
  preview: {
    select: {
      title: 'reason',
      reporter: 'reporter.username',
      contentType: 'contentType',
      status: 'status',
      createdAt: 'createdAt',
    },
    prepare({title, reporter, contentType, status, createdAt}: {title?: string, reporter?: string, contentType?: string, status?: string, createdAt?: string}) {
      const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        investigating: 'bg-blue-100 text-blue-800',
        resolved_removed: 'bg-red-100 text-red-800',
        resolved_warning: 'bg-orange-100 text-orange-800',
        resolved_no_action: 'bg-green-100 text-green-800',
        dismissed: 'bg-gray-100 text-gray-800',
      }
      
      return {
        title: title || 'Unknown Reason',
        subtitle: `${reporter || 'Unknown'} • ${contentType || 'Unknown'} • ${createdAt ? new Date(createdAt).toLocaleDateString() : 'Unknown date'}`,
        media: status === 'pending' ? <AlertTriangle className="h-4 w-4 text-yellow-500" /> : <Flag className="h-4 w-4" />,
      }
    }
  },
}); 