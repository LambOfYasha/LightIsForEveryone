'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { approveCommunityResponse, unapproveCommunityResponse } from '@/action/postActions';

interface ApproveResponseButtonProps {
  responseId: string;
  isApproved: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  onSuccess?: () => void;
}

export default function ApproveResponseButton({ 
  responseId, 
  isApproved,
  className = '',
  size = 'sm',
  variant = 'outline',
  onSuccess
}: ApproveResponseButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleApproval = async () => {
    if (isLoading) return;

    const action = isApproved ? 'unapprove' : 'approve';
    if (!confirm(`Are you sure you want to ${action} this response?`)) {
      return;
    }

    setIsLoading(true);
    try {
      if (isApproved) {
        await unapproveCommunityResponse(responseId);
      } else {
        await approveCommunityResponse(responseId);
      }
      // Call onSuccess callback to refresh the data
      onSuccess?.();
    } catch (error) {
      console.error(`Error ${action}ing response:`, error);
      alert(`Failed to ${action} response. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size === "md" ? "default" : size}
      onClick={handleToggleApproval}
      disabled={isLoading}
      className={`${className} ${isApproved ? 'text-green-600 hover:text-green-700' : 'text-gray-600 hover:text-gray-700'}`}
    >
      {isApproved ? (
        <XCircle className="w-4 h-4 mr-2" />
      ) : (
        <CheckCircle className="w-4 h-4 mr-2" />
      )}
      {isApproved ? 'Unapprove' : 'Approve'}
    </Button>
  );
}