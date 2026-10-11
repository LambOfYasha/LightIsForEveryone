'use client';

import { useState, useEffect } from 'react';
import CommentSection from './CommentSection';
import { getComments } from '@/action/comments';

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    imageURL?: string;
  };
  authorRole: string;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

interface CommentSectionWrapperProps {
  postId: string;
  postType: 'community' | 'blog';
  onAddComment: (content: string, parentCommentId?: string) => Promise<void>;
  onEditComment: (commentId: string, content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onLikeComment: (commentId: string) => Promise<void>;
}

export default function CommentSectionWrapper({
  postId,
  postType,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onLikeComment
}: CommentSectionWrapperProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const result = await getComments(postId, postType);
      if ("success" in result) {
        setComments(result.comments);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, postType]);

  const handleAddComment = async (content: string, parentCommentId?: string) => {
    try {
      await onAddComment(content, parentCommentId);
      // Refresh comments after adding
      await fetchComments();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    try {
      await onEditComment(commentId, content);
      // Refresh comments after editing
      await fetchComments();
    } catch (error) {
      console.error('Failed to edit comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await onDeleteComment(commentId);
      // Refresh comments after deleting
      await fetchComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await onLikeComment(commentId);
      // Update comment like status optimistically
      setComments(prev => {
        const updateCommentLikes = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment._id === commentId) {
              return { 
                ...comment, 
                isLiked: !comment.isLiked, 
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 
              };
            }
            if (comment.replies) {
              return { ...comment, replies: updateCommentLikes(comment.replies) };
            }
            return comment;
          });
        };
        return updateCommentLikes(prev);
      });
    } catch (error) {
      console.error('Failed to like comment:', error);
      // Refresh comments on error to get correct state
      await fetchComments();
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  <div className="w-16 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-4 bg-gray-200 rounded"></div>
                <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <CommentSection
      postId={postId}
      postType={postType}
      comments={comments}
      onAddComment={handleAddComment}
      onEditComment={handleEditComment}
      onDeleteComment={handleDeleteComment}
    />
  );
} 