import { getLocale, getTranslations } from "next-intl/server"

import { LocaleSwitcher } from "@/components/locale-switcher"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"

export default async function Page() {
  const t = await getTranslations("HomePage")
  const locale = (await getLocale()) as Locale
  const localeSwitcherT = await getTranslations("common.localeSwitcher")
  const localeSwitcherLabels = {
    englishShort: localeSwitcherT("englishShort"),
    arabicShort: localeSwitcherT("arabicShort"),
    switchToEnglish: localeSwitcherT("switchToEnglish"),
    switchToArabic: localeSwitcherT("switchToArabic"),
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6 text-foreground transition-all duration-300">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-lg border border-border bg-card p-8 shadow-lg transition-shadow hover:shadow-xl">
        <div className="flex items-center justify-between border-border border-b pb-4">
          <h1 className="font-bold text-xl tracking-tight">{t("title")}</h1>
          <LocaleSwitcher
            href="/"
            labels={localeSwitcherLabels}
            locale={locale}
          />
        </div>

        <div className="flex flex-col gap-3 text-start text-muted-foreground text-sm leading-relaxed">
          <p>{t("description")}</p>
          <p>{t("description2")}</p>
          <Button className="mt-2 w-full font-medium">{t("buttonText")}</Button>
        </div>

        <div className="flex flex-col gap-4 border-border border-t pt-4">
          <div className="flex flex-wrap gap-4 font-medium text-xs">
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
