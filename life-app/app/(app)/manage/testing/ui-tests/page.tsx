'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  ArrowLeft,
  Palette,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import RichEditorTest from "@/components/ui/rich-editor-test";
import TestNotificationButton from "@/components/ui/test-notification-button";
import SimpleTestNotificationButton from "@/components/ui/simple-test-notification-button";

export default function UiTestsPage() {
  const [showRichEditor, setShowRichEditor] = useState(false);

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
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
          <Palette className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold">UI Component Tests</h1>
            <p className="text-gray-600">Test rich editor, notifications, and other interactive UI components</p>
          </div>
        </div>

        <div className="space-y-6">

          {/* Notification Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Test Buttons</CardTitle>
              <CardDescription>
                Test the notification system by generating test notifications. These buttons trigger server actions and API calls to create sample notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Server Action Notification</p>
                  <p className="text-xs text-gray-500 mb-2">
                    Uses <code className="bg-gray-100 px-1 rounded">sendTestNotification</code> server action
                  </p>
                  <TestNotificationButton />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">API Route Notification</p>
                  <p className="text-xs text-gray-500 mb-2">
                    Uses <code className="bg-gray-100 px-1 rounded">/api/test-notification-simple</code> endpoint
                  </p>
                  <SimpleTestNotificationButton />
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">
                  <strong>Source files:</strong>{" "}
                  <code>components/ui/test-notification-button.tsx</code>,{" "}
                  <code>components/ui/simple-test-notification-button.tsx</code>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Rich Editor Test */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Rich Text Editor Test</CardTitle>
                  <CardDescription>
                    Test the TipTap-based rich text editor with formatting, preview, and raw HTML output.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowRichEditor(!showRichEditor)}
                >
                  {showRichEditor ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Editor
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Editor
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            {showRichEditor && (
              <CardContent>
                <RichEditorTest />
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">
                    <strong>Source file:</strong>{" "}
                    <code>components/ui/rich-editor-test.tsx</code>
                  </p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Links to Standalone Test Pages */}
          <Card>
            <CardHeader>
              <CardTitle>Standalone Test Pages</CardTitle>
              <CardDescription>
                These test pages exist as separate routes in the app and can be opened directly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">Guest Access Test</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Test guest functionality — viewing posts, making comments, and searching without authentication.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/test-guest">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open /test-guest
                      </Link>
                    </Button>
                    <p className="text-xs text-gray-400 mt-2">
                      Source: <code>app/(app)/test-guest/page.tsx</code>
                    </p>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">Spoiler / Rich Editor Page</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Test the rich text editor with content renderer, including spoiler support and HTML debug output.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/test-spoiler">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open /test-spoiler
                      </Link>
                    </Button>
                    <p className="text-xs text-gray-400 mt-2">
                      Source: <code>app/(app)/test-spoiler/page.tsx</code>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
