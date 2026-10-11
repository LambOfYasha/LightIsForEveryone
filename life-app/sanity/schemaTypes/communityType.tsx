import {defineField, defineType} from "sanity";
import { UsersIcon } from "lucide-react";

export const communityType = defineType({
    name: 'communityQuestion',
    title: 'Community Question',
    type: 'document',
    icon: UsersIcon,
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            description: 'The title of the community',
            validation: (Rule) => Rule.required().min(3).max(100),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            description: 'The description of the community',
        }),
        defineField({
            name: 'content',
            title: 'Content',
            type: 'text',
            description: 'The rich content body of the community question',
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            description: 'The slug of the community',
            options: {
                source: 'title',
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            description: 'The image of the community',
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
            name: 'status',
            title: 'Status',
            type: 'string',
            description: 'The status of the community',
            options: {
                list: [
                    {title: 'Active', value: 'active'},
                    {title: 'Moderated', value: 'moderated'},
                    {title: 'Suspended', value: 'suspended'},
                    {title: 'Archived', value: 'archived'},
                ]
            },
            initialValue: 'active',
        }),
        defineField({
            name: 'isActive',
            title: 'Is Active',
            type: 'boolean',
            description: 'Whether the community is active',
            initialValue: true,
        }),
        defineField({
            name: 'isPrivate',
            title: 'Is Private',
            type: 'boolean',
            description: 'Whether the community is private',
            initialValue: false,
        }),
        defineField({
            name: 'requireApproval',
            title: 'Require Approval',
            type: 'boolean',
            description: 'Whether posts require approval',
            initialValue: false,
        }),
        defineField({
            name: 'allowGuestPosts',
            title: 'Allow Guest Posts',
            type: 'boolean',
            description: 'Whether guest posts are allowed',
            initialValue: true,
        }),
        defineField({
            name: 'maxPostsPerDay',
            title: 'Max Posts Per Day',
            type: 'number',
            description: 'Maximum number of posts per day',
            initialValue: 10,
        }),
        defineField({
            name: 'maxMembers',
            title: 'Max Members',
            type: 'number',
            description: 'Maximum number of members',
            initialValue: 1000,
        }),
        defineField({
            name: 'autoModeration',
            title: 'Auto Moderation',
            type: 'boolean',
            description: 'Whether auto-moderation is enabled',
            initialValue: true,
        }),
        defineField({
            name: 'contentGuidelines',
            title: 'Content Guidelines',
            type: 'text',
            description: 'Content guidelines for the community',
        }),
        defineField({
            name: 'lastActivity',
            title: 'Last Activity',
            type: 'datetime',
            description: 'The last activity in the community',
        }),
        defineField({
            name: 'moderator',
            title: 'Moderator',
            type: 'reference',
            to: [{type: 'user'}, {type: 'teacher'}],
            description: 'The moderator of the community (can be a user or teacher)',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'createdAt',
            title: 'Created At',
            type: 'datetime',
            description: 'The date and time the community was created',
            initialValue: new Date().toISOString(),
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'isDeleted',
            title: 'Is Deleted',
            type: 'boolean',
            description: 'Whether the community is deleted',
            initialValue: false,
        }),
        defineField({
            name: 'deletedAt',
            title: 'Deleted At',
            type: 'datetime',
            description: 'When the community was deleted',
        }),
        defineField({
            name: 'deletedBy',
            title: 'Deleted By',
            type: 'reference',
            to: [{type: 'user'}, {type: 'teacher'}],
            description: 'Who deleted the community',
        }),
        defineField({
            name: 'comments',
            title: 'Comments',
            type: 'array',
            of: [{type: 'embeddedComment'}],
            description: 'Comments on this community question',
        }),
    ],
    preview: {
        select: {
            title: 'title',
            media: 'image',
            status: 'status',
        },
        prepare(selection: { title: string; media?: any; status?: string }) {
            const {title, media, status} = selection;
            return {
                title: title,
                subtitle: `Status: ${status || 'active'}`,
                media: media,
            };
        },
    }
})