"use client"

import { useEffect } from "react"

import { ErrorState } from "@/components/error-state"
import "./globals.css"

interface GlobalErrorProps {
  error: Error & { digest?: string }
  unstable_retry: () => void
}

export default function GlobalError({
  error,
  unstable_retry,
}: GlobalErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <title>Something went wrong</title>
        <main className="flex min-h-svh items-center justify-center bg-background p-6 text-foreground">
          <ErrorState
            title="Something went wrong"
            description="The application could not finish loading. Try again in a moment."
            actionLabel="Try again"
            detail={
              error.digest ? `Error reference: ${error.digest}` : undefined
            }
            onAction={unstable_retry}
          />
        </main>
      </body>
    </html>
  )
}
