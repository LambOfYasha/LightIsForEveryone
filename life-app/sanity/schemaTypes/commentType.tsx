import {defineField, defineType} from "sanity";
import { MessageSquare } from "lucide-react";

export const commentType = defineType({
  name: 'comment',
  title: 'Comment',
  type: 'document',
  icon: MessageSquare,
  fields: [
    defineField({
      name: 'content',
      title: 'Content',
      type: 'text',
      description: 'The comment content',
      validation: (Rule) => Rule.required().min(1).max(1000),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'user'}, {type: 'teacher'}],
      description: 'The author of the comment',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'post',
      title: 'Post',
      type: 'reference',
      to: [{type: 'communityQuestion'}, {type: 'blog'}],
      description: 'The post this comment belongs to',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'postType',
      title: 'Post Type',
      type: 'string',
      description: 'The type of post this comment belongs to',
      options: {
        list: [
          {title: 'Community Question', value: 'community'},
          {title: 'Blog Post', value: 'blog'},
        ],
        layout: 'radio'
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'parentComment',
      title: 'Parent Comment',
      type: 'reference',
      to: [{type: 'comment'}],
      description: 'The parent comment if this is a reply',
    }),
    defineField({
      name: 'replies',
      title: 'Replies',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'comment'}]}],
      description: 'Child comments/replies to this comment',
    }),
    defineField({
      name: 'likes',
      title: 'Likes',
      type: 'number',
      description: 'Number of likes on this comment',
      initialValue: 0,
    }),
    defineField({
      name: 'likedBy',
      title: 'Liked By',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Array of user IDs who liked this comment',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      description: 'When the comment was created',
      initialValue: new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      description: 'When the comment was last updated',
    }),
  ],
  preview: {
    select: {
      title: 'content',
      author: 'author.username',
      post: 'post.title',
      createdAt: 'createdAt',
    },
    prepare({title, author, post, createdAt}: {title?: string, author?: string, post?: string, createdAt?: string}) {
      return {
        title: title?.slice(0, 50) + (title && title.length > 50 ? '...' : ''),
        subtitle: `${author || 'Unknown'} on ${post || 'Unknown post'} • ${createdAt ? new Date(createdAt).toLocaleDateString() : 'Unknown date'}`,
        media: MessageSquare,
      }
    }
  },
});