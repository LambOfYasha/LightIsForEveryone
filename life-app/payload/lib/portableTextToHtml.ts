type Span = { text?: string; marks?: string[] }
type Block = {
  _type?: string
  style?: string
  children?: Span[]
  url?: string
  alt?: string
  listItem?: string
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function renderSpan(span: Span) {
  let text = escapeHtml(span.text || '')
  const marks = span.marks || []
  if (marks.includes('strong')) text = `<strong>${text}</strong>`
  if (marks.includes('em')) text = `<em>${text}</em>`
  if (marks.includes('code')) text = `<code>${text}</code>`
  if (marks.includes('underline')) text = `<u>${text}</u>`
  return text
}

export function portableTextToHtml(value: unknown): string {
  if (typeof value === 'string') return value
  if (!Array.isArray(value)) return ''

  return (value as Block[])
    .map((block) => {
      if (!block || typeof block !== 'object') return ''
      if (block._type === 'image') {
        const src = block.url || ''
        const alt = escapeHtml(block.alt || '')
        return src ? `<p><img src="${escapeHtml(src)}" alt="${alt}" /></p>` : ''
      }
      if (block._type !== 'block') return ''
      const inner = (block.children || []).map(renderSpan).join('')
      const style = block.style || 'normal'
      if (block.listItem === 'bullet') return `<li>${inner}</li>`
      if (block.listItem === 'number') return `<li>${inner}</li>`
      if (style === 'h1' || style === 'h2' || style === 'h3' || style === 'h4') {
        return `<${style}>${inner}</${style}>`
      }
      if (style === 'blockquote') return `<blockquote>${inner}</blockquote>`
      return `<p>${inner}</p>`
    })
    .join('\n')
}
