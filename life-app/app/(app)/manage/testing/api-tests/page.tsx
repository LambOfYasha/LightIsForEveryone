'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  ArrowLeft,
  Database,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Server,
  FileSearch,
  FileText,
} from "lucide-react";

interface TestResult {
  status: 'idle' | 'running' | 'success' | 'error';
  data?: Record<string, unknown>;
  error?: string;
  duration?: number;
}

export default function ApiTestsPage() {
  const [results, setResults] = useState<Record<string, TestResult>>({
    sanity: { status: 'idle' },
    adminClient: { status: 'idle' },
    responseQuery: { status: 'idle' },
    reportCreationGet: { status: 'idle' },
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

  const runAll = async () => {
    await Promise.all([
      runTest('sanity', '/api/test-sanity'),
      runTest('adminClient', '/api/test-admin'),
      runTest('responseQuery', '/api/test-response-query'),
      runTest('reportCreationGet', '/api/test-report-creation'),
    ]);
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
      key: 'sanity',
      name: 'Sanity Connection Test',
      description: 'Tests the basic Sanity client connection by fetching sample users and reports from the database.',
      endpoint: '/api/test-sanity',
      icon: <Database className="h-5 w-5 text-green-600" />,
    },
    {
      key: 'adminClient',
      name: 'Admin Client Test',
      description: 'Verifies the Sanity admin client configuration — checks environment variables (project ID, dataset, API token) and runs a test query.',
      endpoint: '/api/test-admin',
      icon: <Server className="h-5 w-5 text-blue-600" />,
    },
    {
      key: 'responseQuery',
      name: 'Response Query Test',
      description: 'Tests querying response/post data from Sanity to verify GROQ queries work correctly.',
      endpoint: '/api/test-response-query',
      icon: <FileSearch className="h-5 w-5 text-purple-600" />,
    },
    {
      key: 'reportCreationGet',
      name: 'Report Query Test',
      description: 'Fetches all existing reports from the database to verify the report schema and query structure.',
      endpoint: '/api/test-report-creation',
      icon: <FileText className="h-5 w-5 text-amber-600" />,
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

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold">API & Database Tests</h1>
              <p className="text-gray-600">Test Sanity connection, API routes, and database queries</p>
            </div>
          </div>
          <Button onClick={runAll} size="lg">
            <Play className="h-4 w-4 mr-2" />
            Run All
          </Button>
        </div>

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
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {result.duration !== undefined && (
                        <span className="text-sm text-gray-500">{result.duration}ms</span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runTest(test.key, test.endpoint)}
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
                        GET {test.endpoint}
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
                  <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">action/test-admin-client.ts</code>
                  <span>— testAdminClient(): Tests Sanity admin client env vars and query execution</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
