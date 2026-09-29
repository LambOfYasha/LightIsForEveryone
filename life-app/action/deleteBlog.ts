'use server';

import { getUser } from "@/lib/user/getUser";
import { getPayloadClient } from "@/payload/lib/client";
import { getBlogById } from "@/payload/lib/blogs/queries";
import { cleanupFavoritesForDeletedPost, cleanupAllCommentsForDeletedPost } from "./embeddedComments";

const TEACHER_ROLES = ["teacher", "junior_teacher", "senior_teacher", "lead_teacher", "admin"];

export async function deleteBlog(blogId: string) {
    try {
        const user = await getUser();
        if ("error" in user) {
            return { error: user.error };
        }

        const blog = await getBlogById(blogId);
        if (!blog) {
            return { error: "Blog not found" };
        }
        if (blog.isDeleted) {
            return { success: true, message: "Blog was already deleted" };
        }

        const isStaff = TEACHER_ROLES.includes(user.role);
        if (blog.author?._id !== user._id && !isStaff) {
            return { error: "You don't have permission to delete this blog" };
        }

        if (
            user.role === "junior_teacher" &&
            blog.author?.role &&
            ["teacher", "junior_teacher", "senior_teacher", "lead_teacher"].includes(blog.author.role) &&
            blog.author?._id !== user._id
        ) {
            return { error: "Junior teachers cannot delete content from other teachers" };
        }

        const cleanupResult = await cleanupFavoritesForDeletedPost(blogId);
        if ("error" in cleanupResult) {
            console.warn("Warning: Failed to cleanup favorites:", cleanupResult.error);
        }
        const commentCleanupResult = await cleanupAllCommentsForDeletedPost(blogId, "blog");
        if ("error" in commentCleanupResult) {
            console.warn("Warning: Failed to cleanup comments:", commentCleanupResult.error);
        }

        const payload = await getPayloadClient();
        await payload.update({
            collection: "blogs",
            id: blogId,
            data: {
                isDeleted: true,
                deletedAt: new Date().toISOString(),
                deletedBy: user._id,
            },
            overrideAccess: true,
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to delete blog:", error);
        return { error: "Failed to delete blog - please try again" };
    }
}

export async function deleteBlogAction(blogId: string) {
    const result = await deleteBlog(blogId);
    if ("error" in result) {
        throw new Error(result.error);
    }
    return result;
}
