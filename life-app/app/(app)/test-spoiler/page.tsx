'use client';

import React, { useState } from 'react';
import ClientRichEditor from '@/components/ui/client-rich-editor';
import RichContentRenderer from '@/components/ui/rich-content-renderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestRichEditorPage() {
  const [content, setContent] = useState('<p>Test the rich text editor functionality...</p>');
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rich Text Editor Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Editor</h3>
              <p className="text-sm text-gray-600 mb-4">
                Test all the rich text editor features including formatting, media, and layout options.
              </p>
              <ClientRichEditor
                content={content}
                onChange={setContent}
                placeholder="Test the rich text editor functionality..."
                maxHeight="300px"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowPreview(!showPreview)}
                variant="outline"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
              
              <Button 
                onClick={() => setContent('<p>Reset content</p>')}
                variant="outline"
              >
                Reset Content
              </Button>
            </div>
            
            {showPreview && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Preview</h3>
                <Card>
                  <CardContent className="p-4">
                    <RichContentRenderer content={content} />
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Raw HTML (Debug)</h3>
              <Card>
                <CardContent className="p-4">
                  <pre className="text-xs bg-gray-100 p-4 rounded overflow-x-auto max-h-96 overflow-y-auto">
                    {content}
                  </pre>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Processed HTML (Debug)</h3>
              <Card>
                <CardContent className="p-4">
                  <pre className="text-xs bg-gray-100 p-4 rounded overflow-x-auto max-h-96 overflow-y-auto">
                    {(() => {
                      // Simulate the same processing as RichContentRenderer
                      const processed = content
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&amp;/g, '&')
                        .replace(/&quot;/g, '"')
                        .replace(/&#39;/g, "'")
                        .replace(/&nbsp;/g, ' ');
                      
                      const sanitized = processed
                        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                        .replace(/javascript:/gi, '')
                        .replace(/on\w+\s*=/gi, '');
                      
                      return sanitized;
                    })()}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 