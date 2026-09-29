import { requireAdminOrTeacher } from "@/lib/auth/middleware";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FlaskConical,
  ShieldCheck,
  Database,
  Palette,
  ArrowRight,
  Terminal,
  Users,
  Bell,
  FileText,
  Trash2,
  Server,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

export default async function TestingDashboardPage() {
  const user = await requireAdminOrTeacher();

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/manage">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Admin
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <FlaskConical className="h-8 w-8 text-amber-600" />
          <h1 className="text-3xl font-bold">Testing Center</h1>
        </div>
        <p className="text-gray-600 mb-8">
          A centralized hub for all development test pages, API endpoints, UI components, and data utilities created during development.
        </p>

        {/* Test Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Authentication & Roles Tests */}
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <CardTitle>Auth & Role Tests</CardTitle>
              </div>
              <CardDescription>
                Test authentication flows, user roles, and permission checks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 mb-4 space-y-1">
                <li>• Admin auth verification</li>
                <li>• User authentication test</li>
                <li>• User role & permission checks</li>
                <li>• Server action auth test</li>
              </ul>
              <Button asChild className="w-full">
                <Link href="/manage/testing/auth-tests">
                  Run Auth Tests
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* API & Database Tests */}
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-green-600" />
                <CardTitle>API & Database Tests</CardTitle>
              </div>
              <CardDescription>
                Test Sanity connection, API routes, and database queries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 mb-4 space-y-1">
                <li>• Sanity connection test</li>
                <li>• Admin client test</li>
                <li>• Response query test</li>
                <li>• Report creation test</li>
              </ul>
              <Button asChild className="w-full">
                <Link href="/manage/testing/api-tests">
                  Run API Tests
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* CRUD / Delete Tests */}
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                <CardTitle>CRUD Operation Tests</CardTitle>
              </div>
              <CardDescription>
                Test create, delete, and mutation operations on content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 mb-4 space-y-1">
                <li>• Community delete test</li>
                <li>• Response delete test</li>
                <li>• Simple delete test</li>
                <li>• Delete response test</li>
              </ul>
              <Button asChild className="w-full">
                <Link href="/manage/testing/data-tests">
                  Run CRUD Tests
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* UI Component Tests */}
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Palette className="h-5 w-5 text-purple-600" />
                <CardTitle>UI Component Tests</CardTitle>
              </div>
              <CardDescription>
                Test rich editor, notifications, and other UI components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 mb-4 space-y-1">
                <li>• Rich text editor test</li>
                <li>• Notification buttons</li>
                <li>• Spoiler / content renderer</li>
                <li>• Guest access page</li>
              </ul>
              <Button asChild className="w-full">
                <Link href="/manage/testing/ui-tests">
                  View UI Tests
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Seed Data Scripts */}
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-amber-500">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Terminal className="h-5 w-5 text-amber-600" />
                <CardTitle>Seed Data Scripts</CardTitle>
              </div>
              <CardDescription>
                Scripts for generating test data in the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 mb-4 space-y-1">
                <li>• Create test communities</li>
                <li>• Create test posts & favorites</li>
                <li>• Create test reports</li>
              </ul>
              <Button asChild className="w-full">
                <Link href="/manage/testing/seed-scripts">
                  View Scripts
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Original Test Pages */}
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-cyan-500">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-cyan-600" />
                <CardTitle>Original Test Pages</CardTitle>
              </div>
              <CardDescription>
                Links to standalone test pages from development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 mb-4 space-y-1">
                <li>• Guest access test page</li>
                <li>• Spoiler / rich editor test page</li>
              </ul>
              <Button asChild className="w-full">
                <Link href="/manage/testing/standalone-pages">
                  View Pages
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Quick Reference: All Test Endpoints */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Server className="h-5 w-5 text-gray-500" />
            Quick Reference: All Test API Endpoints
          </h2>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Authentication</h3>
                  <ul className="space-y-1 text-gray-600 font-mono">
                    <li>GET /api/manage/test-auth</li>
                    <li>GET /api/test-user-auth</li>
                    <li>GET /api/test-user-role</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Database / Sanity</h3>
                  <ul className="space-y-1 text-gray-600 font-mono">
                    <li>GET /api/test-sanity</li>
                    <li>GET /api/test-admin</li>
                    <li>GET /api/test-response-query</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">CRUD Operations</h3>
                  <ul className="space-y-1 text-gray-600 font-mono">
                    <li>GET /api/test-delete</li>
                    <li>GET /api/test-simple-delete</li>
                    <li>GET /api/test-delete-response</li>
                    <li>GET /api/test-community-delete</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Reports</h3>
                  <ul className="space-y-1 text-gray-600 font-mono">
                    <li>GET /api/test-report-creation</li>
                    <li>POST /api/test-report-creation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current User */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Current User</h3>
          <p className="text-gray-600">
            <strong>Username:</strong> {user.username} |{" "}
            <strong>Role:</strong> {user.role} |{" "}
            <strong>Email:</strong> {user.email}
          </p>
        </div>
      </div>
    </div>
  );
}
