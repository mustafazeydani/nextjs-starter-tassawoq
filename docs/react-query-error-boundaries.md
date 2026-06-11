# React Query Error Boundaries Convention

This document outlines the standard guidelines and patterns for handling data-fetching and query errors in this project using TanStack Query (React Query) v5 and the custom `QueryErrorBoundary` component.

## Why Use Error Boundaries for Queries?

Network calls can fail for a variety of reasons (server errors, client offline, rate limits). Instead of allowing failing network calls to crash the entire page layout or silently fail leaving loading spinners forever, we use React Error Boundaries to catch these errors and display localized recovery options.

---

## The `QueryErrorBoundary` Component

We have implemented a reusable wrapper component: **`QueryErrorBoundary`** (located at `src/components/query-error-boundary.tsx`).

This component wraps React Query's `<QueryErrorResetBoundary>` and the `ErrorBoundary` from the `react-error-boundary` library. When an error is caught:
1. It displays a fallback UI (either default or customized).
2. It provides a "Try Again" recovery action.
3. When clicked, it automatically resets the query cache for the affected query keys, allowing the query to retry fetching clean.

---

## Guidelines and Conventions

### 1. Enable `throwOnError: true`
By default, React Query swallows query errors and returns them in the `error` state. To propagate errors up to the Error Boundary, you **must** configure `throwOnError: true` on the query hook (or use a dynamic callback function).

```tsx
import { useQuery } from "@tanstack/react-query"

// Inside your client component:
const { data } = useQuery({
  queryKey: ["userData"],
  queryFn: fetchUserData,
  
  // Enforce error propagation to Error Boundary
  throwOnError: true 
})
```

*Note: If you are using React Query's `useSuspenseQuery`, `throwOnError: true` is enabled by default.*

---

### 2. Selective Error Propagation (Optional)
If you only want certain types of errors (e.g. 5xx Server Errors) to trigger the Error Boundary while handling 4xx Validation Errors locally, pass a validation function to `throwOnError`:

```tsx
const { data } = useQuery({
  queryKey: ["userData"],
  queryFn: fetchUserData,
  throwOnError: (error: any) => {
    // Only crash/show boundary for Server Errors
    return error.response?.status >= 500
  }
})
```

---

### 3. Wrap Components with `<QueryErrorBoundary>`
Wrap components executing network hooks inside the `<QueryErrorBoundary>`. Ensure the boundary wraps the components containing the hooks, **not** inside the component itself.

#### Recommended Structure:

```tsx
import { QueryErrorBoundary } from "@/components/query-error-boundary"
import { UserProfile } from "./user-profile"

export function Dashboard() {
  return (
    <div className="dashboard-layout">
      <h1>Dashboard</h1>
      
      {/* Catch errors from UserProfile query hooks */}
      <QueryErrorBoundary>
        <UserProfile />
      </QueryErrorBoundary>
    </div>
  )
}
```

---

### 4. Provide Custom Fallbacks (Optional)
You can customize the error fallback interface by passing a `fallback` prop, which can be custom JSX or a function returning JSX with the error and reset callback:

```tsx
<QueryErrorBoundary
  fallback={(error, reset) => (
    <div className="alert alert-danger">
      <h4>Failed to load dashboard data</h4>
      <p>{error.message}</p>
      <button onClick={reset}>Reload Data</button>
    </div>
  )}
>
  <UserProfile />
</QueryErrorBoundary>
```
