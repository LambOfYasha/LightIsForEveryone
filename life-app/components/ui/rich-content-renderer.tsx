'use client';

import React from 'react';
import { cn, richTextContentToHtml } from '@/lib/utils';

interface RichContentRendererProps {
  content: string | any[];
  className?: string;
  stripThemeConflictingInlineStyles?: boolean;
}

const allowedInlineStyleProperties = new Set([
  'aspect-ratio',
  'bottom',
  'height',
  'left',
  'max-height',
  'max-width',
  'min-height',
  'min-width',
  'overflow',
  'overflow-x',
  'overflow-y',
  'padding-bottom',
  'position',
  'right',
  'text-align',
  'top',
  'width',
]);

export default function RichContentRenderer({ content, className, stripThemeConflictingInlineStyles = false }: RichContentRendererProps) {
  // Process and sanitize the content
  const processContent = (value: string | any[]) => {
    const processed = richTextContentToHtml(value);
    
    // Sanitize the content to prevent XSS attacks
    const sanitized = processed
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Allow safe iframe content (YouTube, Vimeo, etc.)
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, (match) => {
        // Only allow iframes from trusted sources
        if (match.includes('youtube.com/embed/') || 
            match.includes('youtu.be/') ||
            match.includes('vimeo.com/') ||
            match.includes('player.vimeo.com/') ||
            match.includes('dailymotion.com/')) {
          return match;
        }
        return ''; // Remove unsafe iframes
      })
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');

    if (!stripThemeConflictingInlineStyles) {
      return sanitized;
    }

    return sanitized.replace(/\sstyle\s*=\s*("([^"]*)"|'([^']*)')/gi, (...args) => {
      const doubleQuotedStyles = typeof args[2] === 'string' ? args[2] : '';
      const singleQuotedStyles = typeof args[3] === 'string' ? args[3] : '';
      const styleValue = doubleQuotedStyles || singleQuotedStyles;
      const preservedDeclarations = styleValue
        .split(';')
        .map((declaration) => declaration.trim())
        .filter(Boolean)
        .filter((declaration) => {
          const [propertyName] = declaration.split(':');
          return propertyName
            ? allowedInlineStyleProperties.has(propertyName.trim().toLowerCase())
            : false;
        });

      return preservedDeclarations.length > 0
        ? ` style="${preservedDeclarations.join('; ')}"`
        : '';
    });
  };

  const processedContent = processContent(content);

  return (
    <div 
      className={cn(
        "prose max-w-none",
        "prose-headings:font-bold prose-headings:text-foreground",
        "prose-p:text-muted-foreground prose-p:leading-relaxed",
        "prose-a:text-primary prose-a:underline prose-a:no-underline hover:prose-a:underline",
        "prose-strong:font-bold prose-strong:text-foreground",
        "prose-em:italic prose-em:text-muted-foreground",
        "prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-foreground",
        "prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto",
        "prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:pl-4 prose-blockquote:italic",
        "prose-ul:list-disc prose-ul:pl-6",
        "prose-ol:list-decimal prose-ol:pl-6",
        "prose-li:text-muted-foreground [&_li>p]:my-0",
        "prose-table:border-collapse prose-table:w-full",
        "prose-th:border prose-th:border-border prose-th:px-4 prose-th:py-2 prose-th:bg-muted",
        "prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2",
        "prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg",
        "prose-video:max-w-full prose-video:h-auto prose-video:rounded-lg",
        // Custom styles for video containers
        "[&_.video-container]:relative [&_.video-container]:pb-[56.25%] [&_.video-container]:h-0 [&_.video-container]:overflow-hidden [&_.video-container]:max-w-full [&_.video-container]:my-4",
        "[&_.video-container_iframe]:absolute [&_.video-container_iframe]:top-0 [&_.video-container_iframe]:left-0 [&_.video-container_iframe]:w-full [&_.video-container_iframe]:h-full [&_.video-container_iframe]:border-0",
        "[&_iframe]:max-w-full [&_iframe]:rounded-lg",
        className
      )}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}