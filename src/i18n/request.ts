import { notFound } from "next/navigation"
import * as rootParams from "next/root-params"
import { getRequestConfig } from "next-intl/server"

import { type Locale, routing } from "./routing"

function isLocale(value: string | undefined): value is Locale {
  return routing.locales.includes(value as Locale)
}

async function resolveRequestLocale(locale: string | undefined) {
  if (isLocale(locale)) {
    return locale
  }

  const paramValue = await rootParams.locale()

  if (isLocale(paramValue)) {
    return paramValue
  }

  notFound()
}

export default getRequestConfig(async ({ locale }) => {
  const requestLocale = await resolveRequestLocale(locale)

  return {
    locale: requestLocale,
    messages: (await import(`../../messages/${requestLocale}.json`)).default,
  }
})
