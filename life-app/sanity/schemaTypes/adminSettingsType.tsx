import {defineField, defineType} from "sanity";
import { Settings } from "lucide-react";

export const adminSettingsType = defineType({
  name: 'adminSettings',
  title: 'Admin Settings',
  type: 'document',
  icon: Settings,
  fields: [
    // General Settings
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      description: 'The name of the website',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'siteDescription',
      title: 'Site Description',
      type: 'text',
      description: 'A brief description of the website',
    }),
    defineField({
      name: 'maintenanceMode',
      title: 'Maintenance Mode',
      type: 'boolean',
      description: 'Enable maintenance mode to temporarily disable the site',
      initialValue: false,
    }),
    defineField({
      name: 'registrationEnabled',
      title: 'Registration Enabled',
      type: 'boolean',
      description: 'Allow new users to register',
      initialValue: true,
    }),
    defineField({
      name: 'guestAccess',
      title: 'Guest Access',
      type: 'boolean',
      description: 'Allow guest users to view content',
      initialValue: true,
    }),
    defineField({
      name: 'maxFileSize',
      title: 'Maximum File Size',
      type: 'string',
      description: 'Maximum file size for uploads',
      options: {
        list: [
          {title: '5MB', value: '5MB'},
          {title: '10MB', value: '10MB'},
          {title: '25MB', value: '25MB'},
          {title: '50MB', value: '50MB'},
        ]
      },
      initialValue: '10MB',
    }),
    defineField({
      name: 'maxPostsPerDay',
      title: 'Maximum Posts Per Day',
      type: 'number',
      description: 'Maximum number of posts a user can create per day',
      initialValue: 10,
    }),
    defineField({
      name: 'autoModeration',
      title: 'Auto Moderation',
      type: 'boolean',
      description: 'Enable automatic content moderation',
      initialValue: true,
    }),
    defineField({
      name: 'emailNotifications',
      title: 'Email Notifications',
      type: 'boolean',
      description: 'Send email notifications to users',
      initialValue: true,
    }),
    defineField({
      name: 'analyticsEnabled',
      title: 'Analytics Enabled',
      type: 'boolean',
      description: 'Enable analytics tracking',
      initialValue: true,
    }),

    // Security Settings
    defineField({
      name: 'requireEmailVerification',
      title: 'Require Email Verification',
      type: 'boolean',
      description: 'Require email verification for new accounts',
      initialValue: true,
    }),
    defineField({
      name: 'requireTwoFactor',
      title: 'Require Two-Factor Authentication',
      type: 'boolean',
      description: 'Require 2FA for all users',
      initialValue: false,
    }),
    defineField({
      name: 'sessionTimeout',
      title: 'Session Timeout (hours)',
      type: 'number',
      description: 'Session timeout in hours',
      initialValue: 24,
    }),
    defineField({
      name: 'maxLoginAttempts',
      title: 'Maximum Login Attempts',
      type: 'number',
      description: 'Maximum failed login attempts before lockout',
      initialValue: 5,
    }),
    defineField({
      name: 'passwordMinLength',
      title: 'Minimum Password Length',
      type: 'number',
      description: 'Minimum password length requirement',
      initialValue: 8,
    }),
    defineField({
      name: 'enableRateLimiting',
      title: 'Enable Rate Limiting',
      type: 'boolean',
      description: 'Enable rate limiting for API requests',
      initialValue: true,
    }),
    defineField({
      name: 'enableAuditLog',
      title: 'Enable Audit Log',
      type: 'boolean',
      description: 'Log all administrative actions',
      initialValue: true,
    }),
    defineField({
      name: 'enableBackup',
      title: 'Enable Automatic Backups',
      type: 'boolean',
      description: 'Enable automatic database backups',
      initialValue: true,
    }),

    // Database Settings
    defineField({
      name: 'backupFrequency',
      title: 'Backup Frequency',
      type: 'string',
      description: 'How often to create backups',
      options: {
        list: [
          {title: 'Hourly', value: 'hourly'},
          {title: 'Daily', value: 'daily'},
          {title: 'Weekly', value: 'weekly'},
          {title: 'Monthly', value: 'monthly'},
        ]
      },
      initialValue: 'daily',
    }),
    defineField({
      name: 'retentionPeriod',
      title: 'Retention Period (days)',
      type: 'number',
      description: 'How long to keep backups',
      initialValue: 30,
    }),
    defineField({
      name: 'enableCompression',
      title: 'Enable Compression',
      type: 'boolean',
      description: 'Compress database backups',
      initialValue: true,
    }),
    defineField({
      name: 'enableEncryption',
      title: 'Enable Encryption',
      type: 'boolean',
      description: 'Encrypt database backups',
      initialValue: true,
    }),
    defineField({
      name: 'maxConnections',
      title: 'Maximum Connections',
      type: 'number',
      description: 'Maximum database connections',
      initialValue: 100,
    }),

    // Email Settings
    defineField({
      name: 'smtpHost',
      title: 'SMTP Host',
      type: 'string',
      description: 'SMTP server hostname',
    }),
    defineField({
      name: 'smtpPort',
      title: 'SMTP Port',
      type: 'number',
      description: 'SMTP server port',
      initialValue: 587,
    }),
    defineField({
      name: 'smtpUsername',
      title: 'SMTP Username',
      type: 'string',
      description: 'SMTP server username',
    }),
    defineField({
      name: 'smtpPassword',
      title: 'SMTP Password',
      type: 'string',
      description: 'SMTP server password',
    }),
    defineField({
      name: 'fromEmail',
      title: 'From Email',
      type: 'string',
      description: 'Default sender email address',
      initialValue: 'noreply@domproject.com',
    }),
    defineField({
      name: 'fromName',
      title: 'From Name',
      type: 'string',
      description: 'Default sender name',
      initialValue: 'DOM Project',
    }),
    defineField({
      name: 'enableEmailNotifications',
      title: 'Enable Email Notifications',
      type: 'boolean',
      description: 'Send email notifications to users',
      initialValue: true,
    }),

    // Metadata
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      description: 'When these settings were created',
      initialValue: new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'createdBy',
      title: 'Created By',
      type: 'reference',
      to: [{type: 'user'}, {type: 'teacher'}],
      description: 'Who created these settings',
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      description: 'When these settings were last updated',
    }),
    defineField({
      name: 'updatedBy',
      title: 'Updated By',
      type: 'reference',
      to: [{type: 'user'}, {type: 'teacher'}],
      description: 'Who last updated these settings',
    }),
  ],
  preview: {
    select: {
      title: 'siteName',
      updatedAt: 'updatedAt',
      updatedBy: 'updatedBy.username',
    },
    prepare({title, updatedAt, updatedBy}: {title?: string, updatedAt?: string, updatedBy?: string}) {
      return {
        title: title || 'Admin Settings',
        subtitle: updatedAt ? `Last updated ${new Date(updatedAt).toLocaleDateString()} by ${updatedBy || 'Unknown'}` : 'Default settings',
        media: <Settings className="h-4 w-4" />,
      };
    }
  }
});