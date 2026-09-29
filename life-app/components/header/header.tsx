"use client"

import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { ChevronLeftIcon, MenuIcon, Shield, Users, UserCheck, BookOpen } from "lucide-react"
import { useSidebar } from "../ui/sidebar"
import { RoleGuard } from "../auth/RoleGuard"
import Link from "next/link"

import { MobileSidebar } from "../mobile-sidebar"

// Use the simple notification icon for now
import NotificationIcon from "./simple-notification-icon";

function Header() {
    const {user} = useUser()
    const {toggleSidebar, open} = useSidebar()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

  return (
<header className="flex items-center justify-between p-3 sm:p-4 border-b relative z-50 bg-background">
    {/* Left side */}
    <div className="flex items-center gap-3">
        {/* Mobile sidebar trigger */}
        <div className="md:hidden lg:hidden">
            <MobileSidebar />
        </div>
        
        {/* Desktop sidebar toggle */}
        <div className="hidden md:block lg:block relative">
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-9 w-9 p-0 hover:bg-muted transition-colors relative z-60 ml-1"
                aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            >
                {open ? (
                    <ChevronLeftIcon className="h-5 w-5" />
                ) : (
                    <MenuIcon className="h-5 w-5" />
                )}
            </Button>
        </div>
    </div>

    {/* Right side */}
    <div className="flex items-center gap-2 sm:gap-4">
        {/* Lessons Link - visible on all devices */}
        <Button variant="outline" size="sm" asChild>
            <Link href="/lessons" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Lessons</span>
            </Link>
        </Button>

        {/* Keep Clerk-driven auth UI client-only so the header markup stays stable through hydration. */}
        {mounted && (
            <>
                <SignedIn>
                    {/* Members Link - hidden on mobile */}
                    <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                        <Link href="/members" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span className="hidden md:inline">Members</span>
                        </Link>
                    </Button>
                    
                    {/* Staff Link - hidden on mobile */}
                    <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                        <Link href="/staff" className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            <span className="hidden md:inline">Staff</span>
                        </Link>
                    </Button>
                    
                    {/* Admin Link - hidden on mobile */}
                    <RoleGuard permission="canAccessAdminPanel">
                        <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                            <Link href="/manage" className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                <span className="hidden md:inline">Admin</span>
                            </Link>
                        </Button>
                    </RoleGuard>
                    
                    {/* Notification Icon */}
                    <NotificationIcon userId={user?.id || ''} />
                    
                    <UserButton/>
                </SignedIn>
            
                <SignedOut>
                    {/* Let Clerk wrap the button so Button still renders the actual DOM node consistently. */}
                    <SignInButton mode="modal">
                        <Button variant={"outline"} size="sm" className="text-sm">
                            Sign In
                        </Button>
                    </SignInButton>
                </SignedOut>
            </>
        )}
    </div>
</header>  
)
}

export default Header