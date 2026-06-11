---
name: i18n-conventions
description: Follow this repo's next-intl conventions for internationalization. Use when adding or migrating UI copy, editing messages/en.json or messages/ar.json, wiring getTranslations/useTranslations, adding scoped NextIntlClientProvider boundaries, changing locale-aware routes in src/i18n/routing.ts, using src/i18n/navigation.ts helpers, or checking Arabic/RTL behavior.
---

# i18n Conventions

Use this skill for all i18n work in this Next.js App Router app. The app uses `next-intl` with locales `en` and `ar`, message files in `messages/`, pure routing config in `src/i18n/routing.ts`, navigation helpers in `src/i18n/navigation.ts`, and request config in `src/i18n/request.ts`.

## Workflow

1. Read the consuming page/component/helper plus `messages/en.json`, `messages/ar.json`, `src/i18n/routing.ts`, and any nearby provider layout before editing.
2. Search current usage with `rg -n "getTranslations|useTranslations|NextIntlClientProvider|messages=|useLocale" src`.
3. Prefer server-side translation with `getTranslations()` in Server Components, pages, metadata, and server helpers.
4. Use `useTranslations()` only in Client Components that truly need runtime translation access.
5. When a Client Component needs messages, add the smallest practical scoped `NextIntlClientProvider` from a Server Component boundary near that feature.
6. Add or update keys in both `messages/en.json` and `messages/ar.json` in the same change. Keep their structures identical.
7. Update locale-aware route slugs in `src/i18n/routing.ts` when adding public routes; use `Link`, `redirect`, `usePathname`, and `useRouter` from `@/i18n/navigation`.
8. Run `python .agents/skills/i18n-conventions/scripts/check_locale_keys.py messages/en.json messages/ar.json` after editing locale files.

## Project Shape

- `src/i18n/routing.ts` owns only supported locales, `defaultLocale`, and localized pathnames. Keep it middleware-safe and free of `createNavigation`.
- `src/i18n/navigation.ts` owns `createNavigation(routing)` and exports `Link`, `redirect`, `usePathname`, `useRouter`, and `getPathname`.
- `src/i18n/request.ts` resolves the active locale from `next/root-params`, validates it against `routing.locales`, and imports `messages/{locale}.json`.
- `src/app/[locale]/layout.tsx` is the root layout. Do not add `src/app/layout.tsx` above it, because `[locale]` must remain a Next root param. The locale layout sets `lang` and `dir`, exports `generateStaticParams()` for all locales, and provides intl context with `messages={null}`.
- The current starter pages use `HomePage`, `AboutPage`, and `ContactPage`. Preserve those namespaces for small edits to those existing pages. For new product work, use camelCase feature/workflow roots.

## Message Namespaces

- Use one top-level feature namespace per screen, workflow, or domain: `home`, `auth`, `productCatalog`, `checkout`, `accountSettings`.
- Use `common` for broadly reused copy: `common.actions`, `common.navigation`, `common.form`, `common.validation`, `common.status`, `common.plurals`.
- Keep feature-specific labels local to the feature instead of promoting them to `common` too early.
- Use `camelCase` for normal keys and group names.
- Keep backend enum tokens as keys when mapping backend values directly, e.g. `PENDING_REVIEW`.
- Do not add new flat `snake_case` roots or suffix-heavy keys such as `email_placeholder`.
- Do not store translated arrays as raw message JSON. Store stable item ids in code and translate each item by key.

Use these groups when they fit the UI:

- `title`, `description`, `subtitle`
- `navigation`, `tabs`, `filters`, `actions`
- `table`, `form`, `validation`
- `success`, `error`, `empty`

## Server And Client Usage

- In Server Components, use `const t = await getTranslations("namespace")`.
- In locale route pages/layouts, do not plumb `params` or call `setRequestLocale`. Use `getLocale()` only when the locale value itself is needed.
- Pass translated strings into Client Components as props when the client only needs interactivity.
- In Client Components, call `useTranslations("namespace")` only after ensuring a provider ancestor supplies that namespace.
- Do not import `messages/*.json` from Client Components.
- Do not make a root full-message provider the dependency for new client hooks.
- Do not import `next/root-params` into Client Components, Route Handlers, Server Actions, or middleware-bound modules.

## Scoped Client Providers

Default order:

1. Translate on the server and pass strings down.
2. Split the interactive part smaller so most copy stays server-rendered.
3. Add a nested `NextIntlClientProvider` with only the namespaces the client subtree needs.
4. Use a full-message provider only as a temporary migration bridge while auditing existing client translation consumers.

The locale root provider uses `messages={null}`. New client-translated features must add a scoped provider near the route or feature boundary with only the namespaces needed by that subtree.

Nested `NextIntlClientProvider` props are atomic. `messages` do not deep-merge automatically across nested providers, so include every namespace needed by the child subtree in the scoped provider.

Prefer this shape from a Server Component boundary:

```tsx
const messages = await getMessages()

return (
  <NextIntlClientProvider
    messages={{
      checkout: messages.checkout,
      common: {
        actions: messages.common.actions,
        form: messages.common.form,
      },
    }}
  >
    <CheckoutClient />
  </NextIntlClientProvider>
)
```

## Message Authoring

- Prefer complete ICU messages over assembling grammar in code.
- Use `plural` for counts and always include `other`.
- Use `select` for enum/state branching and always include `other`.
- Use `selectordinal` for rankings and ordered positions.
- Use `t.rich` for React elements inside translated text.
- Use `t.raw` only for trusted structured data or sanitized content; do not add raw HTML copy for normal UI.
- Write Arabic as natural Arabic, not as a word-for-word English mirror. Keep the same keys in both files.

## Forms And Validation

Prefer field objects:

```json
"form": {
  "email": {
    "label": "Email",
    "placeholder": "Enter your email",
    "description": "Use the address you check most often.",
    "validation": {
      "required": "Email is required."
    }
  },
  "submit": "Continue",
  "success": "Saved successfully."
}
```

Use feature-level `validation` for cross-field rules and schema messages shared by multiple fields.

## Arabic And RTL

- Keep `dir={locale === "ar" ? "rtl" : "ltr"}` behavior intact in the locale layout.
- Use CSS logical properties for spacing and alignment when a component must work in both directions.
- Mirror directional icons intentionally; do not mirror icons whose meaning is not directional.
- Avoid concatenating translated fragments. Arabic often needs a different sentence order.

## Verification

After locale edits:

```powershell
python .agents/skills/i18n-conventions/scripts/check_locale_keys.py messages/en.json messages/ar.json
```

After code edits:

```powershell
pnpm typecheck
pnpm lint
```

For visible UI changes, inspect both `/en/...` and `/ar/...` and verify text fit, direction, localized links, and provider coverage.

## References

- [Message patterns](references/message-patterns.md)
- `scripts/check_locale_keys.py`
