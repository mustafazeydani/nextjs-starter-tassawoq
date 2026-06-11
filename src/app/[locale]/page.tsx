import { getLocale, getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"

export default async function Page() {
  const locale = await getLocale()
  const t = await getTranslations("HomePage")
  const nextLocale = locale === "en" ? "ar" : "en"

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6 text-foreground transition-all duration-300">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-2xl border border-border bg-card p-8 shadow-lg transition-transform hover:scale-[1.01] hover:shadow-xl">
        <div className="flex items-center justify-between border-border border-b pb-4">
          <h1 className="font-bold text-xl tracking-tight">{t("title")}</h1>
          <Link
            href="/"
            locale={nextLocale}
            className="rounded-full border border-primary px-2.5 py-1 font-semibold text-primary text-xs transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
          >
            {t("switchLocale")}
          </Link>
        </div>

        <div className="flex flex-col gap-3 text-muted-foreground text-sm leading-relaxed">
          <p>{t("description")}</p>
          <p>{t("description2")}</p>
          <Button className="mt-2 w-full font-medium">{t("buttonText")}</Button>
        </div>

        <div className="flex flex-col gap-4 border-border border-t pt-4">
          <div className="flex gap-4 font-medium text-xs">
            <Link
              href="/about"
              className="underline underline-offset-4 transition-colors hover:text-primary"
            >
              {t("aboutLink")}
            </Link>
            <Link
              href="/contact"
              className="underline underline-offset-4 transition-colors hover:text-primary"
            >
              {t("contactLink")}
            </Link>
          </div>

          <div className="font-mono text-[10px] text-muted-foreground/80">
            {t("toggleMode")}
          </div>
        </div>
      </div>
    </div>
  )
}
