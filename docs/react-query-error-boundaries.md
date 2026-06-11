# React Query Error Boundaries

This project uses TanStack Query v5, `react-error-boundary`, and the custom API mutator in `src/api/mutator/custom-instance.ts`.

## Runtime Setup

`src/app/[locale]/layout.tsx` wraps the app with `QueryProvider`, which installs the browser `QueryClient` used by generated Orval hooks. The provider may render during SSR, but server data fetching should use the direct generated request functions described in `docs/orval-react-query-client.md`.

Default query behavior lives in `src/components/query-provider.tsx`:

- Queries retry at most twice.
- 408, 429, 5xx, and unknown network failures are retried.
- 4xx API errors are not retried.
- 5xx and unknown network failures are thrown to the nearest error boundary.
- 4xx errors stay in the query result so forms and auth flows can render local messages.
- Mutations do not retry by default and do not throw to boundaries by default.

## Boundary Layers

Use the right boundary for the failure scope:

- `src/app/[locale]/error.tsx` handles uncaught render/server errors for localized route content.
- `src/app/global-error.tsx` handles root layout failures and must stay self-contained.
- `QueryErrorBoundary` handles a local client data region and resets failed React Query state.

Prefer a local `QueryErrorBoundary` around dashboards, lists, panels, and widgets that can recover independently. Let route `error.tsx` catch broader page-level failures.

## Local Query Boundary

Wrap the component that calls generated query hooks from the outside:

```tsx
"use client"

import { QueryErrorBoundary } from "@/components/query-error-boundary"
import { ProductList } from "./product-list"

export function ProductListPanel() {
  return (
    <QueryErrorBoundary resetKeys={["products"]}>
      <ProductList />
    </QueryErrorBoundary>
  )
}
```

Do not place the boundary inside `ProductList` if `ProductList` is the component that calls the query hook. A boundary only catches errors thrown by children during render.

## Generated Hook Errors

Generated hooks use `ApiRequestError` as their error type. Handle expected 4xx states locally:

```tsx
"use client"

import { useProductsControllerAll } from "@/api/generated/react-query/products"
import { getApiErrorStatus } from "@/lib/api-error"

export function ProductList() {
  const query = useProductsControllerAll({ page: 1, limit: 20 })

  if (query.isPending) {
    return <ProductListSkeleton />
  }

  if (query.isError) {
    const status = getApiErrorStatus(query.error)

    if (status === 404) {
      return <EmptyProducts />
    }

    if (status && status < 500) {
      return <RequestErrorMessage status={status} />
    }

    throw query.error
  }

  return <Products items={query.data.data.items} />
}
```

The explicit `throw query.error` is only needed when you override query defaults or want to escalate a specific local branch.

## Custom Fallbacks

Use a custom fallback when a panel needs domain-specific copy or layout:

```tsx
<QueryErrorBoundary
  fallback={(error, reset) => (
    <ErrorState
      title="Products could not load"
      description="Refresh this panel without leaving the page."
      actionLabel="Reload products"
      onAction={reset}
      detail={process.env.NODE_ENV === "development" ? error.message : undefined}
    />
  )}
>
  <ProductList />
</QueryErrorBoundary>
```

The default fallback intentionally hides raw error messages in production.

## Mutations

Keep mutation errors close to the form or action that caused them:

```tsx
const login = useAuthControllerLogin({
  mutation: {
    onError(error) {
      const status = getApiErrorStatus(error)

      if (status === 401) {
        form.setError("email", { message: "Invalid email or password" })
      }
    },
  },
})
```

Use mutation `throwOnError` only for unexpected failures that should leave the local form flow:

```tsx
const save = useProductsControllerAdd({
  mutation: {
    throwOnError: (error) => !getApiErrorStatus(error),
  },
})
```

## Next.js Errors

`redirect()`, `notFound()`, `permanentRedirect()`, and request-time APIs can throw framework-controlled errors. Do not swallow them in broad catch blocks. If a catch block may receive both app errors and Next framework errors, call `unstable_rethrow(error)` first.

```tsx
import { notFound, unstable_rethrow } from "next/navigation"

try {
  const product = await getProduct()

  if (!product) {
    notFound()
  }
} catch (error) {
  unstable_rethrow(error)
  throw error
}
```
