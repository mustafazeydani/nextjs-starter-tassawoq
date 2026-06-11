"use client"

import { QueryErrorResetBoundary } from "@tanstack/react-query"
import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "./ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode)
}

interface State {
  hasError: boolean
  error: Error | null
}

class BaseErrorBoundary extends Component<
  Props & { resetQuery: () => void },
  State
> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  private handleReset = () => {
    this.props.resetQuery()
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError && this.state.error) {
      if (typeof this.props.fallback === "function") {
        return this.props.fallback(this.state.error, this.handleReset)
      }
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div className="flex max-w-sm flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="font-semibold text-destructive text-sm">
            Something went wrong fetching data.
          </p>
          <p className="break-all text-muted-foreground text-xs">
            {this.state.error.message}
          </p>
          <Button size="sm" variant="destructive" onClick={this.handleReset}>
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

export function QueryErrorBoundary({ children, fallback }: Props) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <BaseErrorBoundary resetQuery={reset} fallback={fallback}>
          {children}
        </BaseErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
