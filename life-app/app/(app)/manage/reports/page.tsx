'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Flag, AlertTriangle, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Report {
  _id: string
  reason: string
  description: string
  status: string
  contentType: string
  createdAt: string
  updatedAt?: string
  reporter: {
    _id: string
    username: string
    imageURL?: string
  }
  reportedContent: {
    _id: string
    _type: string
    title?: string
    content?: string
    slug?: string
  }
  reviewedBy?: {
    _id: string
    username: string
  }
  reviewedAt?: string
  reviewNotes?: string
  actionTaken?: string
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [contentTypeFilter, setContentTypeFilter] = useState('all')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewStatus, setReviewStatus] = useState('')
  const [reviewNotes, setReviewNotes] = useState('')
  const [actionTaken, setActionTaken] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  console.log('Admin reports page: Component rendered with state:', {
    reportsCount: reports.length,
    loading,
    statusFilter,
    contentTypeFilter
  })

  useEffect(() => {
    console.log('Admin reports page: useEffect triggered with filters:', { statusFilter, contentTypeFilter })
    fetchReports()
  }, [statusFilter, contentTypeFilter])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (contentTypeFilter !== 'all') params.set('contentType', contentTypeFilter)
      params.set('limit', '100')

      console.log('Admin reports page: Fetching reports with params:', params.toString())
      const response = await fetch(`/api/reports?${params}`)
      console.log('Admin reports page: Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Admin reports page: Received data:', data)
        console.log('Admin reports page: Reports array:', data.reports)
        console.log('Admin reports page: Number of reports:', data.reports?.length || 0)
        setReports(data.reports || [])
      } else {
        const errorData = await response.json()
        console.error('Admin reports page: Error response:', errorData)
        console.error('Admin reports page: Response status:', response.status)
        console.error('Admin reports page: Response headers:', Object.fromEntries(response.headers.entries()))
        toast({
          title: "Error",
          description: `Failed to fetch reports: ${errorData.error || 'Unknown error'} (Status: ${response.status})`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Admin reports page: Fetch error:', error)
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async () => {
    if (!selectedReport || !reviewStatus) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/reports/${selectedReport._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: reviewStatus,
          reviewNotes,
          actionTaken,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Report status updated successfully",
        })
        setReviewDialogOpen(false)
        setSelectedReport(null)
        setReviewStatus('')
        setReviewNotes('')
        setActionTaken('')
        fetchReports()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update report",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'investigating':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />
      case 'resolved_removed':
      case 'resolved_warning':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'dismissed':
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Flag className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary' as const },
      investigating: { label: 'Investigating', variant: 'default' as const },
      resolved_removed: { label: 'Resolved - Removed', variant: 'destructive' as const },
      resolved_warning: { label: 'Resolved - Warning', variant: 'default' as const },
      resolved_no_action: { label: 'Resolved - No Action', variant: 'secondary' as const },
      dismissed: { label: 'Dismissed', variant: 'outline' as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'post': return 'Community Response'
      case 'comment': return 'Comment'
      case 'blog': return 'Blog Post'
      case 'communityQuestion': return 'Community Question'
      case 'user': return 'User'
      case 'teacher': return 'Teacher'
      default: return type
    }
  }

  const getContentUrl = (content: any) => {
    if (!content?.slug) return '#'
    
    switch (content._type) {
      case 'post':
        return `/responses/${content.slug}`
      case 'comment':
        return `#comment-${content._id}`
      case 'blog':
        return `/blogs/${content.slug}`
      case 'communityQuestion':
        return `/community-questions/${content.slug}`
      default:
        return '#'
    }
  }

  if (loading) {
    console.log('Admin reports page: Rendering loading state')
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Reports</h1>
          <div className="space-y-4">
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
        </div>
      </div>
    )
  }

  console.log('Admin reports page: Rendering main content with reports:', reports.length)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Reports</h1>
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved_removed">Resolved - Removed</SelectItem>
                <SelectItem value="resolved_warning">Resolved - Warning</SelectItem>
                <SelectItem value="resolved_no_action">Resolved - No Action</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Content</SelectItem>
                <SelectItem value="post">Responses</SelectItem>
                <SelectItem value="comment">Comments</SelectItem>
                <SelectItem value="blog">Blogs</SelectItem>
                <SelectItem value="communityQuestion">Communities</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="teacher">Teachers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reports found</h3>
              <p className="text-muted-foreground">
                {statusFilter !== 'all' || contentTypeFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'All reports have been reviewed'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(report.status)}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{report.reason}</h3>
                          {getStatusBadge(report.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Reported by {report.reporter.username} • {getContentTypeLabel(report.contentType)} • {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReport(report)
                        setReviewStatus(report.status)
                        setReviewNotes(report.reviewNotes || '')
                        setActionTaken(report.actionTaken || '')
                        setReviewDialogOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {report.description && (
                    <p className="text-sm mb-3">{report.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Content: {report.reportedContent.title || report.reportedContent.content?.slice(0, 50) || 'Untitled'}</span>
                    {report.reviewedBy && (
                      <span>Reviewed by: {report.reviewedBy.username}</span>
                    )}
                    {report.reviewedAt && (
                      <span>Reviewed: {new Date(report.reviewedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Report</DialogTitle>
              <DialogDescription>
                Update the status and add review notes for this report.
              </DialogDescription>
            </DialogHeader>
            
            {selectedReport && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Reporter</label>
                    <p className="text-sm text-muted-foreground">{selectedReport.reporter.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Content Type</label>
                    <p className="text-sm text-muted-foreground">{getContentTypeLabel(selectedReport.contentType)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reason</label>
                    <p className="text-sm text-muted-foreground">{selectedReport.reason}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reported At</label>
                    <p className="text-sm text-muted-foreground">{new Date(selectedReport.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedReport.description && (
                  <div>
                    <label className="text-sm font-medium">Report Description</label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedReport.description}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Content</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedReport.reportedContent.title || selectedReport.reportedContent.content?.slice(0, 100) || 'No content available'}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select value={reviewStatus} onValueChange={setReviewStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending Review</SelectItem>
                        <SelectItem value="investigating">Under Investigation</SelectItem>
                        <SelectItem value="resolved_removed">Resolved - Content Removed</SelectItem>
                        <SelectItem value="resolved_warning">Resolved - Warning Issued</SelectItem>
                        <SelectItem value="resolved_no_action">Resolved - No Action</SelectItem>
                        <SelectItem value="dismissed">Dismissed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Action Taken</label>
                    <Select value={actionTaken} onValueChange={setActionTaken}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Action</SelectItem>
                        <SelectItem value="removed">Content Removed</SelectItem>
                        <SelectItem value="warned">User Warned</SelectItem>
                        <SelectItem value="suspended">User Suspended</SelectItem>
                        <SelectItem value="banned">User Banned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Review Notes</label>
                    <Textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add notes about your review decision..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setReviewDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReview}
                disabled={isSubmitting || !reviewStatus}
              >
                {isSubmitting ? "Updating..." : "Update Report"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 