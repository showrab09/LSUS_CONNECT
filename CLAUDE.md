# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Development server at http://localhost:3000
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

No test suite is configured.

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `JWT_SECRET` — Secret for signing/verifying JWT tokens
- `RESEND_API_KEY` — API key for Resend email service
- `NEXT_PUBLIC_APP_URL` — App URL (used in email links)

## Architecture

**LSUS Connect** is a campus social platform for Louisiana State University Shreveport. Built with Next.js App Router, TypeScript, Tailwind CSS v4, and Supabase (PostgreSQL).

### Authentication Flow

JWT-based auth stored in HTTP-only cookies. The middleware (`middleware.ts`) validates tokens on every protected route and redirects unauthenticated users to `/signin?redirect=<url>`. Auth pages redirect to `/home` if already logged in.

Protected routes: `/home`, `/post-listing`, `/marketplace`, `/housing`, `/social`, `/lost-found`, `/user-profile`, `/messages`, `/admin-dashboard`, `/product-detail`, `/contact-team`, `/settings`, `/report-lost-found`.

Client-side user state uses `hooks/useCurrentUser.ts`, which decodes JWT from localStorage for fast display then fetches full profile from `/api/user/profile`. The hook is SSR-safe (starts empty to avoid hydration mismatches).

### Database

Supabase is used directly in all API routes — **Prisma schema exists (`prisma/schema.prisma`) but Prisma is not used for queries**. All DB access uses the Supabase client from `lib/supabase.ts` with standard `.from().select().eq()` syntax.

Tables in Supabase (not all in Prisma schema):
- `users` — auth, profiles (Prisma: User)
- `listings` — marketplace items (Prisma: Listing)
- `lost_found` — lost & found items (Prisma: LostFound)
- `posts`, `comments` — social feed (Supabase only)
- `conversations`, `messages` — direct messaging (Supabase only)
- `saved_listings` — user wishlists (Supabase only)

### API Routes (`app/api/`)

All routes are serverless Next.js route handlers. Dynamic segments use `[id]/route.ts`. Auth-dependent routes export `export const dynamic = "force-dynamic"` to prevent caching.

Auth routes: `auth/signup`, `auth/signin`, `auth/verify-email`, `auth/forgot-password`, `auth/reset-password`, `auth/logout`, `auth/resend-verification`

Feature routes: `posts`, `comments`, `listings`, `listings/[id]`, `saved-listings`, `saved-listings/check`, `lost-found`, `messages`, `messages/conversations`, `messages/conversations/[id]`, `messages/conversations/[id]/read`, `messages/unread-count`, `user/profile`, `user/change-password`

### Input Validation & Security

All user input goes through `lib/validate.ts`:
- `sanitizeText()` / `sanitizeMultiline()` — strip HTML, JS, event handlers
- `LIMITS` constants — enforce max lengths
- Image validation — max 2MB per image, validated type and count
- Rate limiting applied on auth routes (middleware layer)

### Email

Transactional email via Resend (`lib/email/resend.ts`). Templates use LSUS brand colors: purple `#461D7C`, gold `#FDD023`. Verification tokens expire 24h; password reset tokens expire 1h.

### Reusable Components (`components/`)

- `FloatingChat.tsx` — persistent messaging UI present across pages
- `UserDropdown.tsx` — top-right user menu
- `MessageSellerButton.tsx` — initiates DM conversations from listings
- `SaveButton.tsx` — wishlist toggle
- `EditListingModal.tsx` — in-place listing editing
- `HousingListingForm.tsx` — roommate/housing post form

### Commit Conventions

Use semantic prefixes: `feat:`, `fix:`, `chore:`, `security:`, `refactor:`, `docs:`, `style:`.

Branch naming: `<name>-<feature>` (e.g., `robert-dynamic-home`). PRs target `main`.
