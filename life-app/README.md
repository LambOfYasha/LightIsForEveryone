# Light Is For Everyone

Christian community platform for biblical discussion, publishing, lessons, moderation, and member growth workflows built with Next.js, Clerk, Sanity, and AI-assisted safety tooling.

## What this project includes

- Community questions and discussion flows for biblical and theological topics
- Teacher and staff publishing for responses, blogs, and lesson content
- A home page with site stats, verse of the day, search, intro content, and latest teacher videos
- Member dashboards with favorites, activity, analytics, notifications, and settings
- Guest-friendly participation paths with moderation, reports, and support and feedback tools
- Admin panels for moderation, users, teachers, tags, lessons, reports, analytics, and system settings

## Tech stack

| Layer | Tools |
| --- | --- |
| Framework | Next.js App Router, React 19, TypeScript |
| Auth | Clerk |
| Content platform | Sanity CMS + GROQ |
| UI | Tailwind CSS, Radix UI, shadcn/ui, Lucide icons |
| Editor | TipTap rich text editor |
| AI / safety | OpenAI text and image moderation, appeals, analytics, reporting |
| External content | YouTube Data API, Bible verse API |
| Deployment | Vercel by default, Linux self-hosting supported |

## Repository map

| Path | Responsibility |
| --- | --- |
| `app/` | Route groups, pages, layouts, API routes, and the Sanity Studio mount |
| `action/` | Server actions for CRUD, moderation, notifications, lessons, feedback, help, and user management |
| `components/` | Feature UI for admin, blog, comments, community, header, profile, and shared UI primitives |
| `contexts/` | React context for member settings and appearance state |
| `hooks/` | Client hooks for role checks, responsive behavior, compact mode, toasts, and moderation |
| `lib/` | Shared business logic for auth, AI, user services, utilities, and base URL handling |
| `sanity/` | Sanity schema types, clients, queries, structure config, and environment helpers |
| `public/` | Static assets such as logos and favicon |
| `questions/` | Alternate question listing route and client wrapper |
| `scripts/` | Dev helpers for env checking, seeding test data, and admin setup |

## Key files that drive the app

| File | Why it matters |
| --- | --- |
| `app/layout.tsx` | Root HTML shell, metadata, and global styles |
| `app/(app)/layout.tsx` | Main app shell with `ClerkProvider`, settings context, sidebar, header, and footer |
| `app/(app)/page.tsx` | Landing page with search, stats, verse of the day, intro lesson, and YouTube feed |
| `middleware.ts` | Route protection for dashboard, admin, and API paths while allowing guest-safe endpoints |
| `instrumentation.ts` | SSR workaround for broken `localStorage` behavior in newer Node runtimes |
| `next.config.ts` | Build behavior, remote image hosts, compression, and package import optimization |
| `sanity.config.ts` | Sanity Studio configuration mounted at `/studio` |
| `vercel.json` | Vercel install and build commands, API max duration, and security headers |
| `package.json` | Scripts, dependency versions, and the app's default workflow |
| `Project_Overview.md` | Deep engineering notes and historical implementation context |

## Route map

### Public and discovery routes
- `/` for onboarding, discovery, search, stats, daily verse, and featured videos
- `/about`, `/contact`, `/faq`, `/guidelines`, `/privacy`, `/terms` for informational content
- `/blogs` and `/blogs/[slug]` for long-form articles
- `/community-questions` and `/community-questions/[slug]` for Q&A discovery
- `/questions` as an alternate question directory route
- `/lessons` for categorized video lessons and new uploads
- `/members`, `/staff`, `/tags`, `/search`, `/responses/[slug]`, and `/profile/*` for browsing people and content

### Authenticated member routes
- `/sign-in` and `/sign-up` handled by Clerk
- `/dashboard/*` for profile, favorites, questions, blogs, notifications, and settings

### Elevated access routes
- `/admin/*` for moderation, reports, analytics, lesson management, user and teacher management, tags, and system controls
- `/studio` for Sanity authoring

### API surface
- `app/api/search` for unified search across blogs, questions, responses, and comments
- `app/api/moderation` and `app/api/moderation/image` for text and image moderation
- `app/api/blogs`, `app/api/communities`, `app/api/comments`, `app/api/reports`, `app/api/tags`, and `app/api/user` for application data
- `app/api/appeals`, `app/api/guidelines`, `app/api/site-stats`, `app/api/verse-of-the-day`, and `app/api/youtube-feed`
- `app/api/webhooks/clerk` for syncing new Clerk users into Sanity

## Feature guide and use cases

| Feature | What it does | Typical use cases |
| --- | --- | --- |
| Home and discovery | Combines verse of the day, site stats, search, intro content, and latest teacher videos | Onboarding new visitors, highlighting fresh content, giving members a quick starting point |
| Community questions | Lets users create and browse spiritual questions with discussion threads | Asking biblical questions, gathering community insight, starting topical discussions |
| Responses and comments | Supports teacher and member responses plus standard and embedded comments | Teaching through long-form answers, follow-up discussion, clarifying doctrine or interpretation |
| Blogs | Publishes tagged articles with images, read-time estimates, and role-gated authoring | Devotionals, teaching articles, announcements, long-form apologetics, or doctrine pieces |
| Lessons | Organizes video teachings by category and supplements them with newest YouTube uploads | Structured study plans, ministry teaching libraries, category-based learning paths |
| Search | Searches blogs, community questions, responses, and comments from one endpoint | Researching a topic, finding past answers, locating related discussions quickly |
| Dashboard | Shows personal stats, activity, favorites, notifications, and analytics | Member self-service, reviewing saved content, monitoring personal engagement |
| Profiles, members, staff, and tags | Gives directory and taxonomy views across people and content | Browsing teachers, discovering members, filtering content by topic, building trust in contributors |
| Guest participation | Allows unauthenticated flows for guest-safe actions through dedicated endpoints | Lower-friction participation, first-time question submission, guest comments, or guest reports |
| Settings and personalization | Stores theme, compact mode, reduced motion, notification, and privacy preferences | Accessibility tuning, mobile-friendly usage, and visual preference control |
| Feedback | Collects bug reports, feature requests, UI and UX suggestions, and anonymous submissions | Product improvement, issue intake, and qualitative user research |
| Help center | Creates and tracks support tickets with status, category, and priority | Account support, bug escalation, platform assistance, and operational follow-up |
| Moderation, reports, and appeals | Reviews content with AI support, allows reporting, and supports decision appeals | Keeping discussions safe, enforcing guidelines, and revisiting disputed moderation outcomes |
| Admin suite | Provides role-gated management for users, teachers, lessons, tags, reports, analytics, and settings | Platform operations, content governance, team workflows, and data oversight |
| Sanity Studio | Serves as the CMS and schema-backed authoring environment | Editing content models, managing published data, and staff authoring workflows |

## Role and access model

The role ladder defined in `lib/auth/roles.ts` is:

- `guest`
- `member`
- `junior_teacher`
- `teacher`
- `moderator`
- `senior_teacher`
- `lead_teacher`
- `dev`
- `admin`

Practical access rules in this checkout:

- Guests can browse content, comment, create community questions, use search, and access guest-specific APIs.
- Members gain dashboard access, favorites, editable profiles, and saved settings.
- Teacher-tier roles can create responses, manage blogs, and access growing levels of admin tools.
- Moderation and management privileges expand at `moderator`, `senior_teacher`, `lead_teacher`, `dev`, and `admin`.
- `middleware.ts` protects `/dashboard`, `/admin`, and major API areas while explicitly allowing guest-safe endpoints such as `/api/moderation`, `/api/user/guest`, `/api/comments/guest`, and `/api/communities/guest`.

## Content model

The app stores content in Sanity rather than a separate SQL database. The current schema index wires up these 18 core types:

- `user`
- `teacher`
- `post`
- `comment`
- `embeddedComment`
- `favorite`
- `blog`
- `communityQuestion`
- `tag`
- `report`
- `notification`
- `adminSettings`
- `specialty`
- `guestQuestion`
- `helpTicket`
- `feedback`
- `lessonCategory`
- `lesson`

In practice, that means the same CMS layer backs users, publishing, moderation artifacts, support tickets, taxonomy, and lessons.

## Environment variables

### Required by the code in this repo
```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
NEXT_PUBLIC_SANITY_API_VERSION=2025-07-05
SANITY_ADMIN_API_TOKEN=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
OPENAI_API_KEY=
YOUTUBE_API_KEY=
NEXT_PUBLIC_BASE_URL=http://localhost:3000
VERCEL_PROJECT_PRODUCTION_URL=app.example.com
```

### Clerk note
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` must come from the same Clerk application.
- Update Clerk allowed origins, redirect URLs, and webhook settings to match the hostname you use locally or on the Linux server.

### Runtime notes
- `OPENAI_API_KEY` is optional in local development if you are okay with the built-in dev moderation fallback.
- `YOUTUBE_API_KEY` is only required for live teacher-channel syncing; the lessons area still has Sanity and fallback content paths.
- `SANITY_ADMIN_API_TOKEN` is required for write actions, role changes, lesson management, and Clerk-to-Sanity syncing.
- `NEXT_PUBLIC_BASE_URL` should be the exact URL you use during local development, for example `http://localhost:3000`.
- `VERCEL_PROJECT_PRODUCTION_URL` is also used for self-hosted production. Set it to the hostname only, without `https://`, because `lib/baseUrl.ts` prepends `https://` when `NODE_ENV=production`.

## Getting started

### Prerequisites
- Node.js 20 LTS or newer
- pnpm 9 or newer (matches `vercel.json` install/build commands)
- A Sanity project and dataset
- A Clerk application
- Optional but recommended: OpenAI API access and a YouTube Data API key

### Linux host prerequisites
For Ubuntu or Debian based machines:
```bash
sudo apt update
sudo apt install -y git curl build-essential
```

Install Node.js from your preferred source such as `nvm`, NodeSource, or your distro packages, then verify:
```bash
node -v
npm -v
```

### Install dependencies
The app root is `life-app/` inside the repo. Run install and deploy commands from this directory.

`vercel.json` is wired for pnpm (`pnpm install --frozen-lockfile` and `pnpm run build`), so `pnpm` is the safest default.

```bash
pnpm install
```

For repeatable installs on a Linux server or CI runner, prefer:
```bash
pnpm install --frozen-lockfile
```

### Configure environment
Create `life-app/.env.local` for development. For Linux production, prefer `life-app/.env.production` and keep it out of Git.

Minimum local example:
```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=...
NEXT_PUBLIC_SANITY_API_VERSION=2025-07-05
SANITY_ADMIN_API_TOKEN=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
CLERK_WEBHOOK_SECRET=...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Then make sure:
- Clerk redirects and webhook settings point back to this app
- Sanity has the expected schemas deployed and generated
- Any teacher records that should power the YouTube feed have a `youtubeChannelId`

### Start the app
```bash
npm run dev
```

To expose the dev server on your LAN from a Linux machine:
```bash
npm run dev -- --hostname 0.0.0.0 --port 3000
```

Then browse to `http://server-ip:3000`.

## Linux local webserver deployment

### Recommended production topology
- Ubuntu or Debian LTS
- Node.js 20 LTS or newer
- `systemd` to keep the Next.js process running
- Nginx reverse proxy in front of `next start`
- HTTPS enabled at the reverse proxy

### 1. Copy the app to the server
```bash
sudo mkdir -p /srv/apps/<project-name>
sudo chown $USER:$USER /srv/apps/<project-name>
git clone <your-repo-url> /srv/apps/<project-name>
cd /srv/apps/<project-name>/life-app
pnpm install --frozen-lockfile
```

### 2. Create the production environment file
Create `life-app/.env.production` with your production values.

Minimum self-hosted example:
```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=...
NEXT_PUBLIC_SANITY_API_VERSION=2025-07-05
SANITY_ADMIN_API_TOKEN=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
CLERK_WEBHOOK_SECRET=...
OPENAI_API_KEY=...
YOUTUBE_API_KEY=...
NEXT_PUBLIC_BASE_URL=https://app.example.com
VERCEL_PROJECT_PRODUCTION_URL=app.example.com
```

Important:
- `NEXT_PUBLIC_BASE_URL` should include the full public URL.
- `VERCEL_PROJECT_PRODUCTION_URL` should be the hostname only, without the scheme.
- The production `baseUrl` helper currently assumes `https://` in production. If you run the app behind plain HTTP only, absolute URLs built from that helper will be wrong. For Linux production, put the app behind HTTPS or update `lib/baseUrl.ts` before relying on plain-HTTP production URLs.

### 3. Build on Linux
Use the normal Next.js build on Linux:
```bash
NODE_ENV=production npm run build
```

Do not use `npm run build:prod` on Linux. That script uses Windows `set ...` syntax.

### 4. Smoke test the production server
Run the app locally on the server before wiring up Nginx:
```bash
npm run start -- --hostname 127.0.0.1 --port 3000
```

If you need direct LAN access without a reverse proxy during testing, use `0.0.0.0` instead of `127.0.0.1`.

### 5. Create a systemd service
Create `/etc/systemd/system/<project-name>.service`:
```ini
[Unit]
Description=<project-name> Next.js app
After=network.target

[Service]
Type=simple
User=<deploy-user>
WorkingDirectory=/srv/apps/<project-name>/life-app
Environment=NODE_ENV=production
ExecStart=/usr/bin/env npm run start -- --hostname 127.0.0.1 --port 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Then enable it:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now <project-name>
sudo systemctl status <project-name>
```

### 6. Configure Nginx
Create `/etc/nginx/sites-available/<project-name>`:
```nginx
server {
    listen 80;
    server_name app.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable the site and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/<project-name> /etc/nginx/sites-enabled/<project-name>
sudo nginx -t
sudo systemctl reload nginx
```

If UFW is enabled, allow web traffic:
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
```

### 7. Enable HTTPS
For a public or internally resolved hostname, use Certbot if the host is reachable and you control DNS:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d app.example.com
```

If the server is LAN-only, use an internal CA, a self-signed certificate trusted by your client machines, or a local domain that your network resolves.

### 8. Update provider settings
- Clerk allowed origins, sign-in URLs, sign-up URLs, and webhook endpoints must use your Linux server hostname.
- Sanity CORS settings must allow your local domain or server hostname.
- If you access the app by name on your LAN, add DNS or `/etc/hosts` entries for that hostname.

### 9. Deploy updates
For normal updates on the Linux server:
```bash
git pull
pnpm install --frozen-lockfile
NODE_ENV=production npm run build
sudo systemctl restart <project-name>
```

### Common Linux deployment pitfalls
- If the build fails because `build:prod` was used, switch to `NODE_ENV=production npm run build`.
- If auth redirects or Clerk webhooks fail, verify your production hostname is registered in Clerk.
- If generated URLs point to the wrong place, re-check `NEXT_PUBLIC_BASE_URL` and `VERCEL_PROJECT_PRODUCTION_URL`.
- If the site is unreachable externally, check `systemctl status <project-name>`, `sudo nginx -t`, and your firewall rules for ports `80` and `443`.

### Alternate stack: Ubuntu + Nginx + PM2
Use this option if you prefer PM2 over a native `systemd` service. The Nginx reverse-proxy and HTTPS setup can stay the same; only the Node.js process manager changes.

#### 1. Install PM2 globally on the server
```bash
sudo npm install -g pm2
pm2 -v
```

#### 2. Build the app
From `life-app/`, after your production environment file is in place:
```bash
pnpm install --frozen-lockfile
NODE_ENV=production npm run build
```

#### 3. Start the app with PM2
```bash
pm2 start ./node_modules/next/dist/bin/next --name <project-name> -- start --hostname 127.0.0.1 --port 3000
```

That keeps Next.js bound to localhost so only Nginx exposes it publicly.

If you already enabled the `systemd` service above, stop and disable it before starting PM2 so both process managers do not compete for port `3000`.

#### 4. Save the PM2 process list and enable boot startup
```bash
pm2 save
pm2 startup
```

Run the additional command that `pm2 startup` prints, then save once more:
```bash
pm2 save
```

#### 5. Common PM2 commands
- Check status: `pm2 status`
- View logs: `pm2 logs <project-name>`
- Restart after a new build: `pm2 restart <project-name> --update-env`
- Remove the process: `pm2 delete <project-name>`

#### 6. Deploy updates with PM2
```bash
git pull
pnpm install --frozen-lockfile
NODE_ENV=production npm run build
pm2 restart <project-name> --update-env
```

#### 7. Pair PM2 with Nginx and HTTPS
PM2 only keeps the Next.js process alive. Nginx still handles public traffic on ports `80` and `443`, terminates TLS, and proxies requests to `http://127.0.0.1:3000`.

1. Confirm the PM2 app is healthy before adding Nginx:
```bash
pm2 status
curl -I http://127.0.0.1:3000
```

2. Create or verify `/etc/nginx/sites-available/<project-name>` with the same reverse-proxy layout used in the `systemd` section:
```nginx
server {
    listen 80;
    server_name app.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

3. Enable the site and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/<project-name> /etc/nginx/sites-enabled/<project-name>
sudo nginx -t
sudo systemctl reload nginx
```

4. Make the hostname reachable before requesting a certificate:
- Point the DNS `A` record for `app.example.com` to your server's public IPv4 address.
- If the server is behind a home router, reserve a stable LAN IP for it and forward TCP `80` and `443` from the router to that server.
- If UFW is enabled, allow `OpenSSH` and `Nginx Full`.
- Certbot's default HTTP challenge must reach port `80`, so `http://app.example.com` must work from outside your LAN before HTTPS setup will succeed.

5. Install Certbot and let it update the Nginx site:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d app.example.com
```

6. Align runtime and provider settings with the final HTTPS hostname:
- Set `NEXT_PUBLIC_BASE_URL=https://app.example.com`.
- Set `VERCEL_PROJECT_PRODUCTION_URL=app.example.com`.
- Update Clerk allowed origins, redirect URLs, and webhook endpoints.
- Update Sanity CORS settings to allow the same public hostname.

7. Validate the finished setup:
```bash
pm2 status
curl -I http://127.0.0.1:3000
curl -I https://app.example.com
sudo certbot renew --dry-run
```

## Running without Vercel

### What this means in practice
This app does not need Vercel hosting, a Vercel account, or the Vercel CLI to run in production.
You can run it on your own server as a standard Next.js Node.js app behind Nginx, Apache, Caddy, or another reverse proxy.
 
Important:
- This is not a static-export-only site. Because the app uses Next.js App Router features, API routes, Clerk auth, Sanity Studio, and server-side logic, a webserver alone cannot serve it as plain static files.
- To self-host it, run the Next.js server with `npm run start` and let your webserver proxy requests to that Node.js process.
- `vercel.json` only affects Vercel deployments and can be ignored when you host the app yourself.
- The `vercel` package currently listed in `package.json` is not imported by the application code, so it is not what makes the app run in production.
- `VERCEL_PROJECT_PRODUCTION_URL` is still the environment variable name used by `lib/baseUrl.ts`. Even when you do not use Vercel, set it to your public hostname without `https://`.
- `lib/auth/middleware.ts` still checks `VERCEL_ENV` for some production build-time auth fallbacks. If a self-hosted `next build` fails because auth code is evaluated during build, set `VERCEL_ENV=production` as a compatibility shim for the build environment or refactor that check later.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Standard production build |
| `npm run build:prod` | Windows-shell deployment build; use `npm run build` on Linux servers |
| `npm run build:force` | Windows-shell force-build path used for harder deployment recovery cases |
| `npm run start` | Start the production server |
| `npm run lint` | Run linting |
| `npm run lint:fix` | Auto-fix lint issues where possible |
| `npm run typegen` | Extract and generate Sanity schema typings |

## Maintenance mode

The site has a built-in maintenance mode backed by a Sanity setting, so it can be toggled without a redeploy.

- **The flag:** the singleton `adminSettings` document in Sanity has a `maintenanceMode` boolean (schema in `sanity/schemaTypes/adminSettingsType.tsx`).
- **The enforcement:** `middleware.ts` reads the flag on every page request. When `true`, non-privileged visitors are redirected to `/maintenance`, which shows the "We're under maintenance" page. API routes are not affected.
- **Bypass roles:** signed-in users with the `admin` or `dev` role skip the redirect (`canBypassMaintenanceMode` in `lib/admin-settings.ts`). The maintenance page links to `/sign-in`, which stays reachable so privileged users can get in.
- **Fail-open behavior:** if the Sanity lookup fails, middleware treats the flag as `false` so transient CMS issues do not take the site down.

### How to enable or disable it

- **Admin UI:** sign in as `admin` or `dev`, open the admin settings panel, toggle **Maintenance Mode**, and save.
- **Sanity Studio:** open `/studio` or the Sanity manage console, edit the **Admin Settings** document, set `maintenanceMode`, and publish.

The change takes effect on the next request. Use maintenance mode during deployments, schema migrations, or design rollouts that should not be publicly visible mid-flight.

## Deployment notes

- Vercel is the original default host and reads `vercel.json`, but self-hosted installs can ignore that file.
- Linux self-hosting is supported with a standard `next build` plus `next start` workflow behind a reverse proxy.
- On Linux servers, use `NODE_ENV=production npm run build`; `npm run build:prod` and `npm run build:force` are Windows-shell specific.
- `next.config.ts` allows remote images from Clerk and Sanity CDNs.
- `instrumentation.ts` guards server rendering against Node `localStorage` issues.
- The Clerk webhook endpoint is `/api/webhooks/clerk`.
- `lib/baseUrl.ts` expects `VERCEL_PROJECT_PRODUCTION_URL` in production and prepends `https://`, even on non-Vercel hosts.
- `lib/auth/middleware.ts` checks `VERCEL_ENV` for some build-time auth fallbacks, so a self-hosted production build may need `VERCEL_ENV=production` as a compatibility shim.
- This codebase includes test and debug routes and helper scripts; review them before exposing every route publicly in production.

## Adding New YouTube Feeds

The site-wide `New Videos` feed is powered by `GET /api/youtube-feed`.
That route reads teacher channel IDs from Sanity and then fetches recent uploads from the YouTube Data API.

### Requirements

- `YOUTUBE_API_KEY` must be configured in the environment where the app runs.
- The source record in Sanity must have a `youtubeChannelId` value.
- If you are using a `user` document, the `role` must be one of:
  - `junior_teacher`
  - `teacher`
  - `senior_teacher`
  - `lead_teacher`

### How to add a new feed

1. Open the teacher record in Sanity Studio or the admin teacher/user management UI.
2. Find the `YouTube Channel ID` field.
3. Paste the raw YouTube channel ID, for example `UCxxxxxxxxxxxxxxxxxxxxxxxx`.
4. Do **not** paste a full YouTube URL or an `@handle` in that field.
5. Save and publish the record.

### Which records are included

- `teacher` documents with a non-empty `youtubeChannelId`
- `user` documents with a teacher role and a non-empty `youtubeChannelId`
- Records marked as deleted are ignored
- Duplicate channel IDs are deduplicated automatically

### Where the videos appear

- Home page `New Videos` section
- Lessons page `New Videos` tab
- Direct API response from `/api/youtube-feed?limit=12`

### Cache and verification

- The YouTube feed route is cached for 30 minutes
- After updating a channel ID, allow up to 30 minutes for refreshed results to appear
- To verify the setup, open `/api/youtube-feed?limit=12` and confirm the new channel's videos are included

## Changelog

## Git branches

The Git metadata currently shows these branches:

- `main`
- `_life-bug`
- `_life-new_feature`
- `_life-ui`
- `_life-ux`
- `_life-experimental`

A legacy remote branch `shamayah-new_feature` also exists from before the `_life-*` rename. The branches currently point to the same base commit (`df44ceb`), so the branch names describe workflow intent more than unique code snapshots. Design work lands on `_life-ui` first, then is promoted to `_life-experimental` and `main` in small, reviewable chunks.

| Branch | Observed role in this repo | Good use cases |
| --- | --- | --- |
| `main` | Baseline branch and remote tracking target | Stable integration, release candidate prep, and merge target for completed work |
| `_life-bug` | Bug-fix lane created from `main` | Isolating regressions, hotfix work, and targeted QA validation |
| `_life-new_feature` | Feature-development lane created from `main` | Adding routes, APIs, schemas, or other product capabilities |
| `_life-ui` | UI-focused lane created from `main` | Component styling, visual refreshes, layout changes, and design system work |
| `_life-ux` | UX-focused lane created from `main` | Improving flows, onboarding, navigation, discoverability, accessibility, or content ergonomics |
| `_life-experimental` | Experimental lane created from `main` | Spikes, prototypes, riskier refactors, and validating ideas before promoting them elsewhere |

### Line endings

The repo root `.gitattributes` enforces `* text=auto eol=lf`: all text files are stored and checked out with LF endings on every platform, and common image/font/media files are marked binary. This overrides any machine-level `core.autocrlf` setting, so Windows checkouts no longer flip files to CRLF.

### Contribution rules

Branch-specific rules and contribution workflow live in [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Related documentation

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) for contribution workflow, branch rules, and collaboration expectations
- `Project_Overview.md` for deeper architecture notes, implementation history, and subsystem summaries
- [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for framework-specific deployment guidance
