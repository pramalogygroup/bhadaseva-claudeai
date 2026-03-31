# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server with Turbopack (http://localhost:3000)
npm run build     # Production build
npm run start     # Production server
npm run lint      # ESLint
```

No test runner is configured.

## Architecture Overview

**BhadaSeva** is a multi-tenant property and rental management platform for Kathmandu Valley, Nepal. It is a full-stack Next.js App Router application backed by MongoDB.

### Dual Role System

Users can hold both an **Owner** and a **Tenant** profile simultaneously and switch between them at runtime. The active profile type (`owner` | `tenant`) is stored in the JWT session and controls what routes and data are accessible.

- `src/lib/auth.ts` — NextAuth configuration; JWT callbacks populate `session.user` with `activeProfileType`, `enabledProfiles`, `ownerProfileId`, `tenantProfileId`
- `src/lib/auth-helpers.ts` — Server helpers: `requireAuth()`, `requireOwnerProfile()`, `requireTenantProfile()`
- `src/middleware.ts` — Protects `/owner/*` and `/tenant/*` routes

### Route Groups

```
(auth)        → signin, signup, onboarding (public)
(marketplace) → listings browse (public)
(owner)       → owner dashboard, properties, units, payments, tenants, invoices, team
(tenant)      → tenant dashboard, payments, receipts
```

The homepage (`/`) fetches live listings from MongoDB and must be `force-dynamic` (already set).

### Data Model

Key relationships:

- `User` → has optional `ownerProfileId` and `tenantProfileId`
- `OwnerProfile` → owns `Property[]` → each has `Unit[]`
- `Unit` → has optional `currentLeaseId` pointing to an active `Lease`
- `Lease` → links `Unit`, `OwnerProfile`, `TenantProfile`; drives `RentPayment` and `Invoice` records
- `MarketplaceListing` → mirrors a `Unit` for public browsing; toggled via `isPublicListing` on Unit
- `TeamMember` → invite-based, scoped to an `OwnerProfile`, with granular permissions

All models are in `src/models/`. MongoDB connection is managed as a cached singleton in `src/lib/mongodb.ts`.

### API Routes

All API routes live under `src/app/api/` and follow REST conventions. Routes check the session for the appropriate profile ID and scope all queries to it (owners only see their own properties, tenants only see their own leases, etc.).

### Validation

Zod schemas are in `src/lib/validations/`:
- `auth.schema.ts` — sign-in, sign-up, owner/tenant profile forms
- `property.schema.ts` — property, unit, and lease creation

React Hook Form + Zod resolvers are used on the client side.

### UI

Shadcn UI components (in `src/components/ui/`) with Tailwind CSS 4. `cn()` from `src/lib/utils.ts` merges class names. Toast notifications use Sonner. Dark mode via `next-themes`. All wrapped in `src/components/providers.tsx`.

### Environment Variables

```
MONGODB_URI=         # MongoDB connection string
NEXTAUTH_URL=        # Full URL of the app
NEXTAUTH_SECRET=     # Random secret (openssl rand -base64 32)
```

### Currency & Locale

Monetary values are in Nepali Rupees. Use `formatNPR(amount)` from `src/lib/utils.ts` for display. Districts are enum-constrained to `Kathmandu | Lalitpur | Bhaktapur`.
