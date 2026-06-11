import { Xior, type XiorError, type XiorRequestConfig } from "xior"
import { env } from "@/lib/env"

export const apiInstance = Xior.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

const isBrowser = () => typeof window !== "undefined"

const getBrowserCookieValue = (name: string): string | null => {
  if (!isBrowser()) {
    return null
  }
  const encodedName = `${encodeURIComponent(name)}=`
  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(encodedName))

  if (!cookie) {
    return null
  }
  return decodeURIComponent(cookie.slice(encodedName.length))
}

const getContentLanguageHeader = async (): Promise<string> => {
  const LOCALE_COOKIE = "NEXT_LOCALE"
  if (isBrowser()) {
    return getBrowserCookieValue(LOCALE_COOKIE) || "en"
  }

  try {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    return cookieStore.get(LOCALE_COOKIE)?.value || "en"
  } catch {
    return "en"
  }
}

apiInstance.interceptors.request.use(async (config) => {
  const contentLanguage = await getContentLanguageHeader()
  const headers = { ...config.headers }

  return {
    ...config,
    headers: {
      ...headers,
      "Content-Language": contentLanguage,
    },
  }
})

export const customInstance = async <T>(
  config: XiorRequestConfig,
  options?: XiorRequestConfig
): Promise<T> => {
  const mergedHeaders = {
    ...config.headers,
    ...options?.headers,
  }
  const mergedData = options?.data ?? config.data

  const response = await apiInstance.request<T>({
    ...config,
    ...options,
    data: mergedData,
    credentials: options?.credentials ?? config.credentials ?? "include",
    headers: mergedHeaders,
  })

  return response.data
}

export type ErrorType<Error> = XiorError<Error>
