import { defineField, defineType } from "sanity";
import { FileText } from "lucide-react";
import { getPageRedirectTargetError } from "../../lib/pages";

type PagePreviewDocument = {
  title?: string;
  slug?: string;
  isPublished?: boolean;
  routeBehavior?: 'render' | 'redirect';
  redirectTo?: string;
};

export const pageType = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: FileText,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The title shown at the top of the page',
      validation: (Rule) => Rule.required().min(2).max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'The route slug for this page',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Optional summary shown under the page title',
      validation: (Rule) => Rule.max(240),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'text',
      description: 'The page content (HTML)',
      hidden: ({ document }) => document?.routeBehavior === 'redirect',
      validation: (Rule) =>
        Rule.custom((value: unknown, context) => {
          if (context.document?.routeBehavior !== 'redirect' && (!value || typeof value !== 'string' || !value.trim())) {
            return 'Page content is required when this route shows a page.';
          }

          return true;
        }),
    }),
    defineField({
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      description: 'Controls whether this page is visible to the public',
      initialValue: true,
    }),
    defineField({
      name: 'routeBehavior',
      title: 'Route Behavior',
      type: 'string',
      description: 'Choose whether this route shows its page content or sends visitors to another page',
      options: {
        list: [
          { title: 'Show this page', value: 'render' },
          { title: 'Redirect to another page', value: 'redirect' },
        ],
        layout: 'radio',
      },
      initialValue: 'render',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'redirectTo',
      title: 'Redirect To',
      type: 'string',
      description: 'Enter an internal path like /contact or a full external URL like https://example.com',
      hidden: ({ document }) => document?.routeBehavior !== 'redirect',
      validation: (Rule) =>
        Rule.custom((value: unknown, context) => {
          if (context.document?.routeBehavior === 'redirect' && (!value || typeof value !== 'string' || !value.trim())) {
            return 'A destination path is required when this route redirects visitors.';
          }

          if (context.document?.routeBehavior === 'redirect' && typeof value === 'string') {
            return getPageRedirectTargetError(value) || true;
          }

          return true;
        }),
    }),
    defineField({
      name: 'redirectType',
      title: 'Redirect Type',
      type: 'string',
      description: 'Temporary is best while testing; permanent is best when the old address has fully moved',
      options: {
        list: [
          { title: 'Temporary redirect', value: 'temporary' },
          { title: 'Permanent redirect', value: 'permanent' },
        ],
        layout: 'radio',
      },
      initialValue: 'temporary',
      hidden: ({ document }) => document?.routeBehavior !== 'redirect',
      validation: (Rule) =>
        Rule.custom((value: unknown, context) => {
          if (context.document?.routeBehavior === 'redirect' && !value) {
            return 'Choose whether this redirect is temporary or permanent.';
          }

          return true;
        }),
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      description: 'The date and time the page was created',
      initialValue: new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      description: 'The date and time the page was last updated',
      initialValue: new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      isPublished: 'isPublished',
      routeBehavior: 'routeBehavior',
      redirectTo: 'redirectTo',
    },
    prepare({
      title,
      slug,
      isPublished,
      routeBehavior,
      redirectTo,
    }: PagePreviewDocument) {
      const routeLabel = slug ? `/${slug}` : 'No route';
      const behaviorLabel = routeBehavior === 'redirect' && redirectTo ? `${routeLabel} → ${redirectTo}` : routeLabel;

      return {
        title,
        subtitle: `${isPublished ? 'Published' : 'Draft'} • ${behaviorLabel}`,
      };
    },
  },
});
