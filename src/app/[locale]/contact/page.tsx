import { getLocale, getTranslations } from "next-intl/server"

import { LocaleSwitcher } from "@/components/locale-switcher"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"

export default async function ContactPage() {
  const t = await getTranslations("ContactPage")
  const locale = (await getLocale()) as Locale
  const localeSwitcherT = await getTranslations("common.localeSwitcher")
  const localeSwitcherLabels = {
    englishShort: localeSwitcherT("englishShort"),
    arabicShort: localeSwitcherT("arabicShort"),
    switchToEnglish: localeSwitcherT("switchToEnglish"),
    switchToArabic: localeSwitcherT("switchToArabic"),
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6 text-foreground">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-border bg-card p-8 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-bold text-xl tracking-tight">{t("title")}</h1>
          <LocaleSwitcher
            href="/contact"
            labels={localeSwitcherLabels}
            locale={locale}
          />
        </div>
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
