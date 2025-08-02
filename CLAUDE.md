# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Commands
- `npx drizzle-kit generate` - Generate database migrations
- `npx drizzle-kit push` - Push schema changes to database
- `npx drizzle-kit studio` - Open Drizzle Studio for database management

## Architecture Overview

This is a Next.js 15 SaaS application with the following key architectural patterns:

### Authentication & User Management
- **Better Auth v1.2.8** with Google OAuth integration
- Database-backed sessions using Drizzle ORM
- User profiles with image upload support via Cloudflare R2
- Session management with automatic cleanup

### Subscription System
- **Polar.sh** integration for subscription billing
- Webhook-driven subscription status updates stored in PostgreSQL
- Subscription status checking utilities in `lib/subscription.ts`
- Real-time subscription management via Better Auth plugins

### Database Architecture
- **PostgreSQL** via Neon with **Drizzle ORM**
- Schema defined in `db/schema.ts` with Better Auth tables plus custom subscription table
- Database connection in `db/drizzle.ts`
- Migrations managed in `db/migrations/`

### AI Chat Integration  
- OpenAI GPT-4o integration via Vercel AI SDK
- Streaming responses in `app/api/chat/route.ts`
- Chat UI component in `app/dashboard/_components/chatbot.tsx`
- Web search preview tools enabled

### File Upload System
- **Cloudflare R2** storage with S3-compatible API
- Upload utilities in `lib/upload-image.ts`
- Image optimization and remote pattern configuration in `next.config.ts`

### UI Framework
- **shadcn/ui** components in `components/ui/`
- **Tailwind CSS v4** for styling
- **Radix UI** primitives for accessibility
- Dark/light theme support via `next-themes`

### Key Patterns
- App Router with route groups for organization
- Server actions for form handling
- Middleware for authentication protection
- TypeScript with strict mode enabled
- Path aliases configured as `@/*` pointing to root

### Environment Variables Required
- `DATABASE_URL` - Neon PostgreSQL connection
- `BETTER_AUTH_SECRET` - Auth encryption key
- `GOOGLE_CLIENT_ID/SECRET` - OAuth credentials
- `POLAR_ACCESS_TOKEN/WEBHOOK_SECRET` - Subscription management
- `OPENAI_API_KEY` - AI chat functionality
- `CLOUDFLARE_ACCOUNT_ID` + R2 credentials - File storage
- `NEXT_PUBLIC_STARTER_TIER/SLUG` - Polar product configuration

### Project Structure Notes
- `/app` - Next.js App Router pages and API routes
- `/app/dashboard` - Protected user area with subscription gating
- `/components` - Reusable UI components and homepage sections  
- `/lib` - Utility functions and service integrations
- `/db` - Database schema, connection, and migrations
- `/docs` - Project documentation (business and technical specs)