'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProfileLink } from '@/components/ui/profile-link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, Calendar, User, MessageSquare, BookOpen, Users } from 'lucide-react'

interface SearchResult {
  _id: string;
  _type: string;
  searchType: 'blog' | 'community' | 'response' | 'comment';
  title?: string;
  content?: string;
  description?: string;
  excerpt?: string;
  slug?: string;
  author?: {
    _id: string;
    username: string;
    imageURL?: string;
  };
  moderator?: {
    _id: string;
    username: string;
    imageURL?: string;
  };
  communityQuestion?: {
    _id: string;
    title: string;
    slug: string;
  };
  createdAt?: string;
  publishedAt?: string;
  isApproved?: boolean;
  postType?: string;
  post?: { _id: string; title: string; slug: string };
}

export function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const type = searchParams.get('type') || 'all'
  const page = parseInt(searchParams.get('page') || '1')
  
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [currentType, setCurrentType] = useState(type)
  const [currentPage, setCurrentPage] = useState(page)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    const performSearch = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          q: query,
          type: currentType,
          limit: '20',
          page: currentPage.toString()
        })

        const response = await fetch(`/api/search?${params}`)
        if (response.ok) {
          const data = await response.json()
          setResults(data.results || [])
          setTotal(data.total || 0)
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }

    performSearch()
  }, [query, currentType, currentPage])

  const getResultUrl = (result: SearchResult) => {
    switch (result.searchType) {
      case 'blog':
        return `/blogs/${result.slug}`
      case 'community':
        return `/community-questions/${result.slug}`
      case 'response':
        return `/responses/${result.slug}`
      case 'comment':
        if (result.postType === 'community') {
          return `/community-questions/${result.post?.slug}#comment-${result._id}`
        } else {
          return `/blogs/${result.post?.slug}#comment-${result._id}`
        }
      default:
        return '/'
    }
  }

  const getResultIcon = (searchType: string) => {
    switch (searchType) {
      case 'blog':
        return <BookOpen className="h-4 w-4" />
      case 'community':
        return <Users className="h-4 w-4" />
      case 'response':
        return <MessageSquare className="h-4 w-4" />
      case 'comment':
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getResultBadge = (searchType: string) => {
    switch (searchType) {
      case 'blog':
        return <Badge variant="secondary">Blog</Badge>
      case 'community':
        return <Badge variant="secondary">Community</Badge>
      case 'response':
        return <Badge variant="secondary">Response</Badge>
      case 'comment':
        return <Badge variant="secondary">Comment</Badge>
      default:
        return null
    }
  }

  const getResultTitle = (result: SearchResult) => {
    if (result.title) return result.title
    if (result.content) return result.content.slice(0, 50) + '...'
    return 'Untitled'
  }

  const getResultSubtitle = (result: SearchResult) => {
    const author = result.author?.username || result.moderator?.username
    const date = result.createdAt || result.publishedAt
    const formattedDate = date ? new Date(date).toLocaleDateString() : ''
    
    if (result.searchType === 'response' && result.communityQuestion) {
      return `Response to "${result.communityQuestion.title}"`
    }
    
    if (result.searchType === 'comment' && result.post) {
      return `Comment on "${result.post.title}"`
    }
    
    return result.description || ''
  }

  const handleTypeChange = (newType: string) => {
    setCurrentType(newType)
    setCurrentPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  if (!query.trim()) {
    return (
      <div className="text-center py-12">
        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">No search query</h2>
        <p className="text-muted-foreground">Enter a search term to find content</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-muted rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">
            Search results for "{query}"
          </h2>
          <p className="text-muted-foreground">
            {total} result{total !== 1 ? 's' : ''} found
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={currentType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Content</SelectItem>
              <SelectItem value="blogs">Blogs Only</SelectItem>
              <SelectItem value="communities">Communities Only</SelectItem>
              <SelectItem value="responses">Responses Only</SelectItem>
              <SelectItem value="comments">Comments Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result) => (
            <Card key={result._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getResultIcon(result.searchType)}
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={getResultUrl(result)}
                        className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2"
                      >
                        {getResultTitle(result)}
                      </Link>
                    </div>
                  </div>
                  {getResultBadge(result.searchType)}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-3 line-clamp-2">
                  {getResultSubtitle(result)}
                </p>
                
                {result.excerpt && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {result.excerpt}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <ProfileLink 
                      userId={result.author?._id || result.moderator?._id || ''}
                      username={result.author?.username || result.moderator?.username || ''}
                    >
                      {result.author?.username || result.moderator?.username}
                    </ProfileLink>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(result.createdAt || result.publishedAt || '').toLocaleDateString()}
                    </span>
                  </div>
                  {result.isApproved && (
                    <Badge variant="outline" className="text-xs">
                      Approved
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {Math.ceil(total / 20)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= Math.ceil(total / 20)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
} 