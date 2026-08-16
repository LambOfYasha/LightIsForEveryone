"use client"
// Client component for the sidebar
import * as React from "react"
import { Minus, Plus, LayoutDashboard, User, Heart, Users, Settings, BookOpen, UserCheck, Home, HelpCircle } from "lucide-react"
import { useAuth, useUser } from "@clerk/nextjs"

import { SearchForm } from "@/components/search-form"
import { Suspense } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"
import CreateCommunityButton from "./header/CreateCommunityButton"
import CreateBlogButton from "./header/CreateBlogButton"

// Member navigation items
const memberNavigation = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Lessons",
    url: "/lessons",
    icon: BookOpen,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Favorites",
    url: "/dashboard/favorites",
    icon: Heart,
  },
  {
    title: "Questions",
    url: "/dashboard/questions",
    icon: Users,
  },
  {
    title: "Blog",
    url: "/dashboard/blogs",
    icon: BookOpen,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export default function AppSidebar() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { state } = useSidebar();
  const [mounted, setMounted] = React.useState(false);
  const [communities, setCommunities] = React.useState([]);
  const [blogs, setBlogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [blogsLoading, setBlogsLoading] = React.useState(true);
  const [hasFetched, setHasFetched] = React.useState(false);
  const [hasFetchedBlogs, setHasFetchedBlogs] = React.useState(false);
  const [userRole, setUserRole] = React.useState<string | null>(null);

  // Defer rendering of Radix UI components until after hydration to prevent
  // aria-controls ID mismatches between server and client.
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user role on client side
  React.useEffect(() => {
    async function fetchUserRole() {
      if (user) {
        try {
          const response = await fetch('/api/user/role');
          if (response.ok) {
            const data = await response.json();
            setUserRole(data.role);
          } else {
            console.error('Failed to fetch user role:', response.status);
          }
        } catch (error) {
          console.error('Failed to fetch user role:', error);
        }
      }
    }

    fetchUserRole();
  }, [user]);

  // Fetch communities on client side
  React.useEffect(() => {
    // Prevent multiple fetches
    if (hasFetched) return;

    async function fetchCommunities() {
      try {
        setLoading(true);
        const response = await fetch('/api/communities');
        if (response.ok) {
          const data = await response.json();
          setCommunities(data);
        } else {
          console.error('Failed to fetch communities:', response.status);
          setCommunities([]);
        }
      } catch (error) {
        console.error('Failed to fetch communities:', error);
        setCommunities([]);
      } finally {
        setLoading(false);
        setHasFetched(true);
      }
    }

    fetchCommunities();
  }, [hasFetched]); // Only depend on hasFetched to prevent infinite loops

  // Fetch blogs on client side
  React.useEffect(() => {
    // Prevent multiple fetches
    if (hasFetchedBlogs) return;

    async function fetchBlogs() {
      try {
        setBlogsLoading(true);
        const response = await fetch('/api/blogs');
        if (response.ok) {
          const data = await response.json();
          setBlogs(data);
        } else {
          console.error('Failed to fetch blogs:', response.status);
          setBlogs([]);
        }
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
        setBlogs([]);
      } finally {
        setBlogsLoading(false);
        setHasFetchedBlogs(true);
      }
    }

    fetchBlogs();
  }, [hasFetchedBlogs]); // Only depend on hasFetchedBlogs to prevent infinite loops

  // Check if user can create blogs (admin or teacher)
  const canCreateBlogs = userRole === "admin" || userRole === "teacher" || userRole === "junior_teacher" || userRole === "senior_teacher" || userRole === "lead_teacher";

  // Render a lightweight skeleton during SSR / before hydration to avoid
  // Radix aria-controls ID mismatches.
  if (!mounted) {
    return (
      <>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/" aria-label="Home">
                  <Home className="h-6 w-6" />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent />
        <SidebarRail />
      </>
    );
  }
  
  return (
    <>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {state === "expanded" ? (
              <SidebarMenuButton size="lg" asChild className="h-auto">
                <Link href="/" aria-label="Home">
                  <Image
                    src="/assets/logo_light.png"
                    alt="Light Is For Everyone Logo"
                    width={224}
                    height={126}
                    className="w-full h-auto rounded dark:hidden"
                    priority
                  />
                  <Image
                    src="/assets/logo_dark.png"
                    alt="Light Is For Everyone Logo Dark"
                    width={224}
                    height={126}
                    className="hidden w-full h-auto rounded dark:block"
                    priority
                  />
                </Link>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton size="lg" asChild>
                <Link href="/" aria-label="Home">
                  <Home className="h-6 w-6" />
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
        {state === "expanded" && (
          <Suspense fallback={<div className="p-3 sm:p-4 text-sm">Loading search...</div>}>
            <SearchForm />
          </Suspense>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="text-sm sm:text-base">
                <CreateCommunityButton />
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* Only show CreateBlogButton for admins and teachers */}
            {canCreateBlogs && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-sm sm:text-base">
                  <CreateBlogButton />
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
        
        {/* Member Dashboard Navigation - Only show when signed in */}
        {isSignedIn && (
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-sm sm:text-base">
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-sm sm:text-base">
                  <Link href="/dashboard/profile">
                    <User className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-sm sm:text-base">
                  <Link href="/dashboard/favorites">
                    <Heart className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Favorites</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-sm sm:text-base">
                  <Link href="/dashboard/questions">
                    <Users className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Questions</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-sm sm:text-base">
                  <Link href="/dashboard/blogs">
                    <BookOpen className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Blog</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-sm sm:text-base">
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-sm sm:text-base">
                  <Link href="/members">
                    <Users className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Members</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-sm sm:text-base">
                  <Link href="/staff">
                    <UserCheck className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Staff</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-sm sm:text-base">
                  <Link href="/help">
                    <HelpCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Help Center</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Community Questions */}
        <SidebarGroup>
          <SidebarMenu>
              <Collapsible
              defaultOpen={true}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="text-sm sm:text-base">
                    <span>Community Questions</span>{" "}
                      <Plus className="ml-auto h-3 w-3 sm:h-4 sm:w-4 group-data-[state=open]/collapsible:hidden" />
                      <Minus className="ml-auto h-3 w-3 sm:h-4 sm:w-4 group-data-[state=closed]/collapsible:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                {!loading && communities.length > 0 && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                      {communities.map((community: any) => (
                        <SidebarMenuSubItem key={community._id}>
                            <SidebarMenuSubButton
                              asChild
                            isActive={false}
                            className="text-xs sm:text-sm"
                            >
                            <Link href={`/community-questions/${community.slug?.current || community.slug}`}>
                              {community.title || "Untitled"}
                            </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                )}
                </SidebarMenuItem>
              </Collapsible>
          </SidebarMenu>
        </SidebarGroup>

        {/* Teacher's Blog */}
        <SidebarGroup>
          <SidebarMenu>
            <Collapsible
              defaultOpen={true}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="text-sm sm:text-base">
                    <span>Teacher's Blog</span>{" "}
                    <Plus className="ml-auto h-3 w-3 sm:h-4 sm:w-4 group-data-[state=open]/collapsible:hidden" />
                    <Minus className="ml-auto h-3 w-3 sm:h-4 sm:w-4 group-data-[state=closed]/collapsible:hidden" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {!blogsLoading && blogs.length > 0 && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {blogs.map((blog: any) => (
                        <SidebarMenuSubItem key={blog._id}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={false}
                            className="text-xs sm:text-sm"
                          >
                            <Link href={`/blogs/${blog.slug?.current || blog.slug}`}>
                              {blog.title || "Untitled Blog"}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </>
  )
}
