import { getCurrentUser } from "@/lib/auth/middleware";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  Star,
  Users,
  MessageSquare,
  Eye,
  Calendar,
  Plus,
  ArrowRight,
  Flame,
  Bookmark,
  User,
  Activity
} from "lucide-react";
import { getCommunitiesServer } from "@/sanity/lib/communties/getCommunitiesServer";
import CreateCommunityButton from "@/components/header/CreateCommunityButton";
import QuestionsClient from "./questions-client";
import { formatDistanceToNow } from "date-fns";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

interface CommunityQuestion {
  _id: string;
  title: string;
  description?: string;
  slug: string;
  image?: {
    asset: {
      _ref: string;
    };
    alt?: string;
  };
  moderator: {
    _id: string;
    username: string;
    imageURL?: string;
  };
  createdAt: string;
  _createdAt: string;
}

export default async function QuestionsPage() {
  const user = await getCurrentUser();
  const communities = await getCommunitiesServer();

  // Separate communities into different categories
  const featuredCommunities = communities.slice(0, 3);
  const recentCommunities = communities.slice(0, 6);
  const popularCommunities = communities.slice(0, 4);

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Community Questions</h1>
              <p className="text-sm sm:text-base text-gray-600">Discover and engage with community discussions</p>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <CreateCommunityButton />
              )}
            </div>
          </div>
        </div>

        <QuestionsClient>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Total Questions</CardTitle>
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{communities.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Active Moderators</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {new Set(communities.map(c => c.moderator._id)).size}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {communities.filter(c => {
                    const createdAt = new Date(c.createdAt ?? c._createdAt);
                    const now = new Date();
                    return createdAt.getMonth() === now.getMonth() && 
                           createdAt.getFullYear() === now.getFullYear();
                  }).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Featured</CardTitle>
                <Star className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{featuredCommunities.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
        <Tabs defaultValue="all" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1">
            <TabsTrigger value="all" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
              <span className="hidden sm:inline">All Questions</span>
              <span className="sm:hidden">All</span>
            </TabsTrigger>
            <TabsTrigger value="featured" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
              <span className="hidden sm:inline">Featured</span>
              <span className="sm:hidden">Featured</span>
            </TabsTrigger>
            <TabsTrigger value="recent" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
              <span className="hidden sm:inline">Recent</span>
              <span className="sm:hidden">Recent</span>
            </TabsTrigger>
            <TabsTrigger value="popular" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
              <span className="hidden sm:inline">Popular</span>
              <span className="sm:hidden">Popular</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {communities.map((community) => (
                <Card key={community._id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(community.createdAt ?? community._createdAt), { addSuffix: true })}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">0 views</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                        <AvatarImage src={community.moderator.imageURL} />
                        <AvatarFallback>{community.moderator.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Link href={`/community-questions/${community.slug}`}>
                          <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 hover:text-blue-600 transition-colors">
                            {community.title}
                          </h3>
                        </Link>
                        {community.description && (
                          <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                            {community.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {community.moderator.username}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                            <Link href={`/community-questions/${community.slug}`}>
                              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="featured" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {featuredCommunities.map((community) => (
                <Card key={community._id} className="hover:shadow-md transition-shadow border-2 border-yellow-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="default" className="text-xs bg-yellow-100 text-yellow-800">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">0 views</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                        <AvatarImage src={community.moderator.imageURL} />
                        <AvatarFallback>{community.moderator.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Link href={`/community-questions/${community.slug}`}>
                          <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 hover:text-blue-600 transition-colors">
                            {community.title}
                          </h3>
                        </Link>
                        {community.description && (
                          <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                            {community.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {community.moderator.username}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                            <Link href={`/community-questions/${community.slug}`}>
                              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {recentCommunities.map((community) => (
                <Card key={community._id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(community.createdAt ?? community._createdAt), { addSuffix: true })}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">0 views</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                        <AvatarImage src={community.moderator.imageURL} />
                        <AvatarFallback>{community.moderator.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Link href={`/community-questions/${community.slug}`}>
                          <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 hover:text-blue-600 transition-colors">
                            {community.title}
                          </h3>
                        </Link>
                        {community.description && (
                          <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                            {community.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {community.moderator.username}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                            <Link href={`/community-questions/${community.slug}`}>
                              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="popular" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {popularCommunities.map((community) => (
                <Card key={community._id} className="hover:shadow-md transition-shadow border-2 border-orange-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="default" className="text-xs bg-orange-100 text-orange-800">
                        <Flame className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">0 views</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                        <AvatarImage src={community.moderator.imageURL} />
                        <AvatarFallback>{community.moderator.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Link href={`/community-questions/${community.slug}`}>
                          <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 hover:text-blue-600 transition-colors">
                            {community.title}
                          </h3>
                        </Link>
                        {community.description && (
                          <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                            {community.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {community.moderator.username}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                            <Link href={`/community-questions/${community.slug}`}>
                              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Empty State */}
        {communities.length === 0 && (
          <Card>
            <CardContent className="p-8 sm:p-12">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">No questions yet</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  Be the first to start a community discussion
                </p>
                {user && (
                  <CreateCommunityButton />
                )}
              </div>
            </CardContent>
          </Card>
        )}
        </QuestionsClient>
      </div>
    </div>
  );
} 