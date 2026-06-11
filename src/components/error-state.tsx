"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { Button } from "./ui/button"

interface ErrorStateProps {
  title: string
  description: string
  actionLabel?: string
  detail?: string
  children?: ReactNode
  className?: string
  onAction?: () => void
}

export function ErrorState({
  title,
  description,
  actionLabel,
  detail,
  children,
  className,
  onAction,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex w-full max-w-md flex-col items-center justify-center gap-4 rounded-md border border-destructive/20 bg-background p-6 text-center shadow-sm",
        className
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle aria-hidden="true" className="size-5" />
      </div>
      <div className="space-y-2">
        <h2 className="font-semibold text-foreground text-lg">{title}</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
        {detail ? (
          <p className="break-all rounded-md bg-muted px-2 py-1 font-mono text-muted-foreground text-xs">
            {detail}
          </p>
        ) : null}
      </div>
      {children}
      {onAction && actionLabel ? (
        <Button type="button" onClick={onAction}>
          <RefreshCw aria-hidden="true" />
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
