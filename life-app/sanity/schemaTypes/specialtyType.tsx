import { defineField, defineType } from "sanity";
import { BookOpen } from "lucide-react";

export const specialtyType = defineType({
  name: 'specialty',
  title: 'Specialty',
  type: 'document',
  icon: BookOpen,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'The name of the specialty',
      validation: (Rule) => Rule.required().min(2).max(100),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'A brief description of the specialty',
      rows: 3,
    }),
    defineField({
      name: 'color',
      title: 'Color',
      type: 'string',
      description: 'Color code for the specialty (hex format)',
      validation: (Rule) => Rule.required(),
      initialValue: '#3B82F6',
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      description: 'Whether this specialty is available for teachers to select',
      initialValue: true,
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      description: 'When this specialty was created',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      description: 'When this specialty was last updated',
    }),
    defineField({
      name: 'isDeleted',
      title: 'Is Deleted',
      type: 'boolean',
      description: 'Whether this specialty has been deleted',
      initialValue: false,
      hidden: true,
    }),
    defineField({
      name: 'deletedAt',
      title: 'Deleted At',
      type: 'datetime',
      description: 'When this specialty was deleted',
      hidden: true,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      description: 'description',
      color: 'color',
      isActive: 'isActive',
    },
    prepare({ title, description, color, isActive }: {
      title?: string,
      description?: string,
      color?: string,
      isActive?: boolean
    }) {
      return {
        title: title || 'Untitled Specialty',
        subtitle: description || 'No description',
        media: (
          <div 
            style={{ 
              backgroundColor: color || '#3B82F6',
              width: '100%',
              height: '100%',
              borderRadius: '4px'
            }}
          />
        ),
        ...(isActive === false && { subtitle: `${description || 'No description'} (Inactive)` })
      };
    },
  },
}); 