import {defineField, defineType} from "sanity";
import { TagIcon } from "lucide-react";

export const tagType = defineType({
  name: 'tag',
  title: 'Tag',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'The name of the tag',
      validation: (Rule) => Rule.required().min(2).max(50),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'The slug of the tag',
      options: {
        source: 'name',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'A brief description of the tag',
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'color',
      title: 'Color',
      type: 'string',
      description: 'The color associated with this tag',
      options: {
        list: [
          {title: 'Blue', value: 'blue'},
          {title: 'Green', value: 'green'},
          {title: 'Red', value: 'red'},
          {title: 'Yellow', value: 'yellow'},
          {title: 'Purple', value: 'purple'},
          {title: 'Orange', value: 'orange'},
          {title: 'Pink', value: 'pink'},
          {title: 'Gray', value: 'gray'},
        ],
        layout: 'dropdown'
      },
      initialValue: 'blue',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      description: 'When the tag was created',
      initialValue: new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      description: 'description',
      color: 'color',
    },
    prepare({title, description, color}: {title?: string, description?: string, color?: string}) {
      return {
        title,
        subtitle: description || 'No description',
        media: TagIcon,
      }
    }
  },
});
