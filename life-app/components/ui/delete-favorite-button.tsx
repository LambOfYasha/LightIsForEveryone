'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteFavorite } from '@/action/favoriteActions';
import { useToast } from '@/hooks/use-toast';

interface DeleteFavoriteButtonProps {
  favoriteId: string;
  onDelete?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'destructive';
  className?: string;
}

export default function DeleteFavoriteButton({ 
  favoriteId, 
  onDelete, 
  size = 'sm', 
  variant = 'outline',
  className = ''
}: DeleteFavoriteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    
    try {
      const result = await deleteFavorite(favoriteId);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Favorite removed successfully",
        });
        onDelete?.();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to remove favorite",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Delete favorite error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      size={size === "md" ? "default" : size}
      variant={variant}
      onClick={handleDelete}
      disabled={isDeleting}
      className={className}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
} 