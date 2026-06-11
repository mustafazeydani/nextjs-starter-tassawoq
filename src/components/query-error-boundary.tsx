"use client"

import { QueryErrorResetBoundary } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { Button } from "./ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode)
}

export function QueryErrorBoundary({ children, fallback }: Props) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => {
            const errorInstance =
              error instanceof Error ? error : new Error(String(error))

            if (typeof fallback === "function") {
              return fallback(errorInstance, resetErrorBoundary)
            }
            if (fallback) {
              return fallback
            }
            return (
              <div className="flex max-w-sm flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
                <p className="font-semibold text-destructive text-sm">
                  Something went wrong fetching data.
                </p>
                <p className="break-all text-muted-foreground text-xs">
                  {errorInstance.message}
                </p>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={resetErrorBoundary}
                >
                  Try Again
                </Button>
              </div>
            )
          }}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
