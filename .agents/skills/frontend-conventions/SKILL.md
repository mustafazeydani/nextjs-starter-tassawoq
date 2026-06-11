---
name: frontend-conventions
description: Follow Jobara web app conventions for apps/web feature work, including Next.js App Router route colocation, _components/_utils structure, shared path constants, generated API clients, server/client boundaries, metadata, JSON-LD, and frontend validation checks. Use when adding, moving, or refactoring frontend pages, route helpers, client components, domain utilities, public routes, protected route UI, or web app feature code.
---

# Frontend Conventions

Use this skill before changing `apps/web` feature code. Pair it with `next-best-practices` for App Router behavior, `next-cache-components` for `"use cache"`/PPR work, and `seo` for metadata or structured data.

## First Pass

1. Read `apps/web/AGENTS.md`.
2. Read the relevant local Next.js docs under `apps/web/node_modules/next/dist/docs/`.
3. Inspect nearby route folders before creating new files. Match their structure, naming, and data flow.
4. Prefer the smallest route/domain-local change that fits the existing feature boundary.

## File Placement

- Keep `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, and `not-found.tsx` thin.
- Put route-specific UI in `app/<route>/_components`.
- Put route-specific data fetching, metadata helpers, search-param helpers, and small domain helpers in `app/<route>/_utils`.
- Put reusable app-wide UI in `src/components`, not in a route folder.
- Put reusable component-domain internals in `src/components/<domain>/_utils` when they are shared by components in that domain but not broadly useful.
- Use `src/lib` only for genuinely cross-cutting primitives such as API error handling, API mutators, environment helpers, generic formatting, telemetry, or shared framework utilities.
- Do not add feature/domain files such as `legal.ts`, `blog-routes.ts`, or `cookie-consent.ts` to `src/lib` unless multiple unrelated domains need them.

## Routes And Paths

- Use `@repo/constants` `DEFAULT_WEB_PATHS` or `createWebPaths` for public URL construction.
- Add missing stable public paths to `packages/constants/src/web_paths.ts` instead of creating ad hoc route constants in `apps/web`.
- Keep backend `PathsService` in sync when shared path shape changes.
- Encode dynamic path segments at the path helper boundary. Do not require callers to pre-encode slugs unless the existing helper already follows that convention.
- For backend-managed slugs with frontend aliases, centralize the alias logic in shared path helpers when the alias is part of the public URL contract.

## Data And API

- Use Orval-generated clients from `src/api/generated` for backend contracts.
- Regenerate web codegen after backend OpenAPI/schema changes.
- Keep server-only data helpers in route `_utils` and add `import "server-only"` when they call backend APIs or use server-only cache APIs.
- Use Cache Components directives intentionally: `"use cache"`, `cacheLife`, and `cacheTag` belong inside the cached async function.
- Wrap navigation-blocking async UI in Suspense or make it a cache component according to local Next docs.

## Metadata And SEO

- Prefer backend-provided `seo.meta`, `breadcrumbs`, and `seo.schemas` when the backend owns page content.
- Export `generateMetadata` from route `_utils/metadata.ts` for established routes, or keep it in `page.tsx` only for very small pages.
- Render JSON-LD with the existing `JsonLdScript` helper and typed `schema-dts` schemas.
- Keep visible breadcrumbs and JSON-LD breadcrumbs sourced from the same backend response when available.

## Client And Server Boundaries

- Add `"use client"` only to components that need browser APIs, state, effects, event handlers, or client hooks.
- Do not import server-only files into client components.
- Keep browser storage, `document`, and `window` helpers behind client-only component/domain utilities.
- Do not pass functions or non-serializable values from server components into client components unless using supported server action patterns.

## Validation

- Run `pnpm --filter web lint` and `pnpm --filter web check-types` after frontend structural changes.
- Run `pnpm --filter web codegen` when generated API clients are affected.
- Run targeted tests or build only when the touched area or user request warrants it, and call out known unrelated build blockers clearly.
