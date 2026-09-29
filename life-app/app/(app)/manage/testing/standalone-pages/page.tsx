import { requireAdminOrTeacher } from "@/lib/auth/middleware";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  ExternalLink,
  Users,
  Type,
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function StandalonePagesPage() {
  await requireAdminOrTeacher();

  const pages = [
    {
      name: 'Guest Access Test',
      route: '/test-guest',
      source: 'app/(app)/test-guest/page.tsx',
      description: 'A standalone page for testing guest user functionality. Provides links to view blog posts, browse community questions, and search content — all without requiring authentication. Also documents how guest access works including viewing, commenting, creating responses, and the associated limitations.',
      icon: <Users className="h-6 w-6 text-blue-600" />,
      features: [
        'View blog posts as guest',
        'Browse community discussions',
        'Search content without auth',
        'Guest commenting with name prompt',
      ],
    },
    {
      name: 'Rich Editor / Spoiler Test',
      route: '/test-spoiler',
      source: 'app/(app)/test-spoiler/page.tsx',
      description: 'A standalone page for testing the rich text editor (TipTap-based) and the content renderer component. Includes a live editor, preview toggle, raw HTML output, and processed/sanitized HTML debug view. Useful for testing formatting features, spoiler tags, and HTML sanitization.',
      icon: <Type className="h-6 w-6 text-purple-600" />,
      features: [
        'Live rich text editor',
        'Content preview with renderer',
        'Raw HTML debug output',
        'Sanitized HTML debug output',
      ],
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
          <FileText className="h-8 w-8 text-cyan-600" />
          <div>
            <h1 className="text-3xl font-bold">Standalone Test Pages</h1>
            <p className="text-gray-600">Full-page test routes created during development</p>
          </div>
        </div>

        {/* Page Cards */}
        <div className="space-y-6">
          {pages.map((page) => (
            <Card key={page.route} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {page.icon}
                    <div>
                      <CardTitle className="text-xl">{page.name}</CardTitle>
                      <CardDescription className="font-mono text-sm">{page.route}</CardDescription>
                    </div>
                  </div>
                  <Button asChild>
                    <Link href={page.route}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Page
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{page.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  {page.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">
                    <strong>Source:</strong> <code>{page.source}</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
