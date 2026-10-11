import {defineField, defineType} from "sanity";
import { FolderOpen } from "lucide-react";

export const lessonCategoryType = defineType({
  name: 'lessonCategory',
  title: 'Lesson Category',
  type: 'document',
  icon: FolderOpen,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The name of the category (e.g. Fundamentals, Law, Live Stream)',
      validation: (Rule) => Rule.required().min(2).max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly identifier for this category',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'A brief description of this category',
      rows: 3,
      validation: (Rule) => Rule.max(500),
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      description: 'Controls the display order of categories (lower numbers appear first)',
      initialValue: 0,
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      description: 'Whether this category is visible on the lessons page',
      initialValue: true,
    }),
    defineField({
      name: 'createdBy',
      title: 'Created By',
      type: 'reference',
      to: [{type: 'user'}],
      description: 'The user who created this category',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      description: 'When this category was created',
      initialValue: new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      description: 'When this category was last updated',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      description: 'description',
      isActive: 'isActive',
      sortOrder: 'sortOrder',
    },
    prepare({title, description, isActive, sortOrder}: {
      title?: string,
      description?: string,
      isActive?: boolean,
      sortOrder?: number,
    }) {
      const status = isActive ? 'Active' : 'Hidden';
      return {
        title,
        subtitle: `${status} • Order: ${sortOrder ?? 0}${description ? ` • ${description.slice(0, 60)}` : ''}`,
        media: FolderOpen,
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
  ],
});
