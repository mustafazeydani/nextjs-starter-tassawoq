# Message Patterns

Use this reference for concrete examples after loading the `i18n-conventions` skill.

## Namespace Decisions

Use a feature namespace when copy belongs to one screen or workflow:

```json
"checkout": {
  "title": "Checkout",
  "description": "Review your order and payment details.",
  "form": {
    "submit": "Place order"
  }
}
```

Use `common` only when copy is clearly shared:

```json
"common": {
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "status": {
    "ACTIVE": "Active",
    "INACTIVE": "Inactive"
  }
}
```

If only one feature uses a status label, keep it local:

```json
"merchantRequests": {
  "status": {
    "PENDING_REVIEW": "Pending review",
    "APPROVED": "Approved",
    "REJECTED": "Rejected"
  }
}
```

## Page Shape

Start with the smallest useful shape and remove sections that do not apply:

```json
"featureName": {
  "title": "Feature title",
  "description": "Optional page description.",
  "tabs": {
    "overview": "Overview",
    "history": "History"
  },
  "filters": {
    "search": {
      "placeholder": "Search by name"
    }
  },
  "table": {
    "name": "Name",
    "status": "Status",
    "createdAt": "Created"
  },
  "form": {
    "createTitle": "Create item",
    "editTitle": "Edit item",
    "submit": "Create",
    "saveChanges": "Save changes",
    "name": {
      "label": "Name",
      "placeholder": "Enter a name"
    }
  },
  "empty": {
    "title": "No items found.",
    "description": "Try adjusting your filters."
  },
  "success": {
    "create": "Created successfully.",
    "update": "Updated successfully."
  },
  "error": {
    "load": "Could not load items."
  }
}
```

## Server Translation

Use `getTranslations` in pages and Server Components:

```tsx
import { getTranslations, setRequestLocale } from "next-intl/server"

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations("checkout")

  return <h1>{t("title")}</h1>
}
```

Pass strings to Client Components when possible:

```tsx
const t = await getTranslations("checkout.form")

return (
  <CheckoutButton
    label={t("submit")}
    pendingLabel={t("submitting")}
  />
)
```

## Scoped Client Providers

Use a scoped provider when a Client Component needs `useTranslations()` for stateful or repeated UI.

Server boundary:

```tsx
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"

import { CheckoutClient } from "./checkout-client"

export default async function CheckoutSection() {
  const messages = await getMessages()

  return (
    <NextIntlClientProvider
      messages={{
        checkout: messages.checkout,
        common: {
          actions: messages.common.actions,
        },
      }}
    >
      <CheckoutClient />
    </NextIntlClientProvider>
  )
}
```

Client child:

```tsx
"use client"

import { useTranslations } from "next-intl"

export function CheckoutClient() {
  const t = useTranslations("checkout")
  const actions = useTranslations("common.actions")

  return <button type="button">{actions("save")}</button>
}
```

Provider scope tips:

- Scope by route, section, or feature island.
- Include all namespaces used by the client subtree.
- Keep `common` slices narrow when possible.
- Avoid wrapping the whole app with all messages for one small interactive component.

## ICU Messages

Prefer one ICU message over branching in code:

```json
"resultsFound": "{count, plural, =0 {No results found} one {# result found} other {# results found}}",
"step": "{place, selectordinal, one {#st step} two {#nd step} few {#rd step} other {#th step}}",
"approval": "{status, select, APPROVED {Approved} REJECTED {Rejected} other {Pending review}}"
```

Use it directly:

```tsx
t("resultsFound", { count })
t("approval", { status })
```

Avoid:

```tsx
count === 1 ? t("oneResult") : t("manyResults", { count })
status === "APPROVED" ? t("approved") : t("pending")
```

## Rich Text

Use `t.rich` when translated copy contains React elements:

```json
"terms": "By continuing, you agree to the <terms>terms</terms>."
```

```tsx
t.rich("terms", {
  terms: (chunks) => <Link href="/terms">{chunks}</Link>,
})
```

Do not use `dangerouslySetInnerHTML` for normal translated copy.

## Stable Lists

Prefer stable ids in code:

```tsx
const items = ["inventory", "payments", "shipping"] as const

return items.map((item) => (
  <li key={item}>{t(`features.${item}`)}</li>
))
```

With messages:

```json
"features": {
  "inventory": "Inventory management",
  "payments": "Payments",
  "shipping": "Shipping"
}
```

Avoid storing an array of translated strings with no stable ids.

## Route Pathnames

When adding a localized public route:

1. Add the route file under `src/app/[locale]/...`.
2. Add the pathname to `src/i18n/routing.ts`.
3. Use `Link` from `@/i18n/routing`.
4. Keep route slugs in routing config, not in message JSON.

Example:

```ts
pathnames: {
  "/merchant-requests": {
    en: "/merchant-requests",
    ar: "/merchant-requests",
  },
}
```

## Verification Checklist

- `messages/en.json` and `messages/ar.json` parse as JSON.
- The locale checker reports matching key structure.
- Server code uses `getTranslations`; client code uses `useTranslations` only with provider coverage.
- New client providers pass only the needed namespace slices.
- Locale-aware links use `@/i18n/routing`.
- Arabic pages render with `dir="rtl"` and no awkward concatenated fragments.
