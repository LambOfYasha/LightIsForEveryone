import {defineField, defineType} from "sanity";
import { PlayCircle } from "lucide-react";

export const lessonType = defineType({
  name: 'lesson',
  title: 'Lesson',
  type: 'document',
  icon: PlayCircle,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The title of the lesson',
      validation: (Rule) => Rule.required().min(3).max(200),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly identifier for this lesson',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'A brief description of the lesson',
      rows: 3,
      validation: (Rule) => Rule.max(1000),
    }),
    defineField({
      name: 'videoId',
      title: 'YouTube Video ID',
      type: 'string',
      description: 'The YouTube video ID (e.g. "dQw4w9WgXcQ" from https://youtube.com/watch?v=dQw4w9WgXcQ)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'lessonCategory'}],
      description: 'The category this lesson belongs to',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'tag'}]}],
      description: 'Tags associated with this lesson',
    }),
    defineField({
      name: 'content',
      title: 'Additional Content',
      type: 'text',
      description: 'Additional written content or notes for this lesson (supports HTML)',
      rows: 10,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      description: 'Controls the display order within the category (lower numbers appear first)',
      initialValue: 0,
    }),
    defineField({
      name: 'isPublished',
      title: 'Is Published',
      type: 'boolean',
      description: 'Whether this lesson is visible on the lessons page',
      initialValue: true,
    }),
    defineField({
      name: 'createdBy',
      title: 'Created By',
      type: 'reference',
      to: [{type: 'user'}],
      description: 'The teacher/admin who created this lesson',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      description: 'When this lesson was created',
      initialValue: new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      description: 'When this lesson was last updated',
    }),
    defineField({
      name: 'viewCount',
      title: 'View Count',
      type: 'number',
      description: 'Number of views this lesson has received',
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      categoryTitle: 'category.title',
      isPublished: 'isPublished',
      videoId: 'videoId',
    },
    prepare({title, categoryTitle, isPublished, videoId}: {
      title?: string,
      categoryTitle?: string,
      isPublished?: boolean,
      videoId?: string,
    }) {
      const status = isPublished ? 'Published' : 'Draft';
      return {
        title,
        subtitle: `${categoryTitle || 'No category'} • ${status} • ${videoId || 'No video'}`,
        media: PlayCircle,
      }
    }
  },
  orderings: [
    {
      title: 'Sort Order',
      name: 'sortOrderAsc',
      by: [{field: 'sortOrder', direction: 'asc'}],
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
    {
      title: 'Newest First',
      name: 'createdAtDesc',
      by: [{field: 'createdAt', direction: 'desc'}],
    },
  ],
});
