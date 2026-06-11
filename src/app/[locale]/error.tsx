"use client"

import { useTranslations } from "next-intl"
import { useEffect } from "react"

import { ErrorState } from "@/components/error-state"

interface LocaleErrorProps {
  error: Error & { digest?: string }
  unstable_retry: () => void
}

export default function LocaleError({
  error,
  unstable_retry,
}: LocaleErrorProps) {
  const t = useTranslations("common.errorBoundary")

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6 text-foreground">
      <ErrorState
        title={t("title")}
        description={t("description")}
        actionLabel={t("retry")}
        detail={
          error.digest ? t("digest", { digest: error.digest }) : undefined
        }
        onAction={unstable_retry}
      />
    </main>
  )
}
