# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

VentriaHQ Super Admin — a Next.js 15 (App Router, React 19) dashboard for platform super-admins to manage tenants, price plans, subscriptions and invoices. It has no database of its own; all data comes from an external backend reached through a Next.js BFF layer.

## Commands

Package manager is **yarn** (`yarn.lock`).

```bash
yarn dev      # next dev --turbopack on http://localhost:3000
yarn build    # next build
yarn start    # serve production build
yarn lint     # eslint (flat config, next/core-web-vitals + next/typescript)
npx tsc --noEmit   # type-check
```

There is no test suite. Note that `next.config.ts` sets `eslint.ignoreDuringBuilds` and `typescript.ignoreBuildErrors`, so **`yarn build` passing does not mean the code type-checks or lints** — run `yarn lint` and `npx tsc --noEmit` explicitly to verify changes.

## Environment

`lib/env.ts` validates env vars with zod at import time and throws if invalid. Set in `.env.local`:

- `BACKEND_URL` (required) — backend base URL; trailing slash is stripped
- `JWT_COOKIE_NAME` (default `dev_super_admin_jwt`)
- `REFRESH_COOKIE_NAME` (default `dev_super_admin_refresh`)
- `COOKIE_DOMAIN` (optional; omit for localhost)

These are also inlined via `env` in `next.config.ts`. Server code should import `env` from `@/lib/env`; `middleware.ts` and the proxy route read `process.env` directly with the same defaults, so keep defaults in sync if changing them.

## Architecture

### BFF / auth flow (the key cross-cutting concept)

The browser never talks to the backend directly and never sees tokens.

- **Login** (`app/api/auth/login/route.ts`): posts credentials to `${BACKEND_URL}/super-admin/auth/login`, stores `access`/`refresh` tokens as httpOnly cookies via `setAuthCookies` (`lib/cookies.ts`; access 10h, refresh 30d). Returns `mustChangePassword`, which routes the user to `/forceChangePassword`.
- **Generic proxy** (`app/api/proxy/[...path]/route.ts`): every client data call goes to `/api/proxy/<backend-path>`. `proxyToBackend` (`lib/with-auth-proxy.ts`) forwards method/body/query to `${BACKEND_URL}/<backend-path>`, strips browser cookies, and injects `Authorization: Bearer <access cookie>`.
- **Refresh on 401**: the proxy calls `/api/auth/refresh` (deduplicated with a module-level `pendingRefresh` promise), retries the request with the new token via `proxyToBackendWithAccess`, and writes the new cookies onto the response with raw `set-cookie` headers. If refresh or retry fails it redirects to `/login?next=...`.
- **Middleware** (`middleware.ts`): redirects to `/login` when the JWT cookie is absent. It only checks presence, not validity — expiry is handled by the proxy refresh flow.

So, to call a new backend endpoint from the client, just `fetch('/api/proxy/super-admin/...')`; no new route handler is needed. Dedicated route handlers under `app/api/auth/*` exist only for operations that read/write the auth cookies.

### Routing

- `app/(auth)/` — login and forced password change (no shell).
- `app/(dashboard)/` — authenticated pages wrapped in `SidebarProvider` + `AppSidebar` + `SiteHeader`. Feature pages follow `<feature>/page.tsx` (list), `<feature>/create/page.tsx`, `<feature>/update/[id]/page.tsx`, with feature-local components in `<feature>/components/`.
- Sidebar nav entries are hardcoded in `components/app-sidebar.tsx`; add new sections there.
- `pages/` is an empty legacy directory; don't add to it.

### Data layer

- TanStack Query, configured in `components/query-provider.tsx` (staleTime 5 min, retry 1).
- Domain hooks live in `hooks/` (`useTenants`, `usePricePlan`, `useSubscription`, `useInvoice`, `hooks/auth/*`, `hooks/my-profile/*`). Each exports `useQuery` readers and `useMutation` writers that `fetch` the proxy and `invalidateQueries` on success. Follow this pattern rather than fetching inside components.
- List pages are client components that keep filters/pagination in URL search params (`useSearchParams` + `router.replace`) and pass them to the hook.
- Shared API types are in `types/`.

### UI

- shadcn/ui (new-york style, neutral base, lucide icons) in `components/ui/`; add primitives with the shadcn CLI per `components.json`. Tailwind v4 with CSS variables in `app/globals.css`.
- Forms use react-hook-form + zod (`@hookform/resolvers`); toasts use `sonner` (`Toaster` mounted in `app/layout.tsx`); tables use `@tanstack/react-table`.
- Reusable cross-feature components are in `components/` and `components/common/`; constants (page URLs, permission strings in `PlatformPermission`) are in `shared/constants/`.

## Claude Code setup in this repo

`.claude/agents/frontend-dev.md` defines the primary implementation agent, and `.claude/skills/` contains project skills (`nextjs-architecture`, `frontend-components`, `frontend-data-state`, `frontend-ui-system`, `react-performance`, `frontend-verification`) with detailed conventions. This file takes precedence over those when they conflict.
