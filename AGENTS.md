# AGENTS.md

## Next.js Version Rule

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

If `node_modules/next/dist/docs/` is not present in the local install, say so briefly, then inspect the installed package, project code, and official docs as needed before changing Next.js behavior.

## Local Skills

Project skills live in `.agents/skills`. When a task matches one or more skills below, read the relevant `SKILL.md` before editing, then load referenced files only as needed. If multiple skills apply, use the smallest set that covers the work.

Folder names are listed first. Some skills have a different frontmatter name; that name is shown in parentheses.

- `accessibility` - Use for WCAG 2.2 audits and fixes, keyboard navigation, focus management, screen reader support, ARIA, contrast, and accessible component behavior.
- `composition-patterns` (`vercel-composition-patterns`) - Use when React component APIs are getting complex: boolean prop proliferation, compound components, reusable providers, context contracts, render props, or flexible component-library design.
- `frontend-conventions` - Use for Next.js App Router feature work in this repo: route files under `src/app`, colocated route `_components` and `_utils`, reusable UI in `src/components`, server/client boundaries, metadata, JSON-LD, route helpers, and frontend validation. If the skill mentions `apps/web`, map that guidance to this repo root and `src/` layout.
- `frontend-design` - Use when building or improving visible UI: pages, dashboards, components, forms, landing/product surfaces, responsive layouts, visual polish, or redesign work. Pair with `shadcn` and Tailwind skills when component or styling rules matter.
- `i18n-conventions` - Use for all `next-intl` work: editing `messages/en.json` or `messages/ar.json`, choosing `getTranslations` vs `useTranslations`, adding scoped `NextIntlClientProvider` boundaries, updating `src/i18n/routing.ts`, using `src/i18n/navigation.ts` helpers, root-param locale handling, localized links, Arabic copy, and RTL checks.
- `next-best-practices` - Use for Next.js code decisions: App Router file conventions, React Server Component boundaries, async `params`/`searchParams`/`cookies`/`headers`, metadata, route handlers, image/font optimization, error handling, and bundling.
- `next-cache-components` - Use when working with Next.js 16 Cache Components, Partial Prerendering, `"use cache"`, `cacheLife`, `cacheTag`, `updateTag`, or cache invalidation behavior.
- `next-upgrade` - Use only for Next.js version upgrades, migration guides, codemods, or deprecation-driven framework changes.
- `nodejs-backend-patterns` - Use for backend service or API implementation work: Express/Fastify servers, middleware, auth, database integration, REST APIs, GraphQL, and microservice structure. In this frontend starter, this is usually relevant only for added server/API service code.
- `nodejs-best-practices` - Use for Node.js runtime decisions, async patterns, security, architecture, scripts, config files, server-side utilities, and package/runtime tradeoffs.
- `react-best-practices` (`vercel-react-best-practices`) - Use when writing, reviewing, or refactoring React/Next.js for performance: data fetching, waterfalls, bundle size, render behavior, serialization, Suspense, client/server splitting, and expensive UI updates.
- `react-hook-form` - Use when building, reviewing, or optimizing client-side forms with React Hook Form: `useForm`, `useWatch`, `useController`, `Controller`, `useFieldArray`, `FormProvider`, controlled UI components, shadcn form integration, and form performance. Do not use it for React 19 Server Actions, `useActionState`, or server-side form handling.
- `seo` - Use for search-related work: metadata, Open Graph/Twitter tags, canonical URLs, sitemap/robots behavior, structured data, JSON-LD, breadcrumbs, and public content discoverability.
- `shadcn` - Use whenever touching shadcn/ui or `components.json`: adding components, checking registry docs, presets, composing Radix/shadcn primitives, forms, dialogs, tabs, cards, buttons, icons, and component styling rules.
- `tailwind-css-patterns` - Use for Tailwind utility work: responsive layout, grid/flex, spacing, typography, colors, state variants, animation utilities, and maintainable utility composition.
- `tailwind-v4-shadcn` - Use for Tailwind CSS v4 plus shadcn integration: CSS variable theming, `@theme inline`, dark mode, theme-provider behavior, v4 migration issues, and color/token debugging.
- `typescript-advanced-types` - Use for complex TypeScript type work: generics, conditional types, mapped types, template literal types, branded types, reusable type utilities, and compile-time API safety.
- `zod` - Use for Zod schemas and validation: `z.object`, string/number validations, transforms, `safeParse`, `z.infer`, error formatting, and schema composition. Do not use it as a substitute for React Hook Form or OpenAPI client-generation guidance.

## Skill Pairing Defaults

- For most UI feature work, start with `frontend-conventions`, then add `next-best-practices`, `react-best-practices`, `i18n-conventions`, `shadcn`, `tailwind-css-patterns`, or `frontend-design` as the change requires.
- For public-facing pages, pair `seo` with `frontend-conventions`, `i18n-conventions`, and `accessibility`.
- For client-side forms, pair `react-hook-form` with `shadcn`, `zod`, `accessibility`, and `i18n-conventions` when controlled inputs, validation, labels, error messages, or RTL behavior are involved.
- For cache or rendering model changes, pair `next-best-practices`, `next-cache-components`, and `react-best-practices`.
