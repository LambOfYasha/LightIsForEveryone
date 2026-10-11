'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, HeartOff } from 'lucide-react';
import { addPostFavoriteAction, removePostFavoriteAction, checkPostFavoriteAction } from '@/action/embeddedCommentActions';

interface FavoriteButtonProps {
  postId: string;
  postType: 'blog' | 'community' | 'response';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export default function FavoriteButton({ 
  postId, 
  postType, 
  className = '',
  size = 'sm',
  variant = 'outline'
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const result = await checkPostFavoriteAction(postId, postType);
        if ('success' in result) {
          setIsFavorited(result.isFavorited);
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkFavoriteStatus();
  }, [postId, postType]);

  const handleToggleFavorite = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isFavorited) {
        await removePostFavoriteAction(postId, postType);
        setIsFavorited(false);
      } else {
        await addPostFavoriteAction(postId, postType);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size === "md" ? "default" : size}
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={className}
    >
      {isFavorited ? (
        <Heart className="w-4 h-4 mr-2 fill-current" />
      ) : (
        <HeartOff className="w-4 h-4 mr-2" />
      )}
      {isFavorited ? 'Saved' : 'Save'}
    </Button>
  );
} 