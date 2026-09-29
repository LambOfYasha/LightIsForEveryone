'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageSquareX,
  FileX,
  FolderX,
} from "lucide-react";

interface TestResult {
  status: 'idle' | 'running' | 'success' | 'error';
  data?: Record<string, unknown>;
  error?: string;
  duration?: number;
}

export default function DataTestsPage() {
  const [results, setResults] = useState<Record<string, TestResult>>({
    delete: { status: 'idle' },
    simpleDelete: { status: 'idle' },
    deleteResponse: { status: 'idle' },
    communityDelete: { status: 'idle' },
    reportCreation: { status: 'idle' },
  });

  const runTest = async (key: string, endpoint: string, method: string = 'GET') => {
    setResults(prev => ({
      ...prev,
      [key]: { status: 'running' },
    }));

    const start = performance.now();

    try {
      const response = await fetch(endpoint, { method });
      const data = await response.json();
      const duration = Math.round(performance.now() - start);

      if (response.ok && (data.success || !data.error)) {
        setResults(prev => ({
          ...prev,
          [key]: { status: 'success', data, duration },
        }));
      } else {
        setResults(prev => ({
          ...prev,
          [key]: { status: 'error', error: data.error || `HTTP ${response.status}`, data, duration },
        }));
      }
    } catch (err) {
      const duration = Math.round(performance.now() - start);
      setResults(prev => ({
        ...prev,
        [key]: { status: 'error', error: err instanceof Error ? err.message : 'Unknown error', duration },
      }));
    }
  };

  const StatusIcon = ({ status }: { status: TestResult['status'] }) => {
    switch (status) {
      case 'running': return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const tests = [
    {
      key: 'delete',
      name: 'Delete Test',
      description: 'Tests the general delete endpoint via /api/test-delete — verifies that content deletion operations work correctly.',
      endpoint: '/api/test-delete',
      method: 'GET',
      icon: <Trash2 className="h-5 w-5 text-red-600" />,
      destructive: false,
    },
    {
      key: 'simpleDelete',
      name: 'Simple Delete Test',
      description: 'Tests the simplified delete endpoint via /api/test-simple-delete — a streamlined version of the delete operation test.',
      endpoint: '/api/test-simple-delete',
      method: 'GET',
      icon: <FileX className="h-5 w-5 text-orange-600" />,
      destructive: false,
    },
    {
      key: 'deleteResponse',
      name: 'Delete Response Test',
      description: 'Tests response/post deletion via /api/test-delete-response — verifies response content can be removed properly.',
      endpoint: '/api/test-delete-response',
      method: 'GET',
      icon: <MessageSquareX className="h-5 w-5 text-pink-600" />,
      destructive: false,
    },
    {
      key: 'communityDelete',
      name: 'Community Delete Test',
      description: 'Tests community question deletion via /api/test-community-delete — checks reference handling and cascading deletes.',
      endpoint: '/api/test-community-delete',
      method: 'GET',
      icon: <FolderX className="h-5 w-5 text-purple-600" />,
      destructive: false,
    },
    {
      key: 'reportCreation',
      name: 'Report Creation Test (POST)',
      description: 'Creates a test report in the database via POST /api/test-report-creation — this WILL create a real report document.',
      endpoint: '/api/test-report-creation',
      method: 'POST',
      icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
      destructive: true,
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
          <Trash2 className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold">CRUD Operation Tests</h1>
            <p className="text-gray-600">Test create, delete, and mutation operations on content</p>
          </div>
        </div>

        {/* Warning */}
        <Card className="mb-6 border-amber-300 bg-amber-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-800">Caution</p>
              <p className="text-sm text-amber-700">
                Some of these tests perform destructive operations (deletes, creates) on real data.
                Tests marked with a warning badge will modify the database. Run them only when you understand what they do.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Test Cards */}
        <div className="space-y-4">
          {tests.map((test) => {
            const result = results[test.key];
            return (
              <Card key={test.key} className={`transition-all ${
                result.status === 'success' ? 'border-green-200 bg-green-50/30' :
                result.status === 'error' ? 'border-red-200 bg-red-50/30' :
                ''
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StatusIcon status={result.status} />
                      <div className="flex items-center gap-2">
                        {test.icon}
                        <CardTitle className="text-lg">{test.name}</CardTitle>
                        {test.destructive && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                            Writes Data
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {result.duration !== undefined && (
                        <span className="text-sm text-gray-500">{result.duration}ms</span>
                      )}
                      <Button
                        variant={test.destructive ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => runTest(test.key, test.endpoint, test.method)}
                        disabled={result.status === 'running'}
                      >
                        {result.status === 'running' ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="ml-8">{test.description}</CardDescription>
                </CardHeader>

                {(result.status === 'success' || result.status === 'error') && (
                  <CardContent className="pt-0">
                    <div className="ml-8">
                      <p className="text-xs font-mono text-gray-400 mb-1">
                        {test.method} {test.endpoint}
                      </p>
                      {result.error && (
                        <p className="text-sm text-red-600 font-medium mb-2">
                          Error: {result.error}
                        </p>
                      )}
                      {result.data && (
                        <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-x-auto max-h-64 overflow-y-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Server Action Reference */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Related Server Actions</h2>
          <Card>
            <CardContent className="p-6">
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">action/test-community-delete.ts</code>
                  <span>— testCommunityDelete(id): Tests community question deletion with reference checks</span>
                </li>
                <li className="flex items-center gap-2">
                  <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">action/test-delete-simple.ts</code>
                  <span>— testDeleteSimple(id): Tests simplified post/response deletion</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
