import type { Metadata } from "next";
import { adminClient } from "@/sanity/lib/adminClient";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { defineQuery } from "groq";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  User, 
  MessageSquare, 
  ArrowLeft,
  Eye,
  CheckCircle,
  Clock,
  ThumbsUp
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth/middleware";
import EditResponseButton from "@/components/ui/edit-response-button";
import DeleteResponseButton from "@/components/ui/delete-response-button";
import ApproveResponseButton from "@/components/ui/approve-response-button";
import EmbeddedCommentSectionWrapper from "@/components/comments/EmbeddedCommentSectionWrapper";
import FavoriteButton from "@/components/ui/favorite-button";
import { getImageUrl } from "@/lib/utils";
import { ReportButton } from "@/components/ui/report-button";
import { ProfileLink } from "@/components/ui/profile-link";
import RichContentRenderer from "@/components/ui/rich-content-renderer";
import { canEditContent, canDeleteContent } from "@/lib/auth/roles";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

interface Response {
  _id: string;
  title: string;
  slug?: {
    current: string;
  };
  body: string | any[];
  author: {
    _id: string;
    username: string;
    imageURL?: string;
    role: string;
  };
  communityQuestion: {
    _id: string;
    title: string;
    slug?: { current: string };
  };
  isApproved: boolean;
  approvedBy?: {
    _id: string;
    username: string;
    role: string;
  };
  approvedAt?: string;
  publishedAt: string;
  image?: {
    asset: {
      url: string;
    };
    alt?: string;
  };
}

const responseQuery = defineQuery(`
  *[_type == "post" && isDeleted == false && (_id == $slug || (defined(slug) && slug.current == $slug))][0] {
    _id,
    title,
    slug,
    body,
    author->{
      _id,
      username,
      imageURL,
      role
    },
    communityQuestion->{
      _id,
      title,
      slug
    },
    isApproved,
    approvedBy->{
      _id,
      username,
      role
    },
    approvedAt,
    publishedAt,
    image {
      asset->{
        url
      },
      alt
    }
  }
`);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const response: Response = await adminClient.fetch(responseQuery, { slug: resolvedParams.slug });
    
    if (!response) {
      return {
        title: 'Response Not Found',
      };
    }

    return {
      title: `${response.title} - Community Response`,
      description: `Community response by ${response.author.username}`,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Response Not Found',
    };
  }
}

export default async function ResponsePage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  const resolvedParams = await params;
  
  console.log('Looking for response with slug/ID:', resolvedParams.slug);
  
  let response: Response;
  try {
    // Try with adminClient first for debugging
    response = await adminClient.fetch(responseQuery, { slug: resolvedParams.slug });
    console.log('Query result:', response);
  } catch (error) {
    console.error('Error fetching response with adminClient:', error);
    // Fallback to sanityFetch
    try {
      response = await client.fetch(responseQuery, { slug: resolvedParams.slug });
      console.log('Query result with sanityFetch:', response);
    } catch (fallbackError) {
      console.error('Error fetching response with sanityFetch:', fallbackError);
      notFound();
    }
  }

  if (!response) {
    console.log('Response not found for slug:', resolvedParams.slug);
    notFound();
  }

  // Ensure all required fields exist
  if (!response._id || !response.title || !response.author) {
    console.error('Response missing required fields:', response);
    notFound();
  }

  const canApprove = user && (user.role === 'admin' || user.role === 'senior_teacher' || user.role === 'lead_teacher');
  
  const canEdit = (response: any) => {
      if (!user) return false;
      
      // Guests cannot edit
      if (user.role === 'guest') return false;
      
      const isOwnContent = user._id === response.author._id;
      return canEditContent(user.role, isOwnContent);
  };
  
  const canDelete = (response: any) => {
      if (!user) return false;
      
      // Guests cannot delete
      if (user.role === 'guest') return false;
      
      const isOwnContent = user._id === response.author._id;
      return canDeleteContent(user.role, isOwnContent);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <Link href="/" className="hover:text-gray-900">Home</Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/community-questions" className="hover:text-gray-900">Community Questions</Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/community-questions/${response.communityQuestion.slug?.current || response.communityQuestion._id}`} className="hover:text-gray-900">
              {response.communityQuestion.title}
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">{response.title}</li>
        </ol>
      </nav>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={response.isApproved ? "default" : "secondary"}>
                    {response.isApproved ? "Approved" : "Pending Approval"}
                  </Badge>
                  {response.isApproved && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      Teacher Approved
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl font-bold">{response.title}</CardTitle>
                <p className="text-gray-600 mt-2">
                  Response to: <Link href={`/community-questions/${response.communityQuestion.slug?.current || response.communityQuestion._id}`} className="text-blue-600 hover:underline">
                    {response.communityQuestion.title}
                  </Link>
                </p>
              </div>
              <div className="flex items-center gap-2">
                {user && (
                  <FavoriteButton 
                    postId={response._id}
                    postType="response"
                    size="sm"
                    variant="outline"
                  />
                )}
                {canApprove && (
                  <ApproveResponseButton
                    responseId={response._id}
                    isApproved={response.isApproved}
                    size="sm"
                    variant="outline"
                  />
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Author Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                {response.author.imageURL && getImageUrl(response.author.imageURL) ? (
                  <AvatarImage 
                    src={getImageUrl(response.author.imageURL)!} 
                    alt={response.author.username}
                  />
                ) : null}
                <AvatarFallback>
                  {response.author.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <ProfileLink 
                    userId={response.author._id}
                    username={response.author.username} 
                    className="font-semibold"
                  >
                    {response.author.username}
                  </ProfileLink>
                  <Badge variant="outline" className="text-xs">
                    {response.author.role}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDistanceToNow(new Date(response.publishedAt), { addSuffix: true })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    Response
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Content */}
        <Card>
          <CardContent className="p-6">
            {response.image && (
              <div className="mb-6">
                <img 
                  src={response.image.asset.url} 
                  alt={response.image.alt || response.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
            
            <div className="prose max-w-none">
              <RichContentRenderer 
                content={response.body}
                stripThemeConflictingInlineStyles
              />
            </div>
          </CardContent>
        </Card>

        {/* Approval Info */}
        {response.isApproved && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <ThumbsUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-800">Approved by {response.approvedBy?.username}</p>
                  <p className="text-sm text-gray-600">
                    {formatDistanceToNow(new Date(response.approvedAt!), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link href={`/community-questions/${response.communityQuestion.slug?.current || response.communityQuestion._id}`}>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    View Original Question
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-2">
                {canEdit(response) && (
                  <EditResponseButton
                    responseId={response._id}
                    currentTitle={response.title}
                    currentBody={response.body}
                    size="sm"
                    variant="outline"
                  />
                )}
                {canDelete(response) && (
                  <DeleteResponseButton
                    responseId={response._id}
                    responseTitle={response.title}
                    size="sm"
                    variant="outline"
                  />
                )}
                {canApprove && (
                  <ApproveResponseButton
                    responseId={response._id}
                    isApproved={response.isApproved}
                    size="sm"
                  />
                )}
                <ReportButton
                  contentId={response._id}
                  contentType="post"
                  contentTitle={response.title}
                  size="sm"
                  variant="outline"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 