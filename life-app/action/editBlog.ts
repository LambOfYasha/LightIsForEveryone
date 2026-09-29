'use server';

import { getUser } from "@/lib/user/getUser";
import { getPayloadClient } from "@/payload/lib/client";
import { getBlogById } from "@/payload/lib/blogs/queries";
import { mapBlog } from "@/payload/lib/blogs/mapBlog";

export type ImageData = {
    base64: string;
    fileName: string;
    contentType: string;
} | null;

const TEACHER_ROLES = ["teacher", "junior_teacher", "senior_teacher", "lead_teacher", "admin"];

export async function editBlog(
    blogId: string,
    title: string,
    description: string,
    slug: string,
    content: string,
    imageData: ImageData | null,
    tags?: string[]
) {
    try {
        const user = await getUser();
        if ("error" in user) {
            return { error: user.error };
        }

        const blog = await getBlogById(blogId);
        if (!blog || blog.isDeleted) {
            return { error: "Blog not found" };
        }

        const isStaff = TEACHER_ROLES.includes(user.role);
        if (blog.author?._id !== user._id && !isStaff) {
            return { error: "You don't have permission to edit this blog" };
        }

        if (
            user.role === "junior_teacher" &&
            blog.author?._id !== user._id &&
            blog.author?.role &&
            ["teacher", "junior_teacher", "senior_teacher", "lead_teacher"].includes(blog.author.role)
        ) {
            return { error: "Junior teachers cannot edit content from other teachers" };
        }

        const payload = await getPayloadClient();
        if (slug !== blog.slug) {
            const existingSlug = await payload.find({
                collection: "blogs",
                where: { slug: { equals: slug } },
                limit: 1,
                overrideAccess: true,
            });
            if (existingSlug.docs[0] && String(existingSlug.docs[0].id) !== blogId) {
                return { error: "A blog with this URL already exists" };
            }
        }

        const data: Record<string, unknown> = {
            title,
            description,
            slug,
            content,
        };

        if (tags) {
            data.tags = tags;
        }

        if (imageData) {
            const base64Data = imageData.base64.includes(",") ? imageData.base64.split(",")[1] : imageData.base64;
            const buffer = Buffer.from(base64Data, "base64");
            const media = await payload.create({
                collection: "media",
                data: { alt: title },
                file: {
                    data: buffer,
                    mimetype: imageData.contentType || "image/jpeg",
                    name: imageData.fileName || "cover.jpg",
                    size: buffer.length,
                },
                overrideAccess: true,
            });
            data.cover = media.id;
        }

        const updated = await payload.update({
            collection: "blogs",
            id: blogId,
            data,
            overrideAccess: true,
        });

        return { success: true, blog: mapBlog(updated) };
    } catch (error) {
        console.error("Failed to edit blog:", error);
        return { error: "Failed to edit blog" };
    }
}
