import {defineField, defineType} from "sanity";
import { BookIcon } from "lucide-react";


export const blogType = defineType({
    name: 'blog',
    title: 'Blog',
    type: 'document',
    icon: BookIcon,
    fields: [
        defineField({
            name: 'title',
            title: 'Title', 
            type: 'string',
            description: 'The title of the blog',
            validation: (Rule) => Rule.required().min(3).max(100),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            description: 'The slug of the blog',
            options: {source: 'title'},
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            description: 'The description of the blog',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            description: 'The image of the blog',
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
            name: 'content',
            title: 'Content',
            type: 'text',
            description: 'The content of the blog (HTML)',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'author',
            title: 'Author',
            type: 'reference',
            to: [{type: 'teacher'}, {type: 'user'}],
            description: 'The author of the blog (can be a teacher or user)',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'createdAt',
            title: 'Created At',
            type: 'datetime',
            description: 'The date and time the blog was created',
            initialValue: new Date().toISOString(),
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'comments',
            title: 'Comments',
            type: 'array',
            of: [{type: 'embeddedComment'}],
            description: 'Comments on this blog post',
        }),
        defineField({
            name: 'tags',
            title: 'Tags',
            type: 'array',
            of: [{type: 'reference', to: [{type: 'tag'}]}],
            description: 'Tags associated with this blog post',
        }),
        defineField({
            name: 'viewCount',
            title: 'View Count',
            type: 'number',
            description: 'Number of views this blog post has received',
            initialValue: 0,
            validation: (Rule) => Rule.min(0),
        }),
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'author.username',
            media: 'image',
            tags: 'tags[0...3].name',
        },
        prepare({title, subtitle, media, tags}: {title?: string, subtitle?: string, media?: any, tags?: string[]}) {
            return {
                title,
                subtitle: tags && tags.length > 0 ? `${subtitle} • ${tags.join(', ')}` : subtitle,
                media,
            }
        }
    }
})