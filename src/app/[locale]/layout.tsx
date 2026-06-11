import { Geist_Mono, Inter } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"

import "../globals.css"
import { QueryProvider } from "@/components/query-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { DirectionProvider } from "@/components/ui/direction"
import { routing } from "@/i18n/routing"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

interface LocaleLayoutProps {
  children: React.ReactNode
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children }: LocaleLayoutProps) {
  const locale = await getLocale()
  const messages = await getMessages()
  const direction = locale === "ar" ? "rtl" : "ltr"
  const clientMessages = {
    common: {
      errorBoundary: messages.common.errorBoundary,
    },
  }

  return (
    <html
      lang={locale}
      dir={direction}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <DirectionProvider direction={direction}>
          <NextIntlClientProvider messages={clientMessages}>
            <QueryProvider>
              <ThemeProvider>{children}</ThemeProvider>
            </QueryProvider>
          </NextIntlClientProvider>
        </DirectionProvider>
      </body>
    </html>
  )
}
