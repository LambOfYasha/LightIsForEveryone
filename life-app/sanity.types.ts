import type { PortableTextBlock } from 'sanity'

export interface Reference {
  _type: 'reference'
  _ref: string
  _weak?: boolean
}

export interface SanityDocument {
  _id: string
  _type: string
  _createdAt: string
  _updatedAt: string
  _rev: string
}

export interface User extends SanityDocument {
  _type: 'user'
  id: string
  username: string
  email: string
  imageURL?: string
  role: 'guest' | 'user' | 'admin' | 'moderator' | 'teacher' | 'junior_teacher' | 'senior_teacher' | 'lead_teacher' | 'dev'
  joinedAt: string
  isActive: boolean
  lastActive?: string
  postCount: number
  commentCount: number
  reportCount: number
  isReported: boolean
  isDeleted: boolean
  deletedAt?: string
  deletedBy?: string
  bio?: string
  preferences?: {
    notifications?: {
      email: boolean
      push: boolean
    }
    privacy?: {
      profileVisible: boolean
      activityVisible: boolean
    }
  }
  settings?: {
    notifications?: {
      email: boolean
      push: boolean
      moderation: boolean
      community: boolean
      marketing: boolean
    }
    privacy?: {
      profileVisibility: 'public' | 'friends' | 'private'
      activityStatus: boolean
      contentVisibility: 'public' | 'friends' | 'private'
      dataCollection: boolean
    }
    appearance?: {
      theme: 'light' | 'dark' | 'system'
      fontSize: 'small' | 'medium' | 'large'
      compactMode: boolean
      reducedMotion: boolean
    }
  }
  blog?: Reference
  communityQuestion?: Reference
  teacherRole?: 'teacher' | 'junior_teacher' | 'senior_teacher' | 'lead_teacher'
  specializations?: string[]
  qualifications?: string[]
  experience?: number
  rating?: number
  totalStudents?: number
  coursesCreated?: number
}

export interface Teacher extends SanityDocument {
  _type: 'teacher'
  id: string
  username: string
  email: string
  imageURL?: string
  role: 'teacher' | 'junior_teacher' | 'senior_teacher' | 'lead_teacher'
  specializations?: string[]
  joinedAt: string
  isReported: boolean
}

export interface Blog extends SanityDocument {
  _type: 'blog'
  tags?: Reference[]
  title: string
  description?: string
  content: string | PortableTextBlock[]
  slug: {
    _type?: 'slug'
    current: string
  }
  author: {
    _ref: string
    _type: 'reference'
  }
  image?: {
    _type: 'image'
    asset: {
      _ref: string
      _type: 'reference'
    }
  }
  createdAt: string
  updatedAt?: string
  viewCount?: number
}

export interface Page extends SanityDocument {
  _type: 'page'
  title: string
  description?: string
  content: string | PortableTextBlock[]
  slug: {
    _type?: 'slug'
    current: string
  }
  isPublished: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CommunityQuestion extends SanityDocument {
  _type: 'communityQuestion'
  title: string
  description?: string
  slug: {
    _type?: 'slug'
    current: string
  }
  moderator: {
    _ref: string
    _type: 'reference'
  }
  image?: {
    _type: 'image'
    asset: {
      _ref: string
      _type: 'reference'
    }
  }
  createdAt: string
  updatedAt?: string
}

export interface Post extends SanityDocument {
  _type: 'post'
  title: string
  body: PortableTextBlock[]
  slug: {
    _type?: 'slug'
    current: string
  }
  author: {
    _ref: string
    _type: 'reference'
  }
  communityQuestion: {
    _ref: string
    _type: 'reference'
  }
  publishedAt: string
  isApproved: boolean
  approvedBy?: {
    _ref: string
    _type: 'reference'
  }
  approvedAt?: string
}

export interface Comment extends SanityDocument {
  _type: 'comment'
  content: string
  author: {
    _ref: string
    _type: 'reference'
  }
  post: {
    _ref: string
    _type: 'reference'
  }
  postType: 'community' | 'blog'
  parentCommentId?: string
  createdAt: string
  updatedAt?: string
}

export interface EmbeddedComment extends SanityDocument {
  _type: 'embeddedComment'
  content: string
  author: {
    _ref: string
    _type: 'reference'
  }
  post: {
    _ref: string
    _type: 'reference'
  }
  postType: 'community' | 'blog'
  parentCommentId?: string
  createdAt: string
  updatedAt?: string
}

export interface Favorite extends SanityDocument {
  _type: 'favorite'
  user: {
    _ref: string
    _type: 'reference'
  }
  post: {
    _ref: string
    _type: 'reference'
  }
  postType: 'community' | 'blog'
  createdAt: string
}

export interface Tag extends SanityDocument {
  _type: 'tag'
  name: string
  description?: string
  color?: string
}

export interface Report extends SanityDocument {
  _type: 'report'
  reporter: {
    _ref: string
    _type: 'reference'
  }
  reportedContent: {
    _ref: string
    _type: 'reference'
  }
  contentType: 'post' | 'comment' | 'blog' | 'communityQuestion' | 'user' | 'teacher'
  reason: 'inappropriate' | 'spam' | 'harassment' | 'misinformation' | 'copyright' | 'violence' | 'hate_speech' | 'other'
  description?: string
  status: 'pending' | 'investigating' | 'resolved_removed' | 'resolved_warning' | 'resolved_no_action' | 'dismissed'
  reviewedBy?: {
    _ref: string
    _type: 'reference'
  }
  reviewedAt?: string
  reviewNotes?: string
  actionTaken?: 'none' | 'removed' | 'warned' | 'suspended' | 'banned'
  createdAt: string
  updatedAt?: string
}

// Reference types for GROQ queries
export interface UserReference {
  _id: string
  username: string
  imageURL?: string
}

export interface TeacherReference {
  _id: string
  username: string
  imageURL?: string
}

export interface BlogReference {
  _id: string
  title: string
  slug: {
    _type?: 'slug'
    current: string
  }
}

export interface CommunityQuestionReference {
  _id: string
  title: string
  slug: {
    _type?: 'slug'
    current: string
  }
}

export interface PostReference {
  _id: string
  title: string
  slug: {
    _type?: 'slug'
    current: string
  }
}

export interface CommentReference {
  _id: string
  content: string
}

// Extended types for API responses
export interface BlogWithAuthor extends Omit<Blog, 'author'> {
  author: UserReference
}

export interface CommunityQuestionWithModerator extends Omit<CommunityQuestion, 'moderator'> {
  moderator: UserReference | TeacherReference
}

export interface PostWithAuthor extends Omit<Post, 'author' | 'communityQuestion' | 'approvedBy'> {
  author: UserReference
  communityQuestion: CommunityQuestionReference
  approvedBy?: UserReference | TeacherReference
}

export interface CommentWithAuthor extends Omit<Comment, 'author' | 'post'> {
  author: UserReference
  post: PostReference | BlogReference
}

export interface ReportWithDetails extends Omit<Report, 'reporter' | 'reportedContent' | 'reviewedBy'> {
  reporter: UserReference | TeacherReference
  reportedContent: PostReference | CommentReference | BlogReference | CommunityQuestionReference | UserReference | TeacherReference
  reviewedBy?: UserReference | TeacherReference
}
