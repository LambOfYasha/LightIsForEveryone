import { notFound } from "next/navigation";
import { Blog, Teacher } from "@/sanity.types";
import { getBlogBySlug } from "@/payload/lib/blogs/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  User, 
  MessageSquare, 
  BookOpen, 
  ArrowLeft,
  Share,
  Bookmark,
  Clock,
  Eye,
  Edit
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth/middleware";
import EditBlogButton from "@/components/blog/EditBlogButton";
import DeleteBlogButton from "@/components/blog/DeleteBlogButton";
import EmbeddedCommentSectionWrapper from "@/components/comments/EmbeddedCommentSectionWrapper";
import FavoriteButton from "@/components/ui/favorite-button";
import { editBlog } from "@/action/editBlog";
import { getImageUrl, calculateReadTime } from "@/lib/utils";
import { ReportButton } from "@/components/ui/report-button";
import { ProfileLink } from "@/components/ui/profile-link";
import RichContentRenderer from "@/components/ui/rich-content-renderer";
import { TagList } from "@/components/ui/tag";
import ViewCounter from "@/components/ui/view-counter";
import { canEditContent, canDeleteContent } from "@/lib/auth/roles";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

interface BlogWithAuthor extends Omit<Blog, 'author' | 'image'> {
  author?: Teacher & { role?: string };
  viewCount?: number;
  imageUrl?: string | null;
  image?: {
    url?: string;
    alt?: string;
    asset?: { url?: string; _ref?: string };
  };
  tags?: Array<{
    _id: string;
    name: string;
    slug: string;
    color: string;
  }>;
}

export default async function BlogPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const blog = await getBlogBySlug(slug) as BlogWithAuthor | null;

  if (!blog) {
    notFound();
  }

  // Get current user
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    // Handle unauthenticated users gracefully
    console.log('User not authenticated, showing as guest');
  }

  // Check permissions
  const isOwnContent = user ? blog.author?._id === user._id : false;
  const canEdit = user ? canEditContent(user.role, isOwnContent) : false;
  const canDelete = user ? canDeleteContent(user.role, isOwnContent) : false;

  console.log("Blog page - Blog ID:", blog._id);
  console.log("Blog page - Blog author ID:", blog.author?._id);
  console.log("Blog page - User ID:", user?._id);
  console.log("Blog page - User role:", user?.role);

  // Create a properly typed blog object for the EditBlogButton
  const blogForEdit = {
    _id: blog._id,
    title: blog.title || '',
    description: blog.description || '',
    slug: {
      _type: 'slug',
      current: typeof blog.slug === 'string' ? blog.slug : blog.slug?.current || ''
    },
    content: blog.content || '',
    image: blog.image,
    tags: blog.tags || []
  };

  const handleEditBlog = async (data: {
    title: string;
    description: string;
    slug: string;
    content: string;
    imageBase64?: string;
    imageFilename?: string;
    imageContentType?: string;
    tags?: string[];
  }): Promise<void> => {
    'use server';
    
    const imageData = data.imageBase64 ? {
      base64: data.imageBase64,
      fileName: data.imageFilename!,
      contentType: data.imageContentType!,
    } : null;

    const result = await editBlog(
      blog._id,
      data.title,
      data.description,
      data.slug,
      data.content,
      imageData,
      data.tags
    );

    if ("error" in result) {
      throw new Error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <Link href="/dashboard/blogs">
            <Button variant="ghost" className="flex items-center gap-2 text-sm">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Back to Blogs</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="bg-background rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {blog.title}
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-3 sm:mb-4">
                {blog.description}
              </p>
              
              {/* Meta Information */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>
                    {(() => {
                      const blogWithDates = blog as any;
                      const date = blogWithDates.publishedAt || blogWithDates._createdAt;
                      if (!date) return 'Date not available';
                      try {
                        return new Date(date).toLocaleDateString();
                      } catch (error) {
                        return 'Date not available';
                      }
                    })()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{calculateReadTime(blog.content).formatted}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ViewCounter 
                    blogId={blog._id} 
                    initialViewCount={blog.viewCount || 0}
                  />
                </div>
                {blog.author && (
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>By {blog.author.username}</span>
                  </div>
                )}
              </div>

              {/* Tags/Categories */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="mb-3 sm:mb-4">
                  <TagList tags={blog.tags} />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {canEdit && (
                <EditBlogButton 
                  blog={blogForEdit}
                  onEdit={handleEditBlog}
                />
              )}
              {canDelete && (
                <DeleteBlogButton 
                  blogId={blog._id}
                  blogTitle={blog.title || 'Untitled Blog'}
                />
              )}
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                <Share className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Share</span>
                <span className="sm:hidden">Share</span>
              </Button>
              {user && (
                <FavoriteButton 
                  postId={blog._id}
                  postType="blog"
                  size="sm"
                  variant="outline"
                />
              )}
              <ReportButton 
                contentId={blog._id}
                contentType="blog"
                contentTitle={blog.title}
                size="sm"
                variant="outline"
              />
            </div>
          </div>

          {/* Blog Image */}
          {blog.image && (
            <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden mb-4 sm:mb-6">
              <Image
                src={blog.imageUrl || blog.image?.url || blog.image?.asset?.url || ""}
                alt={blog.title || "Blog image"}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-background rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="prose max-w-none">
            {blog.content ? (
              <RichContentRenderer 
                content={blog.content}
                className="text-sm sm:text-base leading-relaxed"
                stripThemeConflictingInlineStyles
              />
            ) : (
              <p className="text-sm sm:text-base text-muted-foreground">
                This blog post is currently being written. Check back soon for the full content!
              </p>
            )}
          </div>
        </div>

        {/* Author Section */}
        {blog.author && (
          <div className="bg-background rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              {blog.author.imageURL && (
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden mx-auto sm:mx-0">
                  {getImageUrl(blog.author.imageURL) ? (
                    <Image
                      src={getImageUrl(blog.author.imageURL)!}
                      alt={blog.author.username || "Author"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
              )}
              <div className="text-center sm:text-left">
                <ProfileLink 
                  userId={blog.author._id}
                  username={blog.author.username} 
                  className="font-semibold text-base sm:text-lg"
                >
                  {blog.author.username}
                </ProfileLink>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {blog.author.role === "teacher" || blog.author.role === "junior_teacher" || blog.author.role === "senior_teacher" || blog.author.role === "lead_teacher" ? "Teacher" : "Author"}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Published on {(() => {
                    const blogWithDates = blog as any;
                    const date = blogWithDates.publishedAt || blogWithDates._createdAt;
                    if (!date) return 'Date not available';
                    try {
                      return new Date(date).toLocaleDateString();
                    } catch (error) {
                      return 'Date not available';
                    }
                  })()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-background rounded-lg shadow-sm p-4 sm:p-6">
          <EmbeddedCommentSectionWrapper
            postId={blog._id}
            postType="blog"
          />
        </div>
      </div>
    </div>
  );
} 