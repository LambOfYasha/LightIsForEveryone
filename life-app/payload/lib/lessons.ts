import type { Where } from 'payload'
import { getPayloadClient } from './client'
import { asId, slugify } from './slug'

type Doc = Record<string, any>

function mapCategory(doc: Doc, lessonCount = 0) {
  return {
    _id: asId(doc),
    title: doc.title || '',
    slug: { current: doc.slug || '' },
    description: doc.description || '',
    sortOrder: doc.sortOrder ?? 0,
    isActive: Boolean(doc.isActive),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    lessonCount,
  }
}

function mapLesson(doc: Doc) {
  const category = doc.category && typeof doc.category === 'object' ? doc.category : null
  const tags = Array.isArray(doc.tags)
    ? doc.tags
        .filter((tag) => tag && typeof tag === 'object')
        .map((tag: Doc) => ({ _id: asId(tag), name: tag.name || '' }))
    : []

  return {
    _id: asId(doc),
    title: doc.title || '',
    slug: { current: doc.slug || '' },
    description: doc.description || '',
    videoId: doc.videoId || '',
    category: category ? { _id: asId(category), title: category.title || '' } : null,
    tags,
    content: doc.content || '',
    sortOrder: doc.sortOrder ?? 0,
    isPublished: Boolean(doc.isPublished),
    createdBy: doc.createdById
      ? { _id: doc.createdById, username: doc.createdByUsername || '' }
      : undefined,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    viewCount: doc.viewCount || 0,
  }
}

async function lessonCountFor(categoryId: string | number, publishedOnly = false) {
  const payload = await getPayloadClient()
  const where: Where = publishedOnly
    ? { and: [{ category: { equals: categoryId } }, { isPublished: { equals: true } }] }
    : { category: { equals: categoryId } }
  const result = await payload.count({ collection: 'lessons', where, overrideAccess: true })
  return result.totalDocs
}

export async function listLessonCategories(activeOnly = false) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'lesson-categories',
    where: activeOnly ? { isActive: { equals: true } } : undefined,
    sort: 'sortOrder',
    limit: 200,
    overrideAccess: true,
  })
  const categories = []
  for (const doc of result.docs) {
    categories.push(mapCategory(doc, await lessonCountFor(doc.id, activeOnly)))
  }
  return categories
}

export async function createLessonCategory(data: {
  title: string
  description?: string
  sortOrder?: number
  createdById?: string
}) {
  const payload = await getPayloadClient()
  const title = data.title.trim()
  const existing = await payload.find({
    collection: 'lesson-categories',
    where: { title: { equals: title } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs[0]) {
    return { success: false as const, error: 'A category with this title already exists' }
  }
  const created = await payload.create({
    collection: 'lesson-categories',
    data: {
      title,
      slug: slugify(title),
      description: data.description?.trim() || '',
      sortOrder: data.sortOrder ?? 0,
      isActive: true,
      createdById: data.createdById || '',
    },
    overrideAccess: true,
  })
  return { success: true as const, categoryId: asId(created), category: mapCategory(created) }
}

export async function updateLessonCategory(
  categoryId: string,
  data: { title?: string; description?: string; sortOrder?: number; isActive?: boolean },
) {
  const payload = await getPayloadClient()
  let existing: Doc | null = null
  try {
    existing = await payload.findByID({
      collection: 'lesson-categories',
      id: categoryId,
      overrideAccess: true,
    })
  } catch {
    existing = null
  }
  if (!existing) return { success: false as const, error: 'Category not found' }

  if (data.title) {
    const duplicate = await payload.find({
      collection: 'lesson-categories',
      where: { title: { equals: data.title.trim() } },
      limit: 5,
      overrideAccess: true,
    })
    if (duplicate.docs.some((doc) => asId(doc) !== categoryId)) {
      return { success: false as const, error: 'A category with this title already exists' }
    }
  }

  const updates: Record<string, unknown> = {}
  if (data.title !== undefined) {
    updates.title = data.title.trim()
    updates.slug = slugify(data.title)
  }
  if (data.description !== undefined) updates.description = data.description.trim()
  if (data.sortOrder !== undefined) updates.sortOrder = data.sortOrder
  if (data.isActive !== undefined) updates.isActive = data.isActive

  await payload.update({
    collection: 'lesson-categories',
    id: categoryId,
    data: updates,
    overrideAccess: true,
  })
  return { success: true as const }
}

export async function deleteLessonCategory(categoryId: string) {
  const count = await lessonCountFor(categoryId)
  if (count > 0) {
    return {
      success: false as const,
      error: `Cannot delete category: it has ${count} lesson(s). Remove or reassign them first.`,
    }
  }
  const payload = await getPayloadClient()
  await payload.delete({ collection: 'lesson-categories', id: categoryId, overrideAccess: true })
  return { success: true as const }
}

export async function listLessons(filters?: {
  categoryId?: string
  search?: string
  isPublished?: boolean
  page?: number
  limit?: number
}) {
  const payload = await getPayloadClient()
  const and: Where[] = []
  if (filters?.categoryId) and.push({ category: { equals: filters.categoryId } })
  if (filters?.isPublished !== undefined) and.push({ isPublished: { equals: filters.isPublished } })
  if (filters?.search) {
    and.push({
      or: [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ],
    })
  }
  const page = filters?.page || 1
  const limit = filters?.limit || 50
  const result = await payload.find({
    collection: 'lessons',
    where: and.length ? { and } : undefined,
    sort: 'sortOrder',
    page,
    limit,
    depth: 1,
    overrideAccess: true,
  })
  return {
    lessons: result.docs.map(mapLesson),
    pagination: {
      page,
      limit,
      total: result.totalDocs,
      totalPages: result.totalPages,
    },
  }
}

export async function listPublishedLessons() {
  const listed = await listLessons({ isPublished: true, limit: 200 })
  return listed.lessons
}

export async function getLessonById(lessonId: string) {
  const payload = await getPayloadClient()
  try {
    const doc = await payload.findByID({
      collection: 'lessons',
      id: lessonId,
      depth: 1,
      overrideAccess: true,
    })
    return mapLesson(doc)
  } catch {
    return null
  }
}

export async function createLesson(data: {
  title: string
  description?: string
  videoId: string
  categoryId: string
  tagIds?: string[]
  content?: string
  sortOrder?: number
  isPublished?: boolean
  createdById?: string
  createdByUsername?: string
}) {
  const payload = await getPayloadClient()
  try {
    await payload.findByID({
      collection: 'lesson-categories',
      id: data.categoryId,
      overrideAccess: true,
    })
  } catch {
    return { success: false as const, error: 'Selected category does not exist' }
  }

  const created = await payload.create({
    collection: 'lessons',
    data: {
      title: data.title.trim(),
      slug: slugify(data.title),
      description: data.description?.trim() || '',
      videoId: data.videoId.trim(),
      category: data.categoryId,
      tags: data.tagIds && data.tagIds.length > 0 ? data.tagIds : undefined,
      content: data.content?.trim() || '',
      sortOrder: data.sortOrder ?? 0,
      isPublished: data.isPublished ?? true,
      createdById: data.createdById || '',
      createdByUsername: data.createdByUsername || '',
      viewCount: 0,
    },
    overrideAccess: true,
  })
  return { success: true as const, lessonId: asId(created) }
}

export async function updateLesson(
  lessonId: string,
  data: {
    title?: string
    description?: string
    videoId?: string
    categoryId?: string
    tagIds?: string[]
    content?: string
    sortOrder?: number
    isPublished?: boolean
  },
) {
  const existing = await getLessonById(lessonId)
  if (!existing) return { success: false as const, error: 'Lesson not found' }
  const payload = await getPayloadClient()
  const updates: Record<string, unknown> = {}
  if (data.title !== undefined) {
    updates.title = data.title.trim()
    updates.slug = slugify(data.title)
  }
  if (data.description !== undefined) updates.description = data.description.trim()
  if (data.videoId !== undefined) updates.videoId = data.videoId.trim()
  if (data.categoryId !== undefined) updates.category = data.categoryId
  if (data.content !== undefined) updates.content = data.content.trim()
  if (data.sortOrder !== undefined) updates.sortOrder = data.sortOrder
  if (data.isPublished !== undefined) updates.isPublished = data.isPublished
  if (data.tagIds !== undefined) updates.tags = data.tagIds
  await payload.update({ collection: 'lessons', id: lessonId, data: updates, overrideAccess: true })
  return { success: true as const }
}

export async function deleteLesson(lessonId: string) {
  const existing = await getLessonById(lessonId)
  if (!existing) return { success: false as const, error: 'Lesson not found' }
  const payload = await getPayloadClient()
  await payload.delete({ collection: 'lessons', id: lessonId, overrideAccess: true })
  return { success: true as const }
}

export async function lessonStats() {
  const payload = await getPayloadClient()
  const [totalLessons, publishedLessons, totalCategories, activeCategories, lessons] = await Promise.all([
    payload.count({ collection: 'lessons', overrideAccess: true }),
    payload.count({ collection: 'lessons', where: { isPublished: { equals: true } }, overrideAccess: true }),
    payload.count({ collection: 'lesson-categories', overrideAccess: true }),
    payload.count({
      collection: 'lesson-categories',
      where: { isActive: { equals: true } },
      overrideAccess: true,
    }),
    payload.find({ collection: 'lessons', limit: 1000, depth: 0, overrideAccess: true }),
  ])
  const totalViews = lessons.docs.reduce((sum, doc) => sum + Number(doc.viewCount || 0), 0)
  return {
    totalLessons: totalLessons.totalDocs,
    publishedLessons: publishedLessons.totalDocs,
    draftLessons: totalLessons.totalDocs - publishedLessons.totalDocs,
    totalCategories: totalCategories.totalDocs,
    activeCategories: activeCategories.totalDocs,
    totalViews,
  }
}

export async function categoryCount() {
  const payload = await getPayloadClient()
  const result = await payload.count({ collection: 'lesson-categories', overrideAccess: true })
  return result.totalDocs
}
