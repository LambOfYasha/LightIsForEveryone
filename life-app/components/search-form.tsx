"use client"

import * as React from "react"
import { Search, Filter, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

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

export function SearchForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = React.useState(searchParams.get("q") ?? "")
  const [searchType, setSearchType] = React.useState(searchParams.get("type") ?? "all")
  const [isSearching, setIsSearching] = React.useState(false)
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [showResults, setShowResults] = React.useState(false)
  const [debouncedQuery, setDebouncedQuery] = React.useState(query)

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Perform search when query changes
  React.useEffect(() => {
    if (debouncedQuery.trim().length === 0) {
      setResults([])
      setShowResults(false)
      return
    }

    const performSearch = async () => {
      setIsSearching(true)
      try {
        const params = new URLSearchParams({
          q: debouncedQuery,
          type: searchType,
          limit: '10'
        })

        const response = await fetch(`/api/search?${params}`)
        if (response.ok) {
          const data = await response.json()
          setResults(data.results || [])
          setShowResults(true)
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsSearching(false)
      }
    }

    performSearch()
  }, [debouncedQuery, searchType])

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (searchType !== "all") params.set("type", searchType)
    
    router.push(`/search?${params.toString()}`)
    setShowResults(false)
  }

  function clearSearch() {
    setQuery("")
    setSearchType("all")
    setResults([])
    setShowResults(false)
  }

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
        return '📝'
      case 'community':
        return '👥'
      case 'response':
        return '💬'
      case 'comment':
        return '💭'
      default:
        return '📄'
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
      return `${author} • Response to "${result.communityQuestion.title}" • ${formattedDate}`
    }
    
    if (result.searchType === 'comment' && result.post) {
      return `${author} • Comment on "${result.post.title}" • ${formattedDate}`
    }
    
    return `${author} • ${formattedDate}`
  }

  return (
    <div className="relative w-full max-w-sm">
      <form onSubmit={onSubmit} className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search blogs, communities, responses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowResults(true)}
            className="pl-8"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-6 w-6 p-0"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Search Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium">Search Type</label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger>
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
          </SheetContent>
        </Sheet>
        
        <Button type="submit" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (results.length > 0 || isSearching) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-muted-foreground">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={result._id}
                  onClick={() => {
                    router.push(getResultUrl(result))
                    setShowResults(false)
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">{getResultIcon(result.searchType)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {getResultTitle(result)}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {getResultSubtitle(result)}
                      </div>
                      {result.excerpt && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {result.excerpt}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              <div className="px-4 py-2 text-xs text-muted-foreground border-t">
                Press Enter to search all results
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  )
}
