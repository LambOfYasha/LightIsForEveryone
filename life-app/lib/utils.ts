import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(imageURL: string | undefined): string | null {
  if (!imageURL) return null;
  
  // If it's already a full URL, return as is
  if (imageURL.startsWith('http://') || imageURL.startsWith('https://') || imageURL.startsWith('/')) {
    return imageURL;
  }
  
  // If it's a Sanity image reference, construct the URL
  if (imageURL.includes('image-')) {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
    
    if (projectId && dataset) {
      return `https://cdn.sanity.io/images/${projectId}/${dataset}/${imageURL.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png')}`;
    }
  }
  
  return null;
}

export function normalizeRichTextLinkUrl(url: string): string {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return '';
  }

  if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('#')) {
    return trimmedUrl;
  }

  if (trimmedUrl.startsWith('//')) {
    return `https:${trimmedUrl}`;
  }

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmedUrl)) {
    return trimmedUrl;
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedUrl)) {
    return `mailto:${trimmedUrl}`;
  }

  return `https://${trimmedUrl}`;
}

function escapeRichTextHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function decodeRichTextHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function isHtmlString(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function plainTextToHtml(value: string): string {
  const normalizedValue = value.replace(/\r\n?/g, '\n').trim();

  if (!normalizedValue) {
    return '';
  }

  return normalizedValue
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeRichTextHtml(paragraph).replace(/\n/g, '<br />')}</p>`)
    .join('');
}

function portableTextSpanToHtml(span: any, markDefsByKey: Map<string, any>): string {
  let spanHtml = escapeRichTextHtml(typeof span?.text === 'string' ? span.text : '').replace(/\n/g, '<br />');
  const marks = Array.isArray(span?.marks) ? span.marks : [];

  for (const mark of marks) {
    const markDef = markDefsByKey.get(mark);

    if (mark === 'strong') {
      spanHtml = `<strong>${spanHtml}</strong>`;
      continue;
    }

    if (mark === 'em') {
      spanHtml = `<em>${spanHtml}</em>`;
      continue;
    }

    if (mark === 'underline') {
      spanHtml = `<u>${spanHtml}</u>`;
      continue;
    }

    if (mark === 'code') {
      spanHtml = `<code>${spanHtml}</code>`;
      continue;
    }

    if (mark === 'strike-through' || mark === 'strike') {
      spanHtml = `<s>${spanHtml}</s>`;
      continue;
    }

    if (markDef?._type === 'link' && typeof markDef.href === 'string') {
      const normalizedHref = normalizeRichTextLinkUrl(markDef.href);
      spanHtml = `<a href="${escapeRichTextHtml(normalizedHref)}" target="_blank" rel="noopener noreferrer nofollow">${spanHtml}</a>`;
    }
  }

  return spanHtml;
}

function portableTextBlocksToHtml(blocks: any[]): string {
  let html = '';
  let currentListTag: 'ul' | 'ol' | null = null;

  for (const block of blocks) {
    if (block?._type === 'block') {
      const markDefsByKey = new Map(
        Array.isArray(block.markDefs)
          ? block.markDefs
              .filter((markDef: any) => typeof markDef?._key === 'string')
              .map((markDef: any) => [markDef._key, markDef])
          : []
      );

      const blockContent = Array.isArray(block.children)
        ? block.children.map((child: any) => portableTextSpanToHtml(child, markDefsByKey)).join('')
        : '';

      if (block.listItem) {
        const nextListTag = block.listItem === 'number' ? 'ol' : 'ul';

        if (currentListTag !== nextListTag) {
          if (currentListTag) {
            html += `</${currentListTag}>`;
          }

          currentListTag = nextListTag;
          html += `<${currentListTag}>`;
        }

        html += `<li>${blockContent}</li>`;
        continue;
      }

      if (currentListTag) {
        html += `</${currentListTag}>`;
        currentListTag = null;
      }

      const blockStyle = typeof block.style === 'string' ? block.style : 'normal';
      const blockTag =
        blockStyle === 'h1' ||
        blockStyle === 'h2' ||
        blockStyle === 'h3' ||
        blockStyle === 'h4' ||
        blockStyle === 'h5' ||
        blockStyle === 'h6'
          ? blockStyle
          : blockStyle === 'blockquote'
            ? 'blockquote'
            : 'p';

      html += `<${blockTag}>${blockContent}</${blockTag}>`;
      continue;
    }

    if (currentListTag) {
      html += `</${currentListTag}>`;
      currentListTag = null;
    }

    if (block?._type === 'image' && typeof block?.asset?.url === 'string') {
      const altText = typeof block.alt === 'string' ? escapeRichTextHtml(block.alt) : 'Image';
      html += `<img src="${escapeRichTextHtml(block.asset.url)}" alt="${altText}" />`;
    }
  }

  if (currentListTag) {
    html += `</${currentListTag}>`;
  }

  return html;
}

export function richTextContentToHtml(content: string | any[] | undefined | null): string {
  if (!content) {
    return '';
  }

  if (typeof content === 'string') {
    const decodedContent = decodeRichTextHtmlEntities(content);
    return isHtmlString(decodedContent) ? decodedContent : plainTextToHtml(decodedContent);
  }

  if (Array.isArray(content)) {
    return portableTextBlocksToHtml(content);
  }

  return '';
}

export function richTextContentToPlainText(content: string | any[] | undefined | null): string {
  const html = richTextContentToHtml(content);

  if (!html) {
    return '';
  }

  return decodeRichTextHtmlEntities(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/\s*(p|div|h1|h2|h3|h4|h5|h6|blockquote)\s*>/gi, '\n')
      .replace(/<li>/gi, '- ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]*>/g, '')
  )
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Calculate estimated read time for blog content
 * @param content - The blog content (string or PortableText blocks)
 * @returns Object with minutes and formatted string
 */
export function calculateReadTime(content: string | any[] | undefined): { minutes: number; formatted: string } {
  if (!content) {
    return { minutes: 0, formatted: 'Less than 1 min read' };
  }

  let text = richTextContentToPlainText(content);

  // Remove HTML tags and extra whitespace
  text = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

  // Average reading speed: 200-250 words per minute
  const wordsPerMinute = 225;
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);

  // Format the read time
  let formatted = '';
  if (minutes < 1) {
    formatted = 'Less than 1 min read';
  } else if (minutes === 1) {
    formatted = '1 min read';
  } else {
    formatted = `${minutes} min read`;
  }
  
  return { minutes, formatted };
}

/**
 * Format view count in a user-friendly way
 * @param count - The view count number
 * @returns Formatted string (e.g., "1.2k", "1.5M")
 */
export function formatViewCount(count: number): string {
  if (count < 1000) {
    return count.toString();
  } else if (count < 1000000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  } else {
    return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
}
