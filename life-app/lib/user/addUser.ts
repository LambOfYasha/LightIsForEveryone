import { adminClient } from "@/sanity/lib/adminClient"
import { UserRole, UserWithRole } from "../auth/roles"

export async function addUser({
    id,
    username,
    imageURL,
    email,
    role = 'member',
} : {
    id:string
    username:string
    imageURL:string
    email:string
    role?: UserRole
}) {
    try {
        console.log("Attempting to create user with ID:", id)
        
        // Check if admin token is available
        if (!process.env.SANITY_ADMIN_API_TOKEN) {
            throw new Error("SANITY_ADMIN_API_TOKEN is not configured")
        }

        // Create the user document with all required fields
        const user = await adminClient.createIfNotExists({
            _id: id,
            _type: "user",
            id: id, // Add the Clerk ID as a field for reference
            username,
            imageURL,
            email,
            role,
            joinedAt: new Date().toISOString(),
            isReported: false,
            bio: '',
            location: '',
            website: '',
        })

        console.log("User created successfully in Sanity:", user._id)
        return user
    } catch (error) {
        console.error("Error creating user:", error)
        throw error
    }
}

export async function createGuestUser(guestName: string): Promise<UserWithRole | {error: string}> {
    try {
        console.log("Creating guest user with name:", guestName);
        
        // Generate a unique guest ID
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create guest user document
        const guestUser = await adminClient.create({
            _type: 'user',
            id: guestId,
            username: guestName,
            email: `${guestId}@guest.local`,
            role: 'guest' as const,
            imageURL: '',
            joinedAt: new Date().toISOString(),
            isActive: true,
            postCount: 0,
            commentCount: 0,
            reportCount: 0,
            isReported: false,
            bio: '',
            location: '',
            website: '',
            isDeleted: false,
        });

        console.log("Guest user created:", guestUser._id);
        
        const user: UserWithRole = {
            _id: guestUser._id,
            username: guestUser.username,
            imageURL: guestUser.imageURL,
            email: guestUser.email,
            role: guestUser.role,
        };
        
        return user;
    } catch (error) {
        console.error("Error creating guest user:", error);
        return { error: "Failed to create guest user" };
    }
}