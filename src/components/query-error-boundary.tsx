"use client"

import { QueryErrorResetBoundary } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { getApiErrorStatus } from "@/lib/api-error"
import { ErrorState } from "./error-state"

interface Props {
  children: ReactNode
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode)
  resetKeys?: unknown[]
}

export function QueryErrorBoundary({ children, fallback, resetKeys }: Props) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          resetKeys={resetKeys}
          fallbackRender={({ error, resetErrorBoundary }) => {
            const errorInstance =
              error instanceof Error ? error : new Error(String(error))
            const status = getApiErrorStatus(errorInstance)
            const detail =
              process.env.NODE_ENV === "development"
                ? errorInstance.message
                : undefined

            if (typeof fallback === "function") {
              return fallback(errorInstance, resetErrorBoundary)
            }
            if (fallback) {
              return fallback
            }
            return (
              <ErrorState
                title="Unable to load data"
                description={
                  status
                    ? `The request failed with status ${status}.`
                    : "The request failed before the server returned a response."
                }
                actionLabel="Try again"
                detail={detail}
                onAction={resetErrorBoundary}
              />
            )
          }}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
