'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/components/auth/RoleGuard';
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  FolderOpen,
  PlayCircle,
  Video,
  Tag,
  Eye,
  EyeOff,
  Search,
  Loader2,
  ArrowLeft,
  Database,
  X,
  Check,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Download,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import {
  getLessonCategories,
  createLessonCategory,
  updateLessonCategory,
  deleteLessonCategory,
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonStats,
  getAvailableTags,
  seedLessonsFromHardcoded,
  type LessonCategoryData,
  type LessonData,
} from '@/action/lessonActions';

// ─── Types ───────────────────────────────────────────────────────────────────

type TabType = 'lessons' | 'categories' | 'new_videos';

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  teacherUsername?: string;
}

interface TagOption {
  _id: string;
  name: string;
  slug?: { current: string };
  color?: string;
}

interface LessonFormData {
  title: string;
  description: string;
  videoId: string;
  categoryId: string;
  tagIds: string[];
  content: string;
  sortOrder: number;
  isPublished: boolean;
}

interface CategoryFormData {
  title: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractVideoId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  // Full URL patterns
  const urlMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (urlMatch) return urlMatch[1];
  // Already a video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return trimmed;
}

const emptyLessonForm: LessonFormData = {
  title: '',
  description: '',
  videoId: '',
  categoryId: '',
  tagIds: [],
  content: '',
  sortOrder: 0,
  isPublished: true,
};

const emptyCategoryForm: CategoryFormData = {
  title: '',
  description: '',
  sortOrder: 0,
  isActive: true,
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminLessonsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('lessons');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Data
  const [categories, setCategories] = useState<LessonCategoryData[]>([]);
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [tags, setTags] = useState<TagOption[]>([]);
  const [stats, setStats] = useState<Record<string, number> | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Forms
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonData | null>(null);
  const [editingCategory, setEditingCategory] = useState<LessonCategoryData | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonFormData>(emptyLessonForm);
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>(emptyCategoryForm);

  // Confirmations
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'lesson' | 'category'; id: string; title: string } | null>(null);

  // New Videos (YouTube feed)
  const [newVideos, setNewVideos] = useState<YouTubeVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videosError, setVideosError] = useState<string | null>(null);
  const [videosFetched, setVideosFetched] = useState(false);

  // ─── Data fetching ───────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [catResult, lessonResult, tagResult, statsResult] = await Promise.all([
        getLessonCategories(),
        getLessons({
          categoryId: filterCategory || undefined,
          search: searchQuery || undefined,
          isPublished: filterStatus === 'published' ? true : filterStatus === 'draft' ? false : undefined,
        }),
        getAvailableTags(),
        getLessonStats(),
      ]);

      if (catResult.success && catResult.categories) setCategories(catResult.categories);
      if (lessonResult.success && lessonResult.lessons) setLessons(lessonResult.lessons);
      if (tagResult.success && tagResult.tags) setTags(tagResult.tags);
      if (statsResult.success && statsResult.stats) setStats(statsResult.stats);
    } catch (error) {
      console.error('Error fetching data:', error);
      showMessage('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [filterCategory, searchQuery, filterStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch YouTube feed when New Videos tab is active
  const fetchNewVideos = useCallback(async (force = false) => {
    if (videosFetched && !force) return;
    setVideosLoading(true);
    setVideosError(null);
    try {
      const res = await fetch('/api/youtube-feed?limit=24');
      if (!res.ok) throw new Error('Failed to fetch videos');
      const data = await res.json();
      setNewVideos(data.videos || []);
      setVideosFetched(true);
    } catch (err) {
      console.error('Error fetching new videos:', err);
      setVideosError('Unable to load new videos. Check that the YouTube API key is configured.');
    } finally {
      setVideosLoading(false);
    }
  }, [videosFetched]);

  useEffect(() => {
    if (activeTab === 'new_videos') {
      fetchNewVideos();
    }
  }, [activeTab, fetchNewVideos]);

  // Check if a YouTube video is already imported as a lesson
  function isVideoImported(videoId: string): boolean {
    return lessons.some(l => l.videoId === videoId);
  }

  // Quick-import: pre-fill the lesson form from a YouTube video
  function importVideoAsLesson(video: YouTubeVideo) {
    setLessonForm({
      title: video.title
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'"),
      description: video.description
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'"),
      videoId: video.videoId,
      categoryId: categories.length > 0 ? categories[0]._id : '',
      tagIds: [],
      content: '',
      sortOrder: 0,
      isPublished: true,
    });
    setEditingLesson(null);
    setShowLessonForm(true);
    setShowCategoryForm(false);
    setActiveTab('lessons');
    showMessage('success', `Pre-filled form with "${video.title.substring(0, 40)}...". Select a category and save.`);
  }

  // ─── Message helper ──────────────────────────────────────────────────────

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }

  // ─── Category handlers ──────────────────────────────────────────────────

  function openCreateCategory() {
    setEditingCategory(null);
    setCategoryForm(emptyCategoryForm);
    setShowCategoryForm(true);
    setShowLessonForm(false);
  }

  function openEditCategory(cat: LessonCategoryData) {
    setEditingCategory(cat);
    setCategoryForm({
      title: cat.title,
      description: cat.description || '',
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
    setShowCategoryForm(true);
    setShowLessonForm(false);
  }

  async function handleCategorySubmit() {
    setActionLoading(true);
    try {
      let result;
      if (editingCategory) {
        result = await updateLessonCategory(editingCategory._id, categoryForm);
      } else {
        result = await createLessonCategory(categoryForm);
      }

      if (result.success) {
        showMessage('success', result.message || 'Category saved');
        setShowCategoryForm(false);
        setEditingCategory(null);
        setCategoryForm(emptyCategoryForm);
        await fetchData();
      } else {
        showMessage('error', result.error || 'Failed to save category');
      }
    } catch (error) {
      showMessage('error', 'Failed to save category');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    setActionLoading(true);
    try {
      const result = await deleteLessonCategory(id);
      if (result.success) {
        showMessage('success', result.message || 'Category deleted');
        setDeleteConfirm(null);
        await fetchData();
      } else {
        showMessage('error', result.error || 'Failed to delete category');
      }
    } catch (error) {
      showMessage('error', 'Failed to delete category');
    } finally {
      setActionLoading(false);
    }
  }

  // ─── Lesson handlers ────────────────────────────────────────────────────

  function openCreateLesson() {
    setEditingLesson(null);
    setLessonForm(emptyLessonForm);
    setShowLessonForm(true);
    setShowCategoryForm(false);
  }

  function openEditLesson(lesson: LessonData) {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      description: lesson.description || '',
      videoId: lesson.videoId,
      categoryId: lesson.category?._id || '',
      tagIds: lesson.tags?.map(t => t._id) || [],
      content: lesson.content || '',
      sortOrder: lesson.sortOrder,
      isPublished: lesson.isPublished,
    });
    setShowLessonForm(true);
    setShowCategoryForm(false);
  }

  async function handleLessonSubmit() {
    setActionLoading(true);
    try {
      const submitData = {
        ...lessonForm,
        videoId: extractVideoId(lessonForm.videoId),
      };

      let result;
      if (editingLesson) {
        result = await updateLesson(editingLesson._id, submitData);
      } else {
        result = await createLesson(submitData);
      }

      if (result.success) {
        showMessage('success', result.message || 'Lesson saved');
        setShowLessonForm(false);
        setEditingLesson(null);
        setLessonForm(emptyLessonForm);
        await fetchData();
      } else {
        showMessage('error', result.error || 'Failed to save lesson');
      }
    } catch (error) {
      showMessage('error', 'Failed to save lesson');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteLesson(id: string) {
    setActionLoading(true);
    try {
      const result = await deleteLesson(id);
      if (result.success) {
        showMessage('success', result.message || 'Lesson deleted');
        setDeleteConfirm(null);
        await fetchData();
      } else {
        showMessage('error', result.error || 'Failed to delete lesson');
      }
    } catch (error) {
      showMessage('error', 'Failed to delete lesson');
    } finally {
      setActionLoading(false);
    }
  }

  async function toggleLessonPublish(lesson: LessonData) {
    setActionLoading(true);
    try {
      const result = await updateLesson(lesson._id, { isPublished: !lesson.isPublished });
      if (result.success) {
        showMessage('success', `Lesson ${!lesson.isPublished ? 'published' : 'unpublished'}`);
        await fetchData();
      } else {
        showMessage('error', result.error || 'Failed to update lesson');
      }
    } catch (error) {
      showMessage('error', 'Failed to update lesson');
    } finally {
      setActionLoading(false);
    }
  }

  async function toggleCategoryActive(cat: LessonCategoryData) {
    setActionLoading(true);
    try {
      const result = await updateLessonCategory(cat._id, { isActive: !cat.isActive });
      if (result.success) {
        showMessage('success', `Category ${!cat.isActive ? 'activated' : 'hidden'}`);
        await fetchData();
      } else {
        showMessage('error', result.error || 'Failed to update category');
      }
    } catch (error) {
      showMessage('error', 'Failed to update category');
    } finally {
      setActionLoading(false);
    }
  }

  // ─── Seed handler ────────────────────────────────────────────────────────

  async function handleSeedData() {
    if (!confirm('This will import the hardcoded lesson data into Sanity. Only works if no categories exist yet. Continue?')) {
      return;
    }
    setActionLoading(true);
    try {
      const result = await seedLessonsFromHardcoded();
      if (result.success) {
        showMessage('success', result.message || 'Data seeded successfully');
        await fetchData();
      } else {
        showMessage('error', result.error || 'Failed to seed data');
      }
    } catch (error) {
      showMessage('error', 'Failed to seed data');
    } finally {
      setActionLoading(false);
    }
  }

  // ─── Tag toggle helper ──────────────────────────────────────────────────

  function toggleTag(tagId: string) {
    setLessonForm(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-muted-foreground">Loading lesson management...</p>
      </div>
    );
  }

  return (
    <RoleGuard permission="canAccessAdminPanel" fallback={
      <div className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You don&apos;t have permission to manage lessons.</p>
      </div>
    }>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link href="/manage">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <BookOpen className="h-7 w-7 text-blue-600" />
                Lesson Management
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage video lessons, categories, and content
              </p>
            </div>
          </div>
        </div>

        {/* Toast Message */}
        {message && (
          <div className={`mb-4 px-4 py-3 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800'
              : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800'
          }`}>
            {message.type === 'success' ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <span className="text-sm">{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-auto">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.totalLessons || 0}</p>
                <p className="text-xs text-muted-foreground">Total Lessons</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.publishedLessons || 0}</p>
                <p className="text-xs text-muted-foreground">Published</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.draftLessons || 0}</p>
                <p className="text-xs text-muted-foreground">Drafts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.totalCategories || 0}</p>
                <p className="text-xs text-muted-foreground">Categories</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-teal-600">{stats.activeCategories || 0}</p>
                <p className="text-xs text-muted-foreground">Active Categories</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-indigo-600">{stats.totalViews || 0}</p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab Navigation + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={activeTab === 'lessons' ? 'default' : 'outline'}
              onClick={() => setActiveTab('lessons')}
              className="gap-2"
            >
              <PlayCircle className="h-4 w-4" />
              Lessons ({lessons.length})
            </Button>
            <Button
              variant={activeTab === 'categories' ? 'default' : 'outline'}
              onClick={() => setActiveTab('categories')}
              className="gap-2"
            >
              <FolderOpen className="h-4 w-4" />
              Categories ({categories.length})
            </Button>
            <Button
              variant={activeTab === 'new_videos' ? 'default' : 'outline'}
              onClick={() => setActiveTab('new_videos')}
              className={`gap-2 ${activeTab === 'new_videos' ? 'bg-red-600 hover:bg-red-700' : ''}`}
            >
              <Video className="h-4 w-4" />
              New Videos
            </Button>
          </div>
          <div className="flex gap-2">
            {categories.length === 0 && (
              <Button variant="outline" onClick={handleSeedData} disabled={actionLoading} className="gap-2">
                <Database className="h-4 w-4" />
                Seed Data
              </Button>
            )}
            {activeTab === 'lessons' && (
              <Button onClick={openCreateLesson} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                New Lesson
              </Button>
            )}
            {activeTab === 'categories' && (
              <Button onClick={openCreateCategory} className="gap-2 bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4" />
                New Category
              </Button>
            )}
            {activeTab === 'new_videos' && (
              <Button
                variant="outline"
                onClick={() => fetchNewVideos(true)}
                disabled={videosLoading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${videosLoading ? 'animate-spin' : ''}`} />
                Refresh Feed
              </Button>
            )}
          </div>
        </div>

        {/* ─── Category Form Modal ────────────────────────────────────────── */}
        {showCategoryForm && (
          <Card className="mb-6 border-2 border-purple-300 dark:border-purple-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-purple-600" />
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    value={categoryForm.title}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g. Live Stream, Fundamentals"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={categoryForm.sortOrder}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Brief description of this category..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="catActive"
                  checked={categoryForm.isActive}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="catActive" className="text-sm">Active (visible on lessons page)</label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setShowCategoryForm(false); setEditingCategory(null); }}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCategorySubmit}
                  disabled={actionLoading || !categoryForm.title.trim()}
                  className="bg-purple-600 hover:bg-purple-700 gap-2"
                >
                  {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Lesson Form Modal ──────────────────────────────────────────── */}
        {showLessonForm && (
          <Card className="mb-6 border-2 border-blue-300 dark:border-blue-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-blue-600" />
                {editingLesson ? 'Edit Lesson' : 'Create Lesson'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Lesson title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">YouTube Video ID or URL *</label>
                  <input
                    type="text"
                    value={lessonForm.videoId}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, videoId: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. dQw4w9WgXcQ or full YouTube URL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select
                    value={lessonForm.categoryId}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category...</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={lessonForm.sortOrder}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of this lesson..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Additional Content (HTML supported)</label>
                <textarea
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Additional notes or content for this lesson..."
                />
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Tag className="inline h-4 w-4 mr-1" />
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <button
                        key={tag._id}
                        type="button"
                        onClick={() => toggleTag(tag._id)}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                          lessonForm.tagIds.includes(tag._id)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-background text-foreground border-border hover:border-blue-400'
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Preview */}
              {lessonForm.videoId && extractVideoId(lessonForm.videoId) && (
                <div>
                  <label className="block text-sm font-medium mb-1">Preview</label>
                  <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <iframe
                      src={`https://www.youtube.com/embed/${extractVideoId(lessonForm.videoId)}`}
                      title="Video preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="lessonPublished"
                  checked={lessonForm.isPublished}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, isPublished: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="lessonPublished" className="text-sm">Published (visible on lessons page)</label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setShowLessonForm(false); setEditingLesson(null); }}>
                  Cancel
                </Button>
                <Button
                  onClick={handleLessonSubmit}
                  disabled={actionLoading || !lessonForm.title.trim() || !lessonForm.videoId.trim() || !lessonForm.categoryId}
                  className="bg-blue-600 hover:bg-blue-700 gap-2"
                >
                  {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingLesson ? 'Update Lesson' : 'Create Lesson'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Delete Confirmation ────────────────────────────────────────── */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                  <div>
                    <h3 className="font-bold text-lg">Delete {deleteConfirm.type}?</h3>
                    <p className="text-sm text-muted-foreground">
                      Are you sure you want to delete &quot;{deleteConfirm.title}&quot;? This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={actionLoading}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (deleteConfirm.type === 'lesson') handleDeleteLesson(deleteConfirm.id);
                      else handleDeleteCategory(deleteConfirm.id);
                    }}
                    disabled={actionLoading}
                    className="gap-2"
                  >
                    {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── Lessons Tab ────────────────────────────────────────────────── */}
        {activeTab === 'lessons' && (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search lessons..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.title}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </select>
            </div>

            {/* Lesson List */}
            {lessons.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No lessons found</h3>
                  <p className="text-muted-foreground mb-4">
                    {categories.length === 0
                      ? 'Create a category first, then add lessons.'
                      : 'Create your first lesson to get started.'}
                  </p>
                  {categories.length > 0 && (
                    <Button onClick={openCreateLesson} className="gap-2 bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4" />
                      Create Lesson
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {lessons.map(lesson => (
                  <Card key={lesson._id} className={`transition-all hover:shadow-md ${!lesson.isPublished ? 'opacity-70 border-dashed' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0 w-full sm:w-40 aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <img
                            src={`https://img.youtube.com/vi/${lesson.videoId}/mqdefault.jpg`}
                            alt={lesson.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            <h3 className="font-semibold text-base truncate">{lesson.title}</h3>
                            {lesson.isPublished ? (
                              <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Published</span>
                            ) : (
                              <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">Draft</span>
                            )}
                          </div>
                          {lesson.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{lesson.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {lesson.category && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                {lesson.category.title}
                              </span>
                            )}
                            {lesson.tags?.map(tag => (
                              <span key={tag._id} className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                {tag.name}
                              </span>
                            ))}
                            <span className="text-xs text-muted-foreground">
                              Order: {lesson.sortOrder} | Views: {lesson.viewCount || 0}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex sm:flex-col gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleLessonPublish(lesson)}
                            disabled={actionLoading}
                            title={lesson.isPublished ? 'Unpublish' : 'Publish'}
                          >
                            {lesson.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditLesson(lesson)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirm({ type: 'lesson', id: lesson._id, title: lesson.title })}
                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* ─── New Videos Tab ──────────────────────────────────────────── */}
        {activeTab === 'new_videos' && (
          <>
            {videosLoading && (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-10 w-10 text-red-600 animate-spin mb-4" />
                <p className="text-muted-foreground">Loading latest videos from teacher channels...</p>
              </div>
            )}

            {videosError && !videosLoading && (
              <Card>
                <CardContent className="p-12 text-center">
                  <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Could not load videos</h3>
                  <p className="text-muted-foreground mb-4">{videosError}</p>
                  <Button variant="outline" onClick={() => fetchNewVideos(true)} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {!videosLoading && !videosError && newVideos.length === 0 && videosFetched && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No new videos available</h3>
                  <p className="text-muted-foreground">
                    Videos will appear here once teachers have YouTube channels configured.
                  </p>
                </CardContent>
              </Card>
            )}

            {!videosLoading && !videosError && newVideos.length > 0 && (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Showing {newVideos.length} recent videos from teacher channels. Click &quot;Import as Lesson&quot; to quickly add a video to your lesson library.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {newVideos.map((video) => {
                    const imported = isVideoImported(video.videoId);
                    return (
                      <Card key={video.videoId} className={`transition-all hover:shadow-md ${imported ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20' : ''}`}>
                        <CardContent className="p-0">
                          {/* Thumbnail */}
                          <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800">
                            <img
                              src={video.thumbnail || `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                            {imported && (
                              <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Imported
                              </div>
                            )}
                          </div>

                          <div className="p-4">
                            {/* Title */}
                            <h3 className="font-semibold text-sm line-clamp-2 mb-1" title={video.title}>
                              {video.title}
                            </h3>

                            {/* Channel + Date */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <span className="truncate">{video.channelTitle}{video.teacherUsername && ` (${video.teacherUsername})`}</span>
                              <span className="flex-shrink-0">
                                {new Date(video.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>

                            {/* Description */}
                            {video.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{video.description}</p>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2">
                              {imported ? (
                                <Button variant="outline" size="sm" disabled className="gap-1 flex-1 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Already Imported
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => importVideoAsLesson(video)}
                                  className="gap-1 flex-1 bg-blue-600 hover:bg-blue-700"
                                  disabled={categories.length === 0}
                                  title={categories.length === 0 ? 'Create a category first' : 'Import as a new lesson'}
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  Import as Lesson
                                </Button>
                              )}
                              <a
                                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="outline" size="sm" className="gap-1">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              </a>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* ─── Categories Tab ─────────────────────────────────────────────── */}
        {activeTab === 'categories' && (
          <>
            {categories.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No categories yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first category or seed from existing lesson data.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={openCreateCategory} className="gap-2 bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4" />
                      Create Category
                    </Button>
                    <Button variant="outline" onClick={handleSeedData} disabled={actionLoading} className="gap-2">
                      <Database className="h-4 w-4" />
                      Seed from Existing Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {categories.map(cat => (
                  <Card key={cat._id} className={`transition-all hover:shadow-md ${!cat.isActive ? 'opacity-70 border-dashed' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                            <FolderOpen className="h-6 w-6 text-purple-600" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-base">{cat.title}</h3>
                            {cat.isActive ? (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Active</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300">Hidden</span>
                            )}
                          </div>
                          {cat.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{cat.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>Order: {cat.sortOrder}</span>
                            <span>{cat.lessonCount || 0} lesson{(cat.lessonCount || 0) !== 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleCategoryActive(cat)}
                            disabled={actionLoading}
                            title={cat.isActive ? 'Hide' : 'Activate'}
                          >
                            {cat.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditCategory(cat)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirm({ type: 'category', id: cat._id, title: cat.title })}
                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            title="Delete"
                            disabled={(cat.lessonCount || 0) > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </RoleGuard>
  );
}
