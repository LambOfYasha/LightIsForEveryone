'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Scale, AlertCircle, CheckCircle } from 'lucide-react';
import { ModerationResult } from '@/lib/ai/moderation';

interface AppealButtonProps {
  contentId: string;
  contentType: 'post' | 'response' | 'comment' | 'blog' | 'community';
  originalContent: string;
  originalModeration: ModerationResult;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export default function AppealButton({
  contentId,
  contentType,
  originalContent,
  originalModeration,
  size = 'sm',
  variant = 'outline'
}: AppealButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!appealReason.trim()) {
      setErrorMessage('Please provide a reason for your appeal');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/appeals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId,
          contentType,
          originalContent,
          originalModeration,
          appealReason: appealReason.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus('success');
        setAppealReason('');
        setTimeout(() => {
          setIsOpen(false);
          setSubmitStatus('idle');
        }, 2000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Failed to submit appeal');
      }
    } catch (error) {
      console.error('Error submitting appeal:', error);
      setSubmitStatus('error');
      setErrorMessage('Failed to submit appeal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setAppealReason('');
    setSubmitStatus('idle');
    setErrorMessage('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size === "md" ? "default" : size}>
          <Scale className="w-4 h-4 mr-2" />
          Appeal Decision
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Appeal Moderation Decision</DialogTitle>
          <DialogDescription>
            If you believe this content was incorrectly moderated, you can appeal the decision.
            Please provide a clear reason for your appeal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmitAppeal} className="space-y-4">
          {/* Original Content Preview */}
          <div className="space-y-2">
            <Label>Original Content</Label>
            <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700 max-h-20 overflow-y-auto">
              {originalContent.length > 200 
                ? `${originalContent.substring(0, 200)}...` 
                : originalContent
              }
            </div>
          </div>

          {/* Original Moderation Reason */}
          <div className="space-y-2">
            <Label>Original Decision</Label>
            <div className="p-3 bg-red-50 rounded-md text-sm text-red-700">
              <div className="font-medium">
                {originalModeration.suggestedAction === 'block' ? 'Blocked' : 
                 originalModeration.suggestedAction === 'flag' ? 'Flagged for Review' : 'Allowed'}
              </div>
              <div className="text-xs mt-1">{originalModeration.reason}</div>
            </div>
          </div>

          {/* Appeal Reason */}
          <div className="space-y-2">
            <Label htmlFor="appeal-reason">Appeal Reason *</Label>
            <Textarea
              id="appeal-reason"
              placeholder="Please explain why you believe this content should be allowed..."
              value={appealReason}
              onChange={(e) => setAppealReason(e.target.value)}
              rows={4}
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              Be specific about why the content should be allowed. Appeals are reviewed by moderators.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {submitStatus === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Appeal submitted successfully! You will be notified when a decision is made.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !appealReason.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Appeal'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 