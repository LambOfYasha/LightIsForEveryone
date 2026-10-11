import {defineField, defineType} from "sanity";

export const embeddedCommentType = defineType({
  name: 'embeddedComment',
  title: 'Comment',
  type: 'object',
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
      name: 'authorId',
      title: 'Author ID',
      type: 'string',
      description: 'The Clerk ID of the author for quick access',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'authorUsername',
      title: 'Author Username',
      type: 'string',
      description: 'The username of the author for quick access',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'authorRole',
      title: 'Author Role',
      type: 'string',
      description: 'The role of the author (user/teacher)',
      options: {
        list: [
          {title: 'User', value: 'user'},
          {title: 'Teacher', value: 'teacher'},
        ],
        layout: 'radio'
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'parentCommentId',
      title: 'Parent Comment ID',
      type: 'string',
      description: 'The ID of the parent comment if this is a reply',
    }),
    defineField({
      name: 'replies',
      title: 'Replies',
      type: 'array',
      of: [{type: 'embeddedComment'}],
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
      author: 'authorUsername',
      createdAt: 'createdAt',
    },
    prepare({title, author, createdAt}: {title?: string, author?: string, createdAt?: string}) {
      return {
        title: title?.slice(0, 50) + (title && title.length > 50 ? '...' : ''),
        subtitle: `${author || 'Unknown'} • ${createdAt ? new Date(createdAt).toLocaleDateString() : 'Unknown date'}`,
      }
    }
  },
}); 