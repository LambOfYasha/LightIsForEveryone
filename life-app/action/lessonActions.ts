'use server';

import { auth } from '@clerk/nextjs/server';
import { getUser } from '@/lib/user/getUser';
import {
  categoryCount,
  createLesson as createLessonDoc,
  createLessonCategory as createCategoryDoc,
  deleteLesson as deleteLessonDoc,
  deleteLessonCategory as deleteCategoryDoc,
  getLessonById as getLessonDoc,
  lessonStats,
  listLessonCategories,
  listLessons,
  listPublishedLessons,
  updateLesson as updateLessonDoc,
  updateLessonCategory as updateCategoryDoc,
} from '@/payload/lib/lessons';
import { getTags } from '@/payload/lib/tags';

export interface LessonCategoryData {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lessonCount?: number;
}

export interface LessonData {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  videoId: string;
  category: { _id: string; title: string } | null;
  tags?: { _id: string; name: string }[];
  content?: string;
  sortOrder: number;
  isPublished: boolean;
  createdBy?: { _id: string; username: string };
  createdAt: string;
  updatedAt?: string;
  viewCount: number;
}

const ALLOWED_ROLES = ['admin', 'teacher', 'junior_teacher', 'senior_teacher', 'lead_teacher', 'dev'];

async function requireLessonManager() {
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Unauthorized' as const };
  }

  const currentUser = await getUser();
  if ('error' in currentUser) {
    return { error: currentUser.error };
  }

  if (!ALLOWED_ROLES.includes(currentUser.role)) {
    return { error: 'Insufficient permissions' as const };
  }

  return { user: currentUser };
}

export async function getLessonCategories() {
  try {
    const categories = await listLessonCategories(false);
    return { success: true, categories };
  } catch (error) {
    console.error('Error fetching lesson categories:', error);
    return { success: false, error: 'Failed to fetch lesson categories' };
  }
}

export async function getActiveLessonCategories() {
  try {
    const categories = await listLessonCategories(true);
    return { success: true, categories };
  } catch (error) {
    console.error('Error fetching active lesson categories:', error);
    return { success: false, error: 'Failed to fetch lesson categories' };
  }
}

export async function createLessonCategory(data: {
  title: string;
  description?: string;
  sortOrder?: number;
}) {
  try {
    const authResult = await requireLessonManager();
    if ('error' in authResult) {
      return { success: false, error: authResult.error };
    }
    if (!data.title || data.title.trim().length < 2) {
      return { success: false, error: 'Category title is required (min 2 characters)' };
    }
    const created = await createCategoryDoc({
      title: data.title,
      description: data.description,
      sortOrder: data.sortOrder,
      createdById: authResult.user._id,
    });
    if (!created.success) return created;
    return { success: true, message: 'Category created successfully', categoryId: created.categoryId };
  } catch (error) {
    console.error('Error creating lesson category:', error);
    return { success: false, error: 'Failed to create lesson category' };
  }
}

export async function updateLessonCategory(categoryId: string, data: {
  title?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  try {
    const authResult = await requireLessonManager();
    if ('error' in authResult) {
      return { success: false, error: authResult.error };
    }
    const updated = await updateCategoryDoc(categoryId, data);
    if (!updated.success) return updated;
    return { success: true, message: 'Category updated successfully' };
  } catch (error) {
    console.error('Error updating lesson category:', error);
    return { success: false, error: 'Failed to update lesson category' };
  }
}

export async function deleteLessonCategory(categoryId: string) {
  try {
    const authResult = await requireLessonManager();
    if ('error' in authResult) {
      return { success: false, error: authResult.error };
    }
    const deleted = await deleteCategoryDoc(categoryId);
    if (!deleted.success) return deleted;
    return { success: true, message: 'Category deleted successfully' };
  } catch (error) {
    console.error('Error deleting lesson category:', error);
    return { success: false, error: 'Failed to delete lesson category' };
  }
}

export async function getLessons(filters?: {
  categoryId?: string;
  search?: string;
  isPublished?: boolean;
  page?: number;
  limit?: number;
}) {
  try {
    const listed = await listLessons(filters);
    return { success: true, ...listed };
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return { success: false, error: 'Failed to fetch lessons' };
  }
}

export async function getPublishedLessons() {
  try {
    const lessons = await listPublishedLessons();
    return { success: true, lessons };
  } catch (error) {
    console.error('Error fetching published lessons:', error);
    return { success: false, error: 'Failed to fetch lessons' };
  }
}

export async function getLessonById(lessonId: string) {
  try {
    const lesson = await getLessonDoc(lessonId);
    if (!lesson) return { success: false, error: 'Lesson not found' };
    return { success: true, lesson };
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return { success: false, error: 'Failed to fetch lesson' };
  }
}

export async function createLesson(data: {
  title: string;
  description?: string;
  videoId: string;
  categoryId: string;
  tagIds?: string[];
  content?: string;
  sortOrder?: number;
  isPublished?: boolean;
}) {
  try {
    const authResult = await requireLessonManager();
    if ('error' in authResult) {
      return { success: false, error: authResult.error };
    }
    if (!data.title || data.title.trim().length < 3) {
      return { success: false, error: 'Lesson title is required (min 3 characters)' };
    }
    if (!data.videoId || data.videoId.trim().length === 0) {
      return { success: false, error: 'YouTube video ID is required' };
    }
    if (!data.categoryId) {
      return { success: false, error: 'Category is required' };
    }
    const created = await createLessonDoc({
      ...data,
      createdById: authResult.user._id,
      createdByUsername: authResult.user.username,
    });
    if (!created.success) return created;
    return { success: true, message: 'Lesson created successfully', lessonId: created.lessonId };
  } catch (error) {
    console.error('Error creating lesson:', error);
    return { success: false, error: 'Failed to create lesson' };
  }
}

export async function updateLesson(lessonId: string, data: {
  title?: string;
  description?: string;
  videoId?: string;
  categoryId?: string;
  tagIds?: string[];
  content?: string;
  sortOrder?: number;
  isPublished?: boolean;
}) {
  try {
    const authResult = await requireLessonManager();
    if ('error' in authResult) {
      return { success: false, error: authResult.error };
    }
    const updated = await updateLessonDoc(lessonId, data);
    if (!updated.success) return updated;
    return { success: true, message: 'Lesson updated successfully' };
  } catch (error) {
    console.error('Error updating lesson:', error);
    return { success: false, error: 'Failed to update lesson' };
  }
}

export async function deleteLesson(lessonId: string) {
  try {
    const authResult = await requireLessonManager();
    if ('error' in authResult) {
      return { success: false, error: authResult.error };
    }
    const deleted = await deleteLessonDoc(lessonId);
    if (!deleted.success) return deleted;
    return { success: true, message: 'Lesson deleted successfully' };
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return { success: false, error: 'Failed to delete lesson' };
  }
}

export async function getLessonStats() {
  try {
    const stats = await lessonStats();
    return { success: true, stats };
  } catch (error) {
    console.error('Error fetching lesson stats:', error);
    return { success: false, error: 'Failed to fetch lesson stats' };
  }
}

export async function getAvailableTags() {
  try {
    const tags = await getTags();
    return { success: true, tags };
  } catch (error) {
    console.error('Error fetching tags:', error);
    return { success: false, error: 'Failed to fetch tags' };
  }
}

export async function seedLessonsFromHardcoded() {
  try {
    const authResult = await requireLessonManager();
    if ('error' in authResult) {
      return { success: false, error: authResult.error };
    }
    if (!['admin', 'dev'].includes(authResult.user.role)) {
      return { success: false, error: 'Only admin/dev can seed data' };
    }
    const existingCount = await categoryCount();
    if (existingCount > 0) {
      return { success: false, error: 'Data already seeded. Delete existing categories first.' };
    }

    const hardcodedCategories = [
      {
        title: 'Fundamentals',
        sortOrder: 0,
        lessons: [
          { title: 'The Bible Saves Us', videoId: '2EpSJExshAw', description: 'Understanding how the Bible serves as our guide to salvation' },
          { title: 'Belief, Grace, Justification, Sanctification and Salvation', videoId: 'oCG6kb1wUoQ', description: 'Exploring the core doctrines of Christian faith and salvation' },
          { title: 'The Trinity is not a true doctrine', videoId: 'UfJ0DPcYGgc', description: 'Examining the biblical perspective on the Trinity doctrine' },
          { title: 'State of the dead', videoId: 'vtCVosyhmtc', description: 'Understanding what the Bible teaches about death and the afterlife' },
          { title: 'Hebrew Study', videoId: '1S6X6YoW0jE', description: 'Learning Hebrew to better understand biblical texts' },
          { title: 'The Name Study', videoId: 'XhRqU9ubme4', description: 'Exploring the significance of divine names in scripture' },
        ],
      },
      {
        title: 'Law',
        sortOrder: 1,
        lessons: [
          { title: 'You need the law to be saved', videoId: 'bcFr6K4v4Aw', description: "Understanding the role of God's law in salvation" },
          { title: 'The unforgiveable sin', videoId: 'E8Uc3400yJ4', description: 'Examining what the Bible says about the unpardonable sin' },
          { title: 'Shabbat', videoId: 'cAlZ8xCtYX4', description: 'The biblical significance and observance of the Sabbath' },
        ],
      },
      {
        title: 'Righteous Living',
        sortOrder: 2,
        lessons: [
          { title: 'How to stop sinning', videoId: 'yREFz0wN1jw', description: 'Practical guidance for overcoming sin in daily life' },
          { title: 'The Sanctuary', videoId: '-UlkpOfBs4k', description: 'Understanding the sanctuary service and its meaning' },
          { title: 'Obedience', videoId: 'KL2Hg8pX3h8', description: "The importance of obedience to God's will" },
        ],
      },
      {
        title: 'Prophecy',
        sortOrder: 3,
        lessons: [
          { title: 'Do you need prophecy to be saved?', videoId: 'KthU3KGiFMU', description: 'The role of prophecy in Christian faith and salvation' },
          { title: '144,000', videoId: 'bwy6SnPyMZk', description: 'Understanding the biblical reference to the 144,000' },
          { title: 'Mark of the Beast', videoId: 'hk4LCnqFvCQ', description: 'Exploring the biblical prophecy about the mark of the beast' },
        ],
      },
    ];

    let totalLessons = 0;
    for (const cat of hardcodedCategories) {
      const createdCat = await createCategoryDoc({
        title: cat.title,
        sortOrder: cat.sortOrder,
        createdById: authResult.user._id,
      });
      if (!createdCat.success) return createdCat;
      for (let i = 0; i < cat.lessons.length; i++) {
        const lesson = cat.lessons[i];
        const createdLesson = await createLessonDoc({
          title: lesson.title,
          description: lesson.description,
          videoId: lesson.videoId,
          categoryId: createdCat.categoryId,
          sortOrder: i,
          isPublished: true,
          createdById: authResult.user._id,
          createdByUsername: authResult.user.username,
        });
        if (!createdLesson.success) return createdLesson;
        totalLessons++;
      }
    }

    return {
      success: true,
      message: `Seeded ${hardcodedCategories.length} categories and ${totalLessons} lessons successfully`,
    };
  } catch (error) {
    console.error('Error seeding lessons:', error);
    return { success: false, error: 'Failed to seed lessons' };
  }
}
