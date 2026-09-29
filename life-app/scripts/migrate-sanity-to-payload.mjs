/**
 * One-time export from Sanity into the running Payload app.
 *
 * Portable Text bodies become HTML. Images are downloaded off cdn.sanity.io
 * and uploaded to Payload media (local disk, S3, or Vercel Blob).
 *
 *   PAYLOAD_BASE_URL=http://localhost:3000 \
 *   PAYLOAD_EMAIL=you@example.com \
 *   PAYLOAD_PASSWORD=secret \
 *   SANITY_PROJECT_ID=... SANITY_DATASET=production SANITY_TOKEN=... \
 *   node scripts/migrate-sanity-to-payload.mjs
 *
 * The Next server must already be up so /cms-api can accept the writes.
 * Create the studio user once at /admin before running this.
 */
const projectId = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_TOKEN || process.env.SANITY_ADMIN_API_TOKEN
const baseUrl = (process.env.PAYLOAD_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const email = process.env.PAYLOAD_EMAIL
const password = process.env.PAYLOAD_PASSWORD

if (!projectId || !token || !email || !password) {
  console.error('Need SANITY_PROJECT_ID, SANITY_TOKEN, PAYLOAD_EMAIL, and PAYLOAD_PASSWORD.')
  process.exit(1)
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function portableTextToHtml(value) {
  if (typeof value === 'string') return value
  if (!Array.isArray(value)) return ''
  const parts = []
  for (const block of value) {
    if (!block || typeof block !== 'object') continue
    if (block._type === 'image') {
      const media = await uploadImage(block.asset?._ref, block.alt || '')
      const src = media && media.url
      if (src) parts.push('<p><img src="' + escapeHtml(src) + '" alt="' + escapeHtml(block.alt || '') + '" /></p>')
      continue
    }
    if (block._type !== 'block') continue
    const inner = (block.children || []).map((span) => escapeHtml(span.text || '')).join('')
    const style = block.style || 'normal'
    if (block.listItem === 'bullet' || block.listItem === 'number') {
      parts.push('<li>' + inner + '</li>')
      continue
    }
    if (style === 'h1' || style === 'h2' || style === 'h3' || style === 'h4') {
      parts.push('<' + style + '>' + inner + '</' + style + '>')
      continue
    }
    if (style === 'blockquote') {
      parts.push('<blockquote>' + inner + '</blockquote>')
      continue
    }
    parts.push('<p>' + inner + '</p>')
  }
  return parts.join('\n')
}

function sanityImageUrl(ref) {
  if (!ref || typeof ref !== 'string' || !ref.startsWith('image-')) return null
  const match = ref.match(/^image-([a-zA-Z0-9]+)-(\d+x\d+)-(\w+)$/)
  if (!match) return null
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${match[1]}-${match[2]}.${match[3]}`
}

async function sanityQuery(query) {
  const url = `https://${projectId}.api.sanity.io/v2025-07-05/data/query/${dataset}?query=${encodeURIComponent(query)}`
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!response.ok) throw new Error(`Sanity query failed ${response.status}: ${await response.text()}`)
  const body = await response.json()
  return body.result
}

let payloadToken = ''

async function login() {
  const response = await fetch(`${baseUrl}/cms-api/cms-users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) throw new Error(`Payload login failed ${response.status}: ${await response.text()}`)
  const body = await response.json()
  payloadToken = body.token || ''
  if (!payloadToken) throw new Error('Payload login did not return a token')
}

async function api(path, options = {}) {
  const headers = new Headers(options.headers || {})
  headers.set('Authorization', `JWT ${payloadToken}`)
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers })
  const text = await response.text()
  const body = text ? JSON.parse(text) : null
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${path} failed ${response.status}: ${text}`)
  }
  return body
}

async function findBySanityId(collection, sanityId) {
  const params = new URLSearchParams()
  params.set('where[sanityId][equals]', sanityId)
  params.set('limit', '1')
  const body = await api(`/cms-api/${collection}?${params.toString()}`)
  return body.docs?.[0] || null
}

async function uploadImage(ref, alt) {
  const url = sanityImageUrl(ref)
  if (!url) return null
  const existing = await findBySanityId('media', ref)
  if (existing) return existing
  const image = await fetch(url)
  if (!image.ok) {
    console.warn('skip image', url, image.status)
    return null
  }
  const bytes = Buffer.from(await image.arrayBuffer())
  const filename = url.split('/').pop() || 'image.jpg'
  const form = new FormData()
  form.set('file', new Blob([bytes]), filename)
  form.set('alt', alt || '')
  form.set('sanityId', ref)
  const created = await api('/cms-api/media', { method: 'POST', body: form })
  return created.doc || null
}

async function upsert(collection, sanityId, data) {
  const existing = await findBySanityId(collection, sanityId)
  if (existing) {
    const updated = await api(`/cms-api/${collection}/${existing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return updated.doc
  }
  const created = await api(`/cms-api/${collection}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, sanityId }),
  })
  return created.doc
}

async function main() {
  await login()
  const tags = await sanityQuery(`*[_type == "tag"]{ _id, name, "slug": slug.current, description, color }`)
  const tagIds = {}
  for (const tag of tags || []) {
    const doc = await upsert('tags', tag._id, {
      name: tag.name,
      slug: tag.slug || tag.name,
      description: tag.description || '',
      color: tag.color || 'blue',
    })
    tagIds[tag._id] = doc.id
    console.log('tag', tag.name)
  }

  const categories = await sanityQuery(`*[_type == "lessonCategory"]{ _id, title, "slug": slug.current, description, sortOrder, isActive }`)
  const categoryIds = {}
  for (const category of categories || []) {
    const doc = await upsert('lesson-categories', category._id, {
      title: category.title,
      slug: category.slug || category.title,
      description: category.description || '',
      sortOrder: category.sortOrder || 0,
      isActive: category.isActive !== false,
    })
    categoryIds[category._id] = doc.id
    console.log('category', category.title)
  }

  const blogs = await sanityQuery(`*[_type == "blog"]{
    _id, title, "slug": slug.current, description, content, viewCount, isDeleted,
    "authorId": author->_id, "authorUsername": author->username, "authorImageURL": author->imageURL, "authorRole": author->role,
    "tagIds": tags[]._ref, image
  }`)
  for (const blog of blogs || []) {
    const cover = await uploadImage(blog.image?.asset?._ref, blog.title)
    await upsert('blogs', blog._id, {
      title: blog.title || 'Untitled',
      slug: blog.slug || blog._id,
      description: blog.description || '',
      content: (await portableTextToHtml(blog.content)) || '<p></p>',
      cover: cover?.id,
      authorId: blog.authorId || 'migrated',
      authorUsername: blog.authorUsername || '',
      authorImageURL: blog.authorImageURL || '',
      authorRole: blog.authorRole || '',
      tags: (blog.tagIds || []).map((id) => tagIds[id]).filter(Boolean),
      viewCount: blog.viewCount || 0,
      isDeleted: Boolean(blog.isDeleted),
    })
    console.log('blog', blog.title)
  }

  const lessons = await sanityQuery(`*[_type == "lesson"]{
    _id, title, "slug": slug.current, description, videoId, content, sortOrder, isPublished, viewCount,
    "categoryId": category->_id, "tagIds": tags[]._ref,
    "createdById": createdBy->_id, "createdByUsername": createdBy->username
  }`)
  for (const lesson of lessons || []) {
    await upsert('lessons', lesson._id, {
      title: lesson.title || 'Untitled',
      slug: lesson.slug || lesson._id,
      description: lesson.description || '',
      videoId: lesson.videoId || 'unknown',
      category: categoryIds[lesson.categoryId],
      tags: (lesson.tagIds || []).map((id) => tagIds[id]).filter(Boolean),
      content: await portableTextToHtml(lesson.content),
      sortOrder: lesson.sortOrder || 0,
      isPublished: lesson.isPublished !== false,
      createdById: lesson.createdById || '',
      createdByUsername: lesson.createdByUsername || '',
      viewCount: lesson.viewCount || 0,
    })
    console.log('lesson', lesson.title)
  }

  const pages = await sanityQuery(`*[_type == "page"]{
    _id, title, "slug": slug.current, description, content, isPublished, routeBehavior, redirectTo, redirectType
  }`)
  for (const page of pages || []) {
    await upsert('pages', page._id, {
      title: page.title || 'Untitled',
      slug: page.slug || page._id,
      description: page.description || '',
      content: await portableTextToHtml(page.content),
      isPublished: page.isPublished !== false,
      routeBehavior: page.routeBehavior || 'render',
      redirectTo: page.redirectTo || '',
      redirectType: page.redirectType || 'temporary',
    })
    console.log('page', page.title)
  }

  console.log('Sanity content export finished. Images are on Payload media, not cdn.sanity.io.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
