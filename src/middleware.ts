import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

export default createMiddleware(routing)

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - API routes (/api)
    // - Static files under public
    // - Next.js internal folders (_next, _vercel)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
}
