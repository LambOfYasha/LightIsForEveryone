import { requireAdminOrTeacher } from "@/lib/auth/middleware";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Users, 
  GraduationCap, 
  Shield, 
  MessageSquare, 
  BarChart3, 
  Settings,
  ArrowRight,
  BookOpen,
  FileText,
  Flag,
  Tag,
  FlaskConical,
  Video,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await requireAdminOrTeacher();

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management - Only for Lead Teachers and Admins */}
          <RoleGuard permission="canManageUsers">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <CardTitle>User Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Manage user accounts and permissions
                </p>
                <Button asChild className="w-full">
                  <Link href="/manage/users">
                    Manage Users
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </RoleGuard>

          {/* Teacher Management - Only for Senior Teachers and up */}
          <RoleGuard permission="canManageTeachers">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-green-600" />
                  <CardTitle>Teacher Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Manage teacher accounts and specializations
                </p>
                <Button asChild className="w-full">
                  <Link href="/manage/teachers">
                    Manage Teachers
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </RoleGuard>

          {/* Content Moderation - For Senior Teachers and up */}
          <RoleGuard permission="canModerate">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-orange-600" />
                  <CardTitle>Content Moderation</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Review and moderate community content
                </p>
                <Button asChild className="w-full">
                  <Link href="/manage/moderation">
                    Moderate Content
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </RoleGuard>

          {/* Reports Management - For all teachers and up */}
          <RoleGuard permission="canAccessAdminPanel">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Flag className="h-5 w-5 text-red-600" />
                  <CardTitle>Reports Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Review and manage user reports
                </p>
                <Button asChild className="w-full">
                  <Link href="/manage/reports">
                    Manage Reports
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </RoleGuard>

          {/* Blog Management - For teachers and up */}
          <RoleGuard permission="canManageBlogs">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <CardTitle>Blog Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Manage blog posts and content
                </p>
                <Button asChild className="w-full">
                  <Link href="/manage/blogs">
                    Manage Blogs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </RoleGuard>

          {/* Lesson Management - For all teachers and up */}
          <RoleGuard permission="canAccessAdminPanel">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Video className="h-5 w-5 text-rose-600" />
                  <CardTitle>Lesson Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Manage video lessons, categories, and content
                </p>
                <Button asChild className="w-full">
                  <Link href="/manage/lessons">
                    Manage Lessons
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </RoleGuard>

          {/* Tag Management - For all teachers and up */}
          <RoleGuard permission="canAccessAdminPanel">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Tag className="h-5 w-5 text-teal-600" />
                  <CardTitle>Tag Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Manage content tags and categories
                </p>
                <Button asChild className="w-full">
                  <Link href="/manage/tags">
                    Manage Tags
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </RoleGuard>

          <RoleGuard requiredRole="dev">
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-violet-500">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-violet-600" />
                  <CardTitle>Page Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Create and manage Sanity-backed pages for public routes
                </p>
                <Button asChild className="w-full">
                  <Link href="/manage/pages">
                    Manage Pages
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </RoleGuard>

          {/* Communities Management - For all teachers and up */}
          <RoleGuard permission="canAccessAdminPanel">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-cyan-600" />
                  <CardTitle>Communities</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Manage community questions and discussions
                </p>
                <Button asChild className="w-full">
                  <Link href="/manage/communities">
                    Manage Communities
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </RoleGuard>

          {/* Analytics - For all teachers and up */}
          <RoleGuard permission="canAccessAdminPanel">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  <CardTitle>Analytics</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  View platform analytics and insights
                </p>
                <Button asChild className="w-full">
                  <Link href="/manage/analytics">
                    View Analytics
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </RoleGuard>

          {/* System Settings - Only for Lead Teachers and Admins */}
          <RoleGuard permission="canAccessAdminPanel">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>System Settings</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Configure system-wide settings
                </p>
                <Button asChild className="w-full">
                  <Link href="/manage/settings">
                    System Settings
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </RoleGuard>

          {/* Testing Center - For all teachers and up */}
          <RoleGuard permission="canAccessAdminPanel">
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-amber-500">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FlaskConical className="h-5 w-5 text-amber-600" />
                  <CardTitle>Testing Center</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Development test pages, API tests, and utilities
                </p>
                <Button asChild className="w-full">
                  <Link href="/manage/testing">
                    Open Testing Center
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </RoleGuard>

        </div>

        {/* User Info */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Current User</h3>
          <p className="text-muted-foreground">
            <strong>Username:</strong> {user.username} | 
            <strong>Role:</strong> {user.role} | 
            <strong>Email:</strong> {user.email}
          </p>

        </div>
      </div>
    </div>
  );
}