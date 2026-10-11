import {defineField, defineType} from "sanity";
import { FileText, CheckCircle } from "lucide-react";

export const postType = defineType({
    name: 'post',
    title: 'Community Response',
    type: 'document',
    icon: FileText,
    fields: [
        defineField({
      name: 'title',
      title: 'Title',  
      type: 'string',
      description: 'The title of the post',
      validation: (Rule) => Rule.required().min(3).max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'The slug of the response',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'originalTitle',
      title: 'Original Title',
      type: 'string',
      description: 'The original title of the post in case deleted',
      hidden: true,
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'user'}, {type: 'teacher'}],
      description: 'The author of the post (can be a user or teacher)',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'communityQuestion',
      title: 'Community Question',
      type: 'reference',
      description: 'The community question this response belongs to',
      to: [{type: 'communityQuestion'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isApproved',
      title: 'Teacher Approved',
      type: 'boolean',
      description: 'Whether this response has been approved by a teacher or admin',
      initialValue: false,
    }),
    defineField({
      name: 'approvedBy',
      title: 'Approved By',
      type: 'reference',
      description: 'The teacher or admin who approved this response',
      to: [{type: 'user'}, {type: 'teacher'}],
    }),
    defineField({
      name: 'approvedAt',
      title: 'Approved At',
      type: 'datetime',
      description: 'When this response was approved',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      description: 'The body of the post',
      of: [{type: 'block'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description: 'The image of the post',
      fields: [
        {
            name: 'alt',
            title: 'Alt Text',
            type: 'string',
            description: 'The alt text for the image',
        },
      ]
    }),
    defineField({
        name: 'isReported',
        title: 'Is Reported',
        type: 'boolean',
        description: 'Whether the response has been reported',
        initialValue: false,
    }),
    defineField({
        name: 'isDeleted',
        title: 'Is Deleted',
        type: 'boolean',
        description: 'Whether the response has been deleted',
        initialValue: false,
    }),
    defineField({
        name: 'publishedAt',
        title: 'Published At',
        type: 'datetime',
        description: 'The date and time the response was published',
        initialValue: new Date().toISOString(),
    }),
],
preview: {
    select: {
        title: 'title',
        subtitle: 'author.username',
        media: 'image',
        isApproved: 'isApproved',
        communityQuestion: 'communityQuestion.title',
    },
    prepare({title, subtitle, media, isApproved, communityQuestion}: {title?: string, subtitle?: string, media?: any, isApproved?: boolean, communityQuestion?: string}) {
        return {
            title,
            subtitle: `${subtitle} • ${communityQuestion}`,
            media: isApproved ? CheckCircle : media,
        }
    }
}
})
