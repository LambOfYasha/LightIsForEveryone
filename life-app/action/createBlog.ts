'use server'

import { getUser } from "@/lib/user/getUser"
import { createBlog } from "@/payload/lib/blogs/createBlog"

export type ImageData = {
    base64: string
    fileName: string
    contentType: string
} | null

export async function createBlogPost(
    title: string,
    imageBase64: string | null | undefined,
    imageFilename: string | null | undefined,
    imageContentType: string | null | undefined,
    slug?: string,
    description?: string,
    content?: string,
    tags?: string[]
) {
    try {
        console.log("Starting createBlogPost with title:", title)
        const user = await getUser()
        console.log("User result:", user)

        if ("error" in user) {
            console.log("User error:", user.error)
            return { error: user.error }
        }

        console.log("User role:", user.role)
        // Check if user has permission to create blogs (admin or teacher)
        if (user.role !== "admin" && user.role !== "teacher" && user.role !== "junior_teacher" && user.role !== "senior_teacher" && user.role !== "lead_teacher") {
            console.log("User doesn't have permission to create blogs")
            return { error: "You don't have permission to create blog posts" }
        }

        let imageData: ImageData = null
        if(imageBase64 && imageFilename && imageContentType) {
            imageData = {
                base64: imageBase64,
                fileName: imageFilename,
                contentType: imageContentType,
            }
        }

        const result = await createBlog(
            title,
            user._id,
            imageData,
            slug,
            description || "",
            content || "",
            tags,
            {
                username: user.username,
                imageURL: user.imageURL,
                role: user.role,
            }
        )

        return result
       
    } catch (error) {
        console.error("failed to create blog", error)
        return { error: "failed to create blog" }
    }
} 