# Light Is For Everyone — Project Overview

A Christian community platform for asking questions, sharing blogs, and growing spiritually together. Built with **Next.js 15** (App Router), **Sanity CMS**, **Clerk** authentication, and **TailwindCSS**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router), React 19 |
| **Language** | TypeScript |
| **Database / CMS** | Sanity CMS (GROQ queries, no SQL) |
| **Authentication** | Clerk (`@clerk/nextjs`) |
| **AI / Moderation** | OpenAI GPT-4 (text + vision) |
| **Styling** | TailwindCSS, Radix UI, shadcn/ui |
| **Rich Text Editor** | TipTap (`@tiptap/react` + extensions) |
| **Icons** | Lucide React |
| **Deployment** | Vercel |
| **Webhooks** | Svix (Clerk webhook verification) |

---

## Project Structure

```
life-app/
├── app/
│   ├── (admin)/studio/          # Sanity Studio (CMS admin)
│   ├── (app)/                   # Main application routes
│   │   ├── page.tsx             # Home page
│   │   ├── layout.tsx           # App shell (Clerk + Sidebar + Header + Footer)
│   │   ├── about/               # About page
│   │   ├── admin/               # Admin dashboard & tools
│   │   ├── blogs/               # Blog listing & detail pages
│   │   ├── community-questions/ # Community Q&A pages
│   │   ├── dashboard/           # User dashboard & settings
│   │   ├── feedback/            # Feedback page
│   │   ├── help/                # Help / support
│   │   ├── members/             # Members directory
│   │   ├── profile/             # User profiles
│   │   ├── responses/           # Response detail pages
│   │   ├── search/              # Search results
│   │   ├── sign-in/ & sign-up/  # Auth pages (Clerk)
│   │   ├── staff/               # Staff directory
│   │   ├── tags/                # Tag browsing & filtering
│   │   └── ...                  # FAQ, guidelines, privacy, terms, etc.
│   ├── api/                     # API routes
│   │   ├── admin/               # Admin endpoints (roles, users, settings, stats)
│   │   ├── appeals/             # Moderation appeal endpoints
│   │   ├── blogs/               # Blog CRUD
│   │   ├── comments/            # Comment endpoints (incl. guest)
│   │   ├── communities/         # Community endpoints (incl. guest)
│   │   ├── guidelines/          # Custom moderation guidelines
│   │   ├── moderation/          # AI content moderation + image moderation
│   │   ├── reports/             # Content report endpoints
│   │   ├── search/              # Search API
│   │   ├── tags/                # Tag management
│   │   ├── user/                # User management (incl. guest creation)
│   │   ├── verse-of-the-day/    # Daily verse feature
│   │   └── webhooks/clerk/      # Clerk webhook handler (syncs users to Sanity)
│   ├── globals.css              # Global styles
│   ├── themes.css               # Theme variables
│   └── layout.tsx               # Root HTML layout
├── action/                      # Server Actions (Next.js)
│   ├── comments.ts              # Comment CRUD
│   ├── communityActions.ts      # Community CRUD
│   ├── createBlog.ts / editBlog.ts / deleteBlog.ts
│   ├── embeddedComments.ts      # Embedded comment system
│   ├── favoriteActions.ts       # Favorites
│   ├── feedbackActions.ts       # Feedback submissions
│   ├── guidelineActions.ts      # Custom guideline management
│   ├── helpActions.ts           # Help ticket system
│   ├── notificationActions.ts   # Notification CRUD
│   ├── postActions.ts           # Post/response CRUD
│   ├── profileActions.ts        # Profile updates
│   ├── reportActions.ts         # Content reporting
│   ├── settingsActions.ts       # User settings
│   ├── teacherActions.ts        # Teacher profile management
│   └── userActions.ts           # User management
├── components/
│   ├── admin/                   # Admin dashboard components (15 files)
│   ├── auth/                    # Auth-related UI
│   ├── blog/                    # Blog rendering components
│   ├── comments/                # Comment threads, guest comment forms
│   ├── community/               # Community Q&A components, guest creation
│   ├── header/                  # Top navigation bar (5 files)
│   ├── profile/                 # User profile components
│   ├── ui/                      # shadcn/ui primitives + custom components (54 files)
│   │   ├── rich-text-editor.tsx / simple-rich-editor.tsx  # TipTap editors
│   │   ├── rich-content-renderer.tsx                      # Secure HTML renderer
│   │   ├── moderation-feedback.tsx                        # AI moderation UI
│   │   ├── appeal-button.tsx                              # Moderation appeal UI
│   │   ├── report-button.tsx                              # Content reporting UI
│   │   ├── favorite-button.tsx                            # Favorites toggle
│   │   ├── responsive-*.tsx                               # Responsive utility components
│   │   ├── sidebar.tsx                                    # Main sidebar
│   │   └── ...                                            # Buttons, dialogs, cards, etc.
│   ├── app-sidebar.tsx          # Application sidebar navigation
│   ├── mobile-sidebar.tsx       # Mobile slide-out sidebar
│   ├── search-form.tsx          # Search component
│   └── settings-form.tsx        # User settings form
├── contexts/
│   └── settings-context.tsx     # User settings React context
├── hooks/
│   ├── use-compact-mode.ts      # Compact UI mode
│   ├── use-mobile.ts            # Mobile detection
│   ├── use-responsive.ts        # Comprehensive responsive detection
│   ├── use-toast.ts             # Toast notifications
│   ├── useModeration.ts         # AI moderation hook (debounced)
│   └── useRole.ts               # Role-based access hook
├── lib/
│   ├── auth/                    # Auth utilities
│   │   ├── roles.ts             # Role definitions & permissions
│   │   ├── assignRole.ts        # Role assignment
│   │   ├── makeAdmin.ts         # Admin promotion
│   │   └── middleware.ts        # Auth middleware helpers
│   ├── ai/                      # AI / Moderation services
│   │   ├── moderation.ts        # Core moderation prompts & guidelines
│   │   ├── moderationService.ts # GPT-4 moderation service + fallback
│   │   ├── devModeration.ts     # Dev-mode moderation (no API calls)
│   │   ├── imageModeration.ts   # GPT-4 Vision image moderation
│   │   ├── appealSystem.ts      # Appeal creation & processing
│   │   ├── analyticsService.ts  # Moderation analytics
│   │   ├── bulkOperations.ts    # Batch moderation processing
│   │   ├── customGuidelines.ts  # Custom moderation rules engine
│   │   ├── notificationsService.ts # Notification service
│   │   └── reportingService.ts  # Advanced reporting & export
│   ├── user/                    # User data services
│   │   ├── addUser.ts           # User creation (incl. guest)
│   │   ├── getUser.ts           # User fetching
│   │   ├── userService.ts       # Core user service
│   │   ├── getUserDashboardData.ts / getUserAnalytics.ts / getUserStats.ts
│   │   ├── getUserCommunities.ts / getUserFavorites.ts / getUserPosts.ts
│   │   └── ...
│   ├── utils.ts                 # Shared utilities (cn, etc.)
│   └── baseUrl.ts               # Base URL helper
├── sanity/
│   ├── schemaTypes/             # Sanity document schemas (17 types)
│   │   ├── userType.tsx         # Users (incl. guest role)
│   │   ├── blogType.tsx         # Blog posts
│   │   ├── communityType.tsx    # Community questions
│   │   ├── postType.tsx         # Responses/posts
│   │   ├── commentType.tsx      # Comments
│   │   ├── embeddedCommentType.tsx # Embedded comments
│   │   ├── reportType.tsx       # Content reports
│   │   ├── feedbackType.tsx     # User feedback
│   │   ├── helpTicketType.tsx   # Help tickets
│   │   ├── notificationType.tsx # Notifications
│   │   ├── favoriteType.tsx     # Favorites
│   │   ├── tagType.tsx          # Tags
│   │   ├── teacherType.tsx      # Teacher profiles
│   │   ├── guestQuestionType.tsx # Guest questions
│   │   ├── specialtyType.tsx    # Teacher specialties
│   │   └── adminSettingsType.tsx # Admin settings
│   ├── lib/
│   │   ├── client.ts            # Read-only Sanity client
│   │   ├── adminClient.ts       # Write-capable Sanity client (API token)
│   │   ├── live.ts              # Sanity Live (stubbed — not active)
│   │   ├── image.ts             # Image URL builder
│   │   ├── notifications.ts     # Notification queries
│   │   ├── blogs/               # Blog GROQ queries (5 files)
│   │   └── communties/          # Community GROQ queries (3 files)
│   ├── env.ts                   # Sanity environment config
│   └── structure.ts             # Sanity Studio structure
├── middleware.ts                 # Clerk auth middleware (route protection)
├── sanity.config.ts             # Sanity Studio configuration
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── vercel.json                  # Vercel deployment config
└── package.json                 # Dependencies & scripts
```

---

## Authentication (Clerk)

All authentication is handled by **Clerk** (`@clerk/nextjs`).

### Route Protection
- `middleware.ts` uses `clerkMiddleware` to protect `/dashboard`, `/admin`, and most `/api/*` routes.
- Guest-accessible public API routes: `/api/user/guest`, `/api/comments/guest`, `/api/communities/guest`, `/api/moderation`.
- Unauthenticated users hitting protected routes are redirected to `/sign-in`.

### Role System
Defined in `lib/auth/roles.ts` with the following roles (lowest to highest privilege):
- **guest** — Can view content, comment with a guest name, create community questions, search, and report content. Cannot favorite, edit/delete, or access dashboard/admin.
- **member** — Standard authenticated user.
- **teacher** — Can create community responses (reserved for teachers).
- **admin** — Full platform access, user management, moderation tools.

### Key Files
- `lib/auth/roles.ts` — Role definitions, permissions, and hierarchy.
- `lib/auth/assignRole.ts` — Role assignment logic.
- `lib/auth/makeAdmin.ts` — Admin promotion.
- `lib/auth/middleware.ts` — Server-side auth helpers (`getCurrentUser()`).
- `hooks/useRole.ts` — Client-side role detection hook.
- `app/api/webhooks/clerk/route.ts` — Clerk webhook that syncs user events into Sanity.

### Guest Role
Unauthenticated users get a guest experience:
- Temporary guest accounts created in Sanity via `lib/user/addUser.ts` → `createGuestUser()`.
- Dedicated API endpoints: `/api/user/guest`, `/api/comments/guest`, `/api/communities/guest`.
- UI components: `GuestCommentForm`, `GuestCreateCommunityButton`.
- Favorite buttons are hidden for guests; dashboard/admin access is blocked.
- All guest content goes through the same AI moderation as authenticated users.

---

## Database (Sanity CMS)

All data is stored in **Sanity CMS**. There is no SQL or NoSQL database — all queries use **GROQ** against Sanity's content lake.

### Clients
- `sanity/lib/client.ts` — Read-only client (public, no token).
- `sanity/lib/adminClient.ts` — Write-capable client (uses `SANITY_ADMIN_API_TOKEN`).

### Data Model (17 Schema Types)
| Schema | Purpose |
|---|---|
| `user` | User profiles (member, teacher, admin, guest roles) |
| `blog` | Blog posts |
| `community` | Community questions |
| `post` | Responses to community questions |
| `comment` | Comments on content |
| `embeddedComment` | Inline/embedded comments |
| `report` | Content reports |
| `feedback` | User feedback submissions |
| `helpTicket` | Help/support tickets |
| `notification` | In-app notifications |
| `favorite` | Saved/favorited content |
| `tag` | Content tags |
| `teacher` | Teacher profiles & specialties |
| `guestQuestion` | Questions from guest users |
| `specialty` | Teacher specialty areas |
| `adminSettings` | Platform-wide admin settings |

### Query Helpers
- `sanity/lib/blogs/` — Blog-related GROQ queries (5 files).
- `sanity/lib/communties/` — Community-related GROQ queries (3 files).
- `sanity/lib/notifications.ts` — Notification queries.
- `lib/user/` — User data services (9 files): fetching, analytics, dashboard data, favorites, etc.

---

## Real-time / Sockets

**There are no WebSockets, Pusher, Ably, or any real-time push layer.** Sanity's Live Content API is stubbed out (`sanity/lib/live.ts` returns `null`). The app uses standard request/response data fetching.

---

## AI Moderation System

Content moderation is powered by **OpenAI GPT-4** and was built across four phases.

### Phase 1 — Core Text Moderation
- Real-time content analysis as users type (debounced via `hooks/useModeration.ts`).
- Three-tier decisions: **Allow**, **Flag** (needs review), **Block** (violates guidelines).
- Christian community-specific guidelines (respectful, edifying, biblically sound).
- API endpoint: `POST /api/moderation`.
- Integrated into: response forms, blog creation, community questions, comments.
- Fallback: keyword-based moderation when OpenAI is unavailable.
- Dev mode: `lib/ai/devModeration.ts` works without API calls using test phrases (`test inappropriate`, `test flag`, `test spam`, `test good`).

### Phase 2 — Image Moderation & Admin Dashboard
- **Image moderation** via GPT-4 Vision (`lib/ai/imageModeration.ts`, `POST /api/moderation/image`).
- **Admin moderation dashboard** (`app/(app)/admin/moderation/`) with pending review queue, decision history, and analytics.
- Comment moderation integration with real-time status indicators.

### Phase 3 — Appeals, Analytics & Bulk Operations
- **Appeal system** (`lib/ai/appealSystem.ts`, `/api/appeals`): users can appeal moderation decisions; admins review and process appeals.
- **Analytics dashboard** (`lib/ai/analyticsService.ts`, `app/(app)/admin/analytics/`): moderation metrics, content breakdown, performance tracking, trend analysis.
- **Bulk operations** (`lib/ai/bulkOperations.ts`): batch moderation with progress tracking, rate limiting, and error recovery.

### Phase 4 — Custom Guidelines, Notifications & Reporting
- **Custom guidelines engine** (`lib/ai/customGuidelines.ts`, `/api/guidelines`): dynamic rules with keywords, regex patterns, conditional logic, priority system, and performance tracking.
- **Notification service** (`lib/ai/notificationsService.ts`): templated notifications for moderation events, appeals, bulk ops, and system alerts.
- **Advanced reporting** (`lib/ai/reportingService.ts`): comprehensive reports with export to JSON, CSV, PDF, Excel; scheduled generation.
- **Advanced moderation dashboard** (`app/(app)/admin/advanced-moderation/`): unified interface for guidelines, notifications, reports, and settings.

### Moderation Architecture
```
User Input → useModeration hook → /api/moderation → GPT-4 Analysis → Allow/Flag/Block → UI Feedback
```

### Cost & Configuration
- GPT-4 text: ~$0.03/1K tokens (~$0.015–0.03 per moderation check).
- GPT-4 Vision: ~$0.01 per image.
- Customize: `lib/ai/moderation.ts` (guidelines), `hooks/useModeration.ts` (debounce), `components/ui/moderation-feedback.tsx` (UI).
- Environment: `OPENAI_API_KEY` required. Falls back to dev mode in development or when quota is exceeded.

---

## Rich Text Editor (TipTap)

A full-featured rich text editor built with **TipTap** (`@tiptap/react`).

### Components
- `components/ui/simple-rich-editor.tsx` — Main editor with toolbar.
- `components/ui/rich-text-editor.tsx` — Alternative editor implementation.
- `components/ui/rich-content-renderer.tsx` — Secure HTML renderer with XSS sanitization.

### Capabilities
- **Formatting**: Bold, italic, underline, strikethrough, highlight, sub/superscript.
- **Font controls**: Family, size, color (40+ color options).
- **Layout**: Text alignment, bullet/numbered lists, blockquotes, code blocks, horizontal rules.
- **Media**: Links, images (URL input), tables.
- **Special**: Spoiler/collapsible sections.

### Integration
Used in: AddResponseForm, EditResponseButton, CreateBlogButton, EditBlogButton, CommunityResponses, and response detail pages.

### Security
`RichContentRenderer` strips `<script>`, `<iframe>`, `javascript:` URIs, and inline event handlers before rendering.

---

## Responsive Design

Mobile-first approach using TailwindCSS responsive utilities.

### Breakpoints
- `sm`: 640px | `md`: 768px | `lg`: 1024px | `xl`: 1280px | `2xl`: 1536px

### Responsive Infrastructure
- `hooks/use-responsive.ts` — Device detection, breakpoint info, window size.
- `hooks/use-mobile.ts` — Simple boolean mobile check.
- `components/ui/responsive-container.tsx` — Adaptive container with max-width and padding props.
- `components/ui/responsive-card.tsx` — Cards with compact mobile mode.
- `components/ui/responsive-grid.tsx` — Grid with breakpoint-specific column counts.
- `components/ui/responsive-button.tsx` — Buttons with different text/icons for mobile vs. desktop.
- `components/mobile-sidebar.tsx` — Slide-out mobile sidebar.

### Key Patterns
- Typography scaling: `text-2xl sm:text-3xl md:text-4xl`
- Flex direction: `flex-col sm:flex-row`
- Grid columns: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Spacing: `p-4 sm:p-6`, `space-y-4 sm:space-y-6`
- Buttons: `w-full sm:w-auto`
- Touch targets: minimum 44px

### Pages with Full Responsive Coverage
Home, About, Dashboard (+ settings), Blogs (list + detail), Community Questions (list + detail), Search, Tags, Staff, Members, Profile, Responses, Unauthorized — all pages in the `(app)` directory.

---

## UI Layer

### App Shell
The `(app)/layout.tsx` wraps all app routes in:
1. `ClerkProvider` — Auth context.
2. `SettingsProvider` — User settings context.
3. `SidebarProvider` + `Sidebar` + `AppSidebar` — Collapsible navigation (hidden on mobile).
4. `Header` — Top navigation bar with mobile sidebar trigger.
5. `Footer` — Site footer.

### Component Library
~54 components in `components/ui/` built on shadcn/ui (Radix primitives):
- Dialogs, dropdowns, popovers, tooltips, sheets
- Cards, badges, avatars, buttons, inputs, selects, checkboxes, switches
- Tables, tabs, scroll areas, progress bars, skeletons
- Alert dialogs, alerts, breadcrumbs, separators, collapsibles

### Feature Components
- `components/admin/` — 15 admin panel components.
- `components/blog/` — Blog display components.
- `components/comments/` — Comment sections, nested comments, guest forms.
- `components/community/` — Community Q&A, response forms, guest creation.
- `components/header/` — Navigation, create buttons (blog, community).
- `components/profile/` — Profile display.

---

## Server Actions & API Routes

### Server Actions (`action/`)
30 files covering all CRUD operations: blogs, communities, posts, comments, embedded comments, favorites, feedback, help tickets, notifications, reports, settings, teacher profiles, user management, and moderation guidelines.

### API Routes (`app/api/`)
RESTful endpoints for: admin operations, appeals, blogs, comments, communities, guidelines, moderation (text + image), reports, search, tags, user management (incl. guest), verse-of-the-day, and Clerk webhooks.

---

## Environment Variables

```bash
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-07-05
SANITY_ADMIN_API_TOKEN=your_sanity_admin_token

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# OpenAI (AI Moderation)
OPENAI_API_KEY=your_openai_api_key

# Base URL
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

---

## Deployment (Vercel)

### Build & Deploy
```bash
pnpm run build       # Standard build
npm run build:prod   # Production build (ESLint disabled, type-check skipped; Windows shell only)
vercel --prod        # Deploy to Vercel
```

### Configuration
- `vercel.json` — Vercel deployment settings; wired for pnpm (`pnpm install --frozen-lockfile`, `pnpm run build`), with 30s `maxDuration` for `app/api/**` routes and global security headers.
- `next.config.ts` — Image optimization, compression, security headers, package import optimization.
- `.eslintrc.json` — ESLint set to warnings-only for builds.

### Line Endings
- The repo root `.gitattributes` enforces `* text=auto eol=lf` for all text files and marks common image/font/media files as binary. This overrides machine-level `core.autocrlf` settings so checkouts stay LF on Windows, macOS, and Linux.
- A root `.gitignore` excludes the local `.pnpm-store/` cache directory; `life-app/.gitignore` covers app-level artifacts (`.next/`, `.vercel`, env files, etc.).

### Post-Deployment Checklist
1. Set all environment variables in Vercel dashboard (Production + Preview + Development).
2. Configure Clerk webhook endpoint at `/api/webhooks/clerk`.
3. Configure allowed origins and redirect URLs in Clerk dashboard.
4. Verify Sanity project is accessible and content is published.
5. Test: sign-up/sign-in flow, blog/community CRUD, image uploads, AI moderation, admin dashboard.

### Resolved Build Issues
- Async params handling for Next.js 15 page routes and API routes.
- `UserRole` type mismatches in notification actions.
- `ModerationReport` literal type constraints.
- Sanity Studio `NextStudio` component configuration.
- Blog content type and `DeleteButton` props fixes.
- `RoleGuard` `hasPermission` function typing.
- Sanity schema generation integrated into build process.

---

## Troubleshooting

### OpenAI Quota Exceeded (429 Error)
The system automatically falls back to dev mode when:
- `NODE_ENV=development`
- No `OPENAI_API_KEY` is set
- OpenAI quota is exceeded

Test phrases in dev mode: `test inappropriate` (block), `test flag` (flag), `test spam` (flag), `test good` (allow).

### Build Failures
1. Check all environment variables are set.
2. Run `npx tsc --noEmit` to check TypeScript errors.
3. Verify Sanity project ID/dataset and Clerk configuration.

### Content Loading Issues
- Verify Sanity project ID and dataset in env vars.
- Check API token permissions.
- Ensure content is published (not draft) in Sanity Studio.

---

## Recent Updates & Fixes

> **Commit-ready summary:**
>
> feat: YouTube feed integration, lessons page, admin management overhaul, SSR localStorage fix, Vercel deployment setup
>
> - Add YouTube feed API (`api/youtube-feed/route.ts`) pulling latest videos from teacher channels via YouTube Data API v3
> - Add lessons page (`app/(app)/lessons/page.tsx`) with categorized video lessons and dynamic "New Videos" tab
> - Add "New Videos" section to home page with teacher channel attribution
> - Add `youtubeChannelId` field to `teacherType` and `userType` Sanity schemas
> - Add `instrumentation.ts` to delete broken Node.js 25 `localStorage` global during SSR
> - Guard all `localStorage` calls with `typeof window !== 'undefined'` in `settings-context.tsx` and `simple-notification-icon.tsx`
> - Add `teacherActions.ts` server actions (CRUD, stats, specializations, bulk ops, profile updates)
> - Add `userActions.ts` server actions (CRUD, stats, role management, bulk ops, profile updates)
> - Add shared admin management component (`shared-management.tsx`) with reusable table/filter/dialog UI
> - Refactor `teacher-management.tsx` and `user-management.tsx` to use shared management component
> - Update `userType.tsx` schema: add `dev` role, `isDeleted`/`deletedAt`/`deletedBy` soft-delete fields
> - Update community-questions page with categories/tags display and `force-dynamic` rendering
> - Add `questions/` directory with alternate questions page and client component
> - Add `pnpm-workspace.yaml` for monorepo workspace config
> - Add `.vercel/` project config and update root `.gitignore`
> - Update `package.json` with `build:force` script and dependency bumps
> - Update `tsconfig.json` with `react-jsx` JSX setting and broader `include` paths
> - Add `YOUTUBE_API_KEY` environment variable requirement
> - Add multiple deployment/phase documentation files

### Detailed Changelog

#### New Features

- **YouTube Feed API** — `app/api/youtube-feed/route.ts`
  - Fetches recent videos from teacher YouTube channels using YouTube Data API v3
  - Queries Sanity for teachers with `youtubeChannelId` (from both `user` and `teacher` types)
  - Deduplicates channels, sorts by publish date, supports `?limit=` param
  - 30-minute revalidation cache

- **Lessons Page** — `app/(app)/lessons/page.tsx`
  - Categorized video lessons: Fundamentals, Law, Righteous Living, Prophecy
  - Dynamic "New Videos" tab fetching from `/api/youtube-feed`
  - Responsive tab navigation with compact mode support

- **Home Page YouTube Section** — `app/(app)/page.tsx`
  - "New Videos" section displaying latest 6 teacher uploads
  - Embedded YouTube players with channel links and teacher attribution
  - "View All Lessons" link to lessons page

- **Teacher Actions** — `action/teacherActions.ts`
  - `getAllTeachers()` with search, role, specialization, status filters and pagination
  - `getTeacherById()`, `updateTeacherRole()`, `updateTeacherSpecializations()`
  - `toggleTeacherStatus()`, `deleteTeacher()` (soft delete)
  - `getTeacherStats()` with role breakdown
  - `getTeacherSpecializations()`, `updateTeacherProfile()`, `bulkUpdateTeachers()`

- **User Actions** — `action/userActions.ts`
  - `getAllUsers()` with search, role, status filters and pagination
  - `getUserById()`, `updateUserRole()` (syncs Clerk + Sanity)
  - `toggleUserStatus()`, `deleteUser()` (soft delete with role-based permissions)
  - `getUserStats()` with role breakdown
  - `updateUserProfile()`, `bulkUpdateUsers()` (transactional)

- **Shared Admin Management** — `components/admin/shared-management.tsx`
  - Reusable admin table component with search, filters, sorting, pagination
  - Inline role editing, status toggling, profile editing dialogs
  - Bulk selection and bulk update operations
  - Stats dashboard cards, delete confirmation dialogs

- **Questions Directory** — `questions/page.tsx`, `questions/questions-client.tsx`
  - Alternate community questions page using `getCommunitiesServer()`
  - Client wrapper component for interactive features

#### Bug Fixes

- **Node.js 25 localStorage SSR crash** — `instrumentation.ts`
  - Node.js v25 exposes a broken `localStorage` global lacking `getItem`/`setItem` methods
  - `register()` hook deletes `globalThis.localStorage` on the server so libraries fall back to server-safe code paths
  - Avoids V8 crash caused by replacing the global with a shim

- **localStorage SSR guards** — `contexts/settings-context.tsx`
  - Added `typeof window === 'undefined'` guard before `window.localStorage.getItem('theme')`

- **localStorage SSR guards** — `components/header/simple-notification-icon.tsx`
  - All `localStorage.getItem()` and `localStorage.setItem()` calls wrapped with `typeof window !== 'undefined'`

- **Community Questions static generation** — `app/(app)/community-questions/page.tsx`
  - Added `export const dynamic = 'force-dynamic'` to prevent build-time static generation errors

#### Schema Updates

- **`teacherType.tsx`** — Added `youtubeChannelId` field (string) for teacher ministry channel integration
- **`userType.tsx`** — Added `dev` role option; added `isDeleted`, `deletedAt`, `deletedBy` fields for soft-delete support; expanded teacher role subtypes (`junior_teacher`, `senior_teacher`, `lead_teacher`)

#### Admin UI Refactors

- **`teacher-management.tsx`** — Refactored to use `SharedManagement` component; added specialty/specialization management tabs
- **`user-management.tsx`** — Refactored to use `SharedManagement` component; role-based delete permissions (senior teachers can only delete members)

#### Configuration & Deployment

- **`package.json`** — Added `build:force` script; updated to Next.js 16.1.6, React 19.2.4, OpenAI 5.10.1
- **`tsconfig.json`** — Set `jsx: "react-jsx"`; expanded `include` paths for type generation
- **`pnpm-workspace.yaml`** — Added monorepo workspace configuration
- **`.vercel/project.json`** — Vercel project linking configuration
- **`.gitignore`** — Updated with Vercel-specific ignores
- **New env var** — `YOUTUBE_API_KEY` required for YouTube feed integration

#### Documentation Added

- `AI_MODERATION_SETUP.md`, `COMPLETE_MODERATION_SYSTEM.md`
- `DEPLOYMENT_CHECKLIST.md`, `DEPLOYMENT_COMPLETE.md`, `DEPLOYMENT_FINAL.md`, `DEPLOYMENT_READY.md`, `DEPLOYMENT_STATUS.md`, `DEPLOYMENT_SUCCESS.md`, `DEPLOYMENT_SUCCESS_FINAL.md`
- `GUEST_ROLE_IMPLEMENTATION.md`
- `PHASE2_SUMMARY.md`, `PHASE3_SUMMARY.md`, `PHASE4_SUMMARY.md`
- `QUOTA_SOLUTIONS.md`
- `RESPONSIVE_APP_DIRECTORY_SUMMARY.md`, `RESPONSIVE_DESIGN_GUIDE.md`, `RESPONSIVE_IMPLEMENTATION_SUMMARY.md`
- `RICH_TEXT_EDITOR_GUIDE.md`
