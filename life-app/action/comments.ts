'use server';

import { getUser } from "@/lib/user/getUser";
import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";
import { client } from "@/sanity/lib/client";
import { addUser} from "@/lib/user/addUser"
import { currentUser } from "@clerk/nextjs/server"
import { auth } from '@clerk/nextjs/server'

export async function addComment(
    postId: string,
    postType: 'community' | 'blog',
    content: string,
    parentCommentId?: string
) {
    try {
        const user = await getUser();

        if ("error" in user) {
            return { error: user.error };
        }

        // Create the comment document
        const commentDoc: any = {
            _type: "comment",
            content,
            author: {
                _type: "reference",
                _ref: user._id,
            },
            post: {
                _type: "reference",
                _ref: postId,
            },
            postType,
            createdAt: new Date().toISOString(),
            likes: 0,
            likedBy: [],
        };

        // Add parent comment reference if this is a reply
        if (parentCommentId) {
            commentDoc.parentComment = {
                _type: "reference",
                _ref: parentCommentId,
            };
        }

        const createdComment = await adminClient.create(commentDoc);

        // If this is a reply, update the parent comment's replies array
        if (parentCommentId) {
            await adminClient
                .patch(parentCommentId)
                .setIfMissing({ replies: [] })
                .append('replies', [{
                    _type: 'reference',
                    _ref: createdComment._id,
                }])
                .commit();
        }

        return { success: true, comment: createdComment };
    } catch (error) {
        console.error("Failed to add comment:", error);
        return { error: "Failed to add comment" };
    }
}

export async function editComment(
    commentId: string,
    content: string
) {
    try {
        const user = await getUser();

        if ("error" in user) {
            return { error: user.error };
        }

        // Check if user has permission to edit this comment
        const commentQuery = defineQuery(`
            *[_type == "comment" && _id == $commentId][0] {
                _id,
                author->{_id},
                content
            }
        `);

        const comment = await client.fetch(commentQuery, { commentId });

        if (!comment) {
            return { error: "Comment not found" };
        }

        // Check if user is the author or an admin
        if (comment.author?._id !== user._id && user.role !== "admin") {
            return { error: "You don't have permission to edit this comment" };
        }

        // Update the comment
        const updatedComment = await adminClient
            .patch(commentId)
            .set({
                content,
                updatedAt: new Date().toISOString(),
            })
            .commit();

        return { success: true, comment: updatedComment };
    } catch (error) {
        console.error("Failed to edit comment:", error);
        return { error: "Failed to edit comment" };
    }
}

export async function deleteComment(
    commentId: string
) {
    console.log("=== DELETE COMMENT FUNCTION ENTRY ===");
    console.log("CommentId received:", commentId);
    
    try {
        console.log("=== DELETE COMMENT DEBUG START ===");
        console.log("Starting deleteComment with commentId:", commentId);
        
        if (!commentId || typeof commentId !== 'string' || commentId.trim() === '') {
            console.error("Invalid comment ID provided:", commentId);
            return { error: "Invalid comment ID" };
        }
        
        // Check environment variables
        if (!process.env.SANITY_ADMIN_API_TOKEN) {
            console.error("SANITY_ADMIN_API_TOKEN is not set");
            return { error: "Admin token not configured" };
        }

        console.log("Environment variables check passed");
        
        const user = await getUser();
        console.log("User result:", user);

        if ("error" in user) {
            console.error("User error:", user.error);
            return { error: user.error };
        }

        if (!user || !user._id) {
            console.error("User not found or missing ID");
            return { error: "User authentication failed" };
        }

        // Check if user has permission to delete this comment
        const commentQuery = defineQuery(`
            *[_type == "comment" && _id == $commentId && (isDeleted == false || isDeleted == null)][0] {
                _id,
                author->{_id}
            }
        `);

        console.log("Fetching comment with ID:", commentId);
        
        // Test admin client connection first
        try {
            const testQuery = defineQuery(`*[_type == "comment"][0]{_id}`);
            const testResult = await adminClient.fetch(testQuery);
            console.log("Admin client test successful:", testResult ? "Found document" : "No documents");
        } catch (testError) {
            console.error("Admin client test failed:", testError);
            return { error: "Database connection failed - please check your configuration" };
        }
        
        let comment;
        try {
            comment = await client.fetch(commentQuery, { commentId });
            console.log("Comment query result:", comment);
        } catch (queryError) {
            console.error("Error fetching comment:", queryError);
            return { error: "Failed to fetch comment - please try again" };
        }

        if (!comment) {
            console.error("Comment not found with ID:", commentId);
            return { error: "Comment not found" };
        }

        console.log("Comment author ID:", comment.author?._id);
        console.log("Current user ID:", user._id);
        console.log("Current user role:", user.role);

        // Check if user is the author or an admin
        if (comment.author?._id !== user._id && user.role !== "admin") {
            console.error("User does not have permission to delete this comment");
            return { error: "You don't have permission to delete this comment" };
        }

        console.log("Permission check passed, proceeding with soft deletion");

        // Soft delete the comment
        console.log("Soft deleting comment with ID:", commentId);
        try {
            const softDeleteResult = await adminClient
                .patch(commentId)
                .set({
                    isDeleted: true,
                    deletedAt: new Date().toISOString(),
                    deletedBy: user._id
                })
                .commit();
            
            console.log("Soft delete result:", softDeleteResult);
            
            if (!softDeleteResult) {
                console.error("Soft delete operation returned null/undefined");
                return { error: "Delete operation failed - no result returned" };
            }
            
            console.log("Soft delete operation completed successfully");
        } catch (deleteError) {
            console.error("Error during soft deletion:", deleteError);
            console.error("Error type:", typeof deleteError);
            console.error("Error message:", deleteError instanceof Error ? deleteError.message : String(deleteError));
            
            if (deleteError instanceof Error) {
                if (deleteError.message.includes("not found")) {
                    return { error: "Comment not found or already deleted" };
                }
                if (deleteError.message.includes("referenced")) {
                    return { error: "Cannot delete comment with existing references" };
                }
                if (deleteError.message.includes("permission")) {
                    return { error: "Permission denied - please check your access rights" };
                }
                if (deleteError.message.includes("token")) {
                    return { error: "Authentication failed - please check your Sanity token" };
                }
                if (deleteError.message.includes("network")) {
                    return { error: "Network error - please check your connection" };
                }
            }
            return { error: "Failed to delete comment - please try again" };
        }

        console.log("=== DELETE COMMENT DEBUG END ===");
        return { success: true };
    } catch (error) {
        console.error("=== DELETE COMMENT ERROR ===");
        console.error("Failed to delete comment:", error);
        console.error("Error type:", typeof error);
        console.error("Error message:", error instanceof Error ? error.message : String(error));
        console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
        console.error("=== END ERROR ===");
        
        return { error: "Failed to delete comment - please try again" };
    }
}

export async function likeComment(
    commentId: string
) {
    try {
        const user = await getUser();

        if ("error" in user) {
            return { error: user.error };
        }

        // Get the current comment
        const commentQuery = defineQuery(`
            *[_type == "comment" && _id == $commentId][0] {
                _id,
                likes,
                likedBy
            }
        `);

        const comment = await client.fetch(commentQuery, { commentId });

        if (!comment) {
            return { error: "Comment not found" };
        }

        const currentLikes = comment.likes || 0;
        const likedBy = comment.likedBy || [];
        const userLiked = likedBy.includes(user._id);

        // Toggle like
        const newLikes = userLiked ? currentLikes - 1 : currentLikes + 1;
        const newLikedBy = userLiked 
            ? likedBy.filter((id: string) => id !== user._id)
            : [...likedBy, user._id];

        // Update the comment
        const updatedComment = await adminClient
            .patch(commentId)
            .set({
                likes: newLikes,
                likedBy: newLikedBy,
            })
            .commit();

        return { 
            success: true, 
            comment: updatedComment,
            isLiked: !userLiked,
            likes: newLikes
        };
    } catch (error) {
        console.error("Failed to like comment:", error);
        return { error: "Failed to like comment" };
    }
}

export async function getComments(
    postId: string,
    postType: 'community' | 'blog'
) {
    try {
        const user = await getUser();
        const userId = user && !("error" in user) ? user._id : null;

        const commentsQuery = defineQuery(`
            *[_type == "comment" && post._ref == $postId && postType == $postType && !defined(parentComment) && (isDeleted == false || isDeleted == null)] | order(createdAt asc) {
                _id,
                content,
                "authorRole": coalesce(author->role, "guest"),
                createdAt,
                updatedAt,
                likes,
                "author": author->{
                    _id,
                    username,
                    imageURL
                },
                "isLiked": $userId in likedBy,
                "replies": *[_type == "comment" && parentComment._ref == ^._id && (isDeleted == false || isDeleted == null)] | order(createdAt asc) {
                    _id,
                    content,
                "authorRole": coalesce(author->role, "guest"),
                    createdAt,
                    updatedAt,
                    likes,
                    "author": author->{
                        _id,
                        username,
                        imageURL
                    },
                    "isLiked": $userId in likedBy,
                    "replies": *[_type == "comment" && parentComment._ref == ^._id && (isDeleted == false || isDeleted == null)] | order(createdAt asc) {
                        _id,
                        content,
                "authorRole": coalesce(author->role, "guest"),
                        createdAt,
                        updatedAt,
                        likes,
                        "author": author->{
                            _id,
                            username,
                            imageURL
                        },
                        "isLiked": $userId in likedBy
                    }
                }
            }
        `);

        const comments = await client.fetch(commentsQuery, { postId, postType, userId });

        return { success: true, comments: comments || [] };
    } catch (error) {
        console.error("Failed to get comments:", error);
        return { error: "Failed to get comments" };
    }
} 