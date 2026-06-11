import { getTranslations } from "next-intl/server"

import { Link } from "@/i18n/navigation"

export default async function ContactPage() {
  const t = await getTranslations("ContactPage")

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6 text-foreground">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-border bg-card p-8 shadow-lg">
        <h1 className="font-bold text-xl tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {t("description")}
        </p>
        <Link
          href="/"
          className="mt-2 font-semibold text-primary text-xs hover:underline"
        >
          {t("homeLink")}
        </Link>
      </div>
    </div>
  )
}
