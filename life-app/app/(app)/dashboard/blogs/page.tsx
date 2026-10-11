import { getCurrentUser } from "@/lib/auth/middleware";
import { getBlogs } from "@/sanity/lib/blogs/getBlogs";
import { getTags } from "@/sanity/lib/blogs/getTags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TagList } from "@/components/ui/tag";
import { 
  Search, 
  Filter, 
  BookOpen, 
  User, 
  Calendar, 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2 
} from "lucide-react";
import Link from "next/link";
import CreateBlogButton from "@/components/header/CreateBlogButton";
import { formatDistanceToNow } from 'date-fns';
import { formatViewCount } from '@/lib/utils';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default async function BlogsPage() {
  const user = await getCurrentUser();
  const blogs = await getBlogs();
  const tags = await getTags();

  // Separate featured and recent blogs
  const featuredBlogs = blogs.slice(0, 2);
  const recentBlogs = blogs.slice(2, 6);

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Blog</h1>
            <p className="text-muted-foreground">Discover insightful articles and teachings</p>
          </div>
         <div className="flex items-center gap-2">
          {(user && (user.role === "admin" || user.role === "teacher" || user.role === "junior_teacher" || user.role === "senior_teacher" || user.role === "lead_teacher")) && (
            <CreateBlogButton />
          )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-background p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search blog posts..." 
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>

        {/* Tags Filter */}
        {tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-foreground mb-2">Filter by tags:</h3>
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard/blogs">
                <Badge variant="default" className="cursor-pointer">
                  All
                </Badge>
              </Link>
              {tags.slice(0, 8).map((tag) => (
                <Link key={tag._id} href={`/tags/${tag.slug}`}>
                  <Badge 
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                  >
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Featured Blogs */}
        {featuredBlogs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Featured Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredBlogs.map((blog) => (
                <Card key={blog._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-xl mb-2">{blog.title}</CardTitle>
                    <p className="text-muted-foreground line-clamp-3">
                      {blog.description}
                    </p>
                    {blog.tags && blog.tags.length > 0 && (
                      <TagList tags={blog.tags} size="sm" />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {blog.author.username}
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {formatViewCount(blog.viewCount || 0)} views
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link href={`/blogs/${blog.slug}`}>
                        <Button size="sm" className="flex-1">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Read More
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent Blogs */}
        {recentBlogs.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Recent Articles</h2>
            <div className="space-y-4">
              {recentBlogs.map((blog) => (
                <Card key={blog._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CardTitle className="text-lg">{blog.title}</CardTitle>
                        </div>
                        <p className="text-muted-foreground line-clamp-2">
                          {blog.description}
                        </p>
                        {blog.tags && blog.tags.length > 0 && (
                          <TagList tags={blog.tags} size="sm" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {blog.author.username}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                        </span>
                        <span className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {formatViewCount(blog.viewCount || 0)} views
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link href={`/blogs/${blog.slug}`}>
                        <Button size="sm" className="flex-1">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Read Article
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {blogs.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No blog posts found</h3>
              <p className="text-muted-foreground mb-4">
                Check back later for new articles and teachings
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 