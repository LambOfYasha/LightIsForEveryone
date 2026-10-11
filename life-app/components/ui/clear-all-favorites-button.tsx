'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { clearAllFavoritesAction } from '@/action/embeddedCommentActions';
import { useRouter } from 'next/navigation';

interface ClearAllFavoritesButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  children?: React.ReactNode;
}

export default function ClearAllFavoritesButton({ 
  className = '',
  size = 'md',
  variant = 'outline',
  children
}: ClearAllFavoritesButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClearAll = async () => {
    if (isLoading) return;

    if (!confirm('Are you sure you want to clear all favorites? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await clearAllFavoritesAction();
      console.log(`Cleared ${result.clearedCount} favorites`);
      // Refresh the page to show updated favorites
      router.refresh();
    } catch (error) {
      console.error('Error clearing all favorites:', error);
      alert('Failed to clear all favorites. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size === "md" ? "default" : size}
      onClick={handleClearAll}
      disabled={isLoading}
      className={className}
    >
      <Trash2 className="w-4 h-4 mr-2" />
      {children || 'Clear All'}
    </Button>
  );
} 