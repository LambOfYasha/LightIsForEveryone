import { requireAdminOrTeacher } from "@/lib/auth/middleware";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  ArrowLeft,
  Terminal,
  Users,
  FileText,
  Flag,
  Heart,
  Copy,
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function SeedScriptsPage() {
  await requireAdminOrTeacher();

  const scripts = [
    {
      name: 'Create Test Communities',
      file: 'scripts/create-test-communities.js',
      command: 'node scripts/create-test-communities.js',
      description: 'Creates sample community questions with a moderator reference. Requires at least one user in the database to assign as moderator.',
      icon: <Users className="h-5 w-5 text-green-600" />,
      creates: ['Community question documents with title, description, moderator reference'],
    },
    {
      name: 'Create Test Posts & Favorites',
      file: 'scripts/create-test-posts-and-favorites.js',
      command: 'node scripts/create-test-posts-and-favorites.js',
      description: 'Creates sample posts within existing communities and generates favorite references. Requires existing communities in the database.',
      icon: <Heart className="h-5 w-5 text-pink-600" />,
      creates: ['Post documents linked to communities', 'Favorite reference documents'],
    },
    {
      name: 'Create Test Reports',
      file: 'scripts/create-test-reports.js',
      command: 'node scripts/create-test-reports.js',
      description: 'Creates sample report documents referencing existing users, posts, comments, and communities. Useful for testing the reports management page.',
      icon: <Flag className="h-5 w-5 text-red-600" />,
      creates: ['Report documents with various content types', 'References to existing users and content'],
    },
  ];

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/manage/testing">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Testing Center
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Terminal className="h-8 w-8 text-amber-600" />
          <div>
            <h1 className="text-3xl font-bold">Seed Data Scripts</h1>
            <p className="text-gray-600">Scripts for generating test data in the Sanity database</p>
          </div>
        </div>

        {/* Info */}
        <Card className="mb-6 border-blue-300 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> These scripts are meant to be run from the terminal in the project root directory.
              They require the environment variables (<code>SANITY_ADMIN_API_TOKEN</code>, <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code>, etc.) to be set.
            </p>
          </CardContent>
        </Card>

        {/* Script Cards */}
        <div className="space-y-4">
          {scripts.map((script) => (
            <Card key={script.file}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {script.icon}
                  <CardTitle className="text-lg">{script.name}</CardTitle>
                </div>
                <CardDescription>{script.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Command</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-gray-900 text-green-400 px-4 py-2 rounded text-sm font-mono">
                        {script.command}
                      </code>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Creates</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {script.creates.map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-1">
                    <p className="text-xs text-gray-400">
                      <strong>Source:</strong> <code>{script.file}</code>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Root-level test files */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Root-Level Test Files</h2>
          <Card>
            <CardContent className="p-6">
              <ul className="space-y-3 text-sm text-gray-600">
                <li>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">test-build.js</code>
                  </div>
                  <p className="ml-6 text-gray-500">Build verification test — validates the Next.js build process completes without errors.</p>
                </li>
                <li>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">test-compile.js</code>
                  </div>
                  <p className="ml-6 text-gray-500">Compilation test — verifies TypeScript compilation and module resolution.</p>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
