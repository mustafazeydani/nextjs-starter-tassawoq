import { LanguagesIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import type { Locale, Pathnames } from "@/i18n/routing"

interface LocaleSwitcherProps {
  href: Pathnames
  labels: {
    englishShort: string
    arabicShort: string
    switchToEnglish: string
    switchToArabic: string
  }
  locale: Locale
}

function LocaleSwitcher({ href, labels, locale }: LocaleSwitcherProps) {
  const nextLocale = locale === "ar" ? "en" : "ar"

  return (
    <Button asChild variant="outline" size="sm">
      <Link
        href={href}
        hrefLang={nextLocale}
        locale={nextLocale}
        aria-label={
          nextLocale === "ar" ? labels.switchToArabic : labels.switchToEnglish
        }
      >
        <LanguagesIcon aria-hidden="true" data-icon="inline-start" />
        {nextLocale === "ar" ? labels.arabicShort : labels.englishShort}
      </Link>
    </Button>
  )
}

export { LocaleSwitcher }
