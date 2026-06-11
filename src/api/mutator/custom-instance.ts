import { Xior, type XiorRequestConfig } from "xior"
import { env } from "@/lib/env"

const ACCESS_TOKEN_COOKIE = "accessToken"
const REFRESH_TOKEN_COOKIE = "refreshToken"
const LOCALE_COOKIE = "NEXT_LOCALE"
const REFRESH_ENDPOINT = "/api/v1/auth/refresh"
const LOGOUT_ENDPOINT = "/api/v1/auth/logout"
const AUTH_ENDPOINT_PREFIX = "/api/v1/auth/"
const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

type HeaderRecord = Record<string, string>

type NextFetchOptions = {
  revalidate?: number | false
  tags?: string[]
}

type BackendErrorEnvelope<ErrorData = unknown> = {
  success?: false
  error?: {
    name?: string
    statusCode?: number
    errorCode?: string | null
    message?: unknown
    errors?: ErrorData
    data?: ErrorData
    authTag?: string
  }
  message?: unknown
  data?: ErrorData
  statusCode?: number
}

type AuthTokenPair = {
  accessToken?: string | null
  refreshToken?: string | null
}

type AuthTokenResponse = {
  data?: AuthTokenPair
}

export type ApiRequestOptions = XiorRequestConfig & {
  /**
   * Set to false for explicitly public/cacheable server requests. When false,
   * the mutator will not read or forward request cookies.
   */
  auth?: boolean
  skipAuthRefresh?: boolean
  cache?: RequestCache
  next?: NextFetchOptions
}

export class ApiRequestError<ErrorData = unknown> extends Error {
  readonly status?: number
  readonly statusCode?: number
  readonly errorCode?: string | null
  readonly authTag?: string
  readonly data?: ErrorData
  readonly payload?: unknown
  readonly method?: string
  readonly url?: string
  readonly isAuthError: boolean
  readonly cause?: unknown

  constructor(input: {
    message: string
    status?: number
    errorCode?: string | null
    authTag?: string
    data?: ErrorData
    payload?: unknown
    method?: string
    url?: string
    isAuthError?: boolean
    cause?: unknown
  }) {
    super(input.message)
    this.name = "ApiRequestError"
    this.status = input.status
    this.statusCode = input.status
    this.errorCode = input.errorCode
    this.authTag = input.authTag
    this.data = input.data
    this.payload = input.payload
    this.method = input.method
    this.url = input.url
    this.isAuthError = input.isAuthError ?? false
    this.cause = input.cause
    Object.setPrototypeOf(this, ApiRequestError.prototype)
  }
}

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const toPlainHeaders = (...sources: unknown[]): HeaderRecord => {
  const headers: HeaderRecord = {}

  for (const source of sources) {
    if (!source) {
      continue
    }

    if (typeof Headers !== "undefined" && source instanceof Headers) {
      source.forEach((value, key) => {
        headers[key] = value
      })
      continue
    }

    if (Array.isArray(source)) {
      for (const [key, value] of source) {
        if (value !== undefined && value !== null) {
          headers[String(key)] = String(value)
        }
      }
      continue
    }

    if (isRecord(source)) {
      for (const [key, value] of Object.entries(source)) {
        if (value !== undefined && value !== null) {
          headers[key] = String(value)
        }
      }
    }
  }

  return headers
}

const findHeaderKey = (headers: HeaderRecord, name: string) =>
  Object.keys(headers).find((key) => key.toLowerCase() === name.toLowerCase())

const hasHeader = (headers: HeaderRecord, name: string) =>
  Boolean(findHeaderKey(headers, name))

const getHeader = (headers: HeaderRecord, name: string) => {
  const key = findHeaderKey(headers, name)
  return key ? headers[key] : undefined
}

const setHeader = (headers: HeaderRecord, name: string, value: string) => {
  const existingKey = findHeaderKey(headers, name)

  if (existingKey) {
    headers[existingKey] = value
    return
  }

  headers[name] = value
}

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

const getServerCookieStore = async () => {
  if (isBrowser()) {
    return null
  }

  try {
    const { cookies } = await import("next/headers")
    return await cookies()
  } catch {
    return null
  }
}

const getServerCookieHeader = async (): Promise<string | null> => {
  const cookieStore = await getServerCookieStore()

  if (!cookieStore) {
    return null
  }

  const cookies = cookieStore.getAll()

  if (cookies.length === 0) {
    return null
  }

  return cookies
    .map(({ name, value }) => `${name}=${encodeURIComponent(value)}`)
    .join("; ")
}

const getServerCookieValue = async (name: string): Promise<string | null> => {
  const cookieStore = await getServerCookieStore()
  return cookieStore?.get(name)?.value ?? null
}

const getContentLanguageHeader = async (): Promise<string> => {
  if (isBrowser()) {
    return getBrowserCookieValue(LOCALE_COOKIE) || "en"
  }

  return (await getServerCookieValue(LOCALE_COOKIE)) || "en"
}

const getPathname = (url?: string) => {
  if (!url) {
    return ""
  }

  try {
    return new URL(url, env.NEXT_PUBLIC_API_URL).pathname
  } catch {
    return url.split("?")[0] ?? url
  }
}

const isAuthEndpoint = (url?: string) =>
  getPathname(url).startsWith(AUTH_ENDPOINT_PREFIX)

const toDisplayMessage = (message: unknown): string | null => {
  if (typeof message === "string" && message.trim()) {
    return message
  }

  if (Array.isArray(message) && message.length > 0) {
    return "Validation failed"
  }

  return null
}

const getBackendError = <ErrorData>(
  payload: unknown
): BackendErrorEnvelope<ErrorData>["error"] => {
  if (!isRecord(payload) || !isRecord(payload.error)) {
    return undefined
  }

  return payload.error as BackendErrorEnvelope<ErrorData>["error"]
}

const getPayloadData = <ErrorData>(payload: unknown): ErrorData | undefined => {
  const error = getBackendError<ErrorData>(payload)

  if (error?.errors !== undefined) {
    return error.errors
  }

  if (error?.data !== undefined) {
    return error.data
  }

  if (isRecord(payload) && payload.data !== undefined) {
    return payload.data as ErrorData
  }

  return undefined
}

const getResponseStatus = (error: unknown): number | undefined => {
  if (!isRecord(error)) {
    return undefined
  }

  const response = error.response

  if (isRecord(response) && typeof response.status === "number") {
    return response.status
  }

  if (typeof error.status === "number") {
    return error.status
  }

  return undefined
}

const getResponsePayload = (error: unknown): unknown => {
  if (!isRecord(error)) {
    return undefined
  }

  const response = error.response

  if (isRecord(response) && "data" in response) {
    return response.data
  }

  return undefined
}

const getErrorMessage = (error: unknown, payload: unknown) => {
  const backendError = getBackendError(payload)

  return (
    toDisplayMessage(backendError?.message) ||
    (isRecord(payload) ? toDisplayMessage(payload.message) : null) ||
    (error instanceof Error ? error.message : null) ||
    "Request failed"
  )
}

const isRetryableAuthFailure = (status?: number, payload?: unknown) => {
  const backendError = getBackendError(payload)
  const message = toDisplayMessage(backendError?.message)
  const errorCode = backendError?.errorCode

  if (status === 401) {
    return true
  }

  if (status !== 403) {
    return false
  }

  return (
    errorCode === "AUTH_TOKEN_INVALID" ||
    backendError?.authTag === "AUTH" ||
    backendError?.authTag === "authorization_failed" ||
    message === "Forbidden"
  )
}

const createApiRequestError = <ErrorData>(
  error: unknown,
  request: ApiRequestOptions
) => {
  const payload = getResponsePayload(error)
  const backendError = getBackendError<ErrorData>(payload)
  const status = getResponseStatus(error) ?? backendError?.statusCode

  return new ApiRequestError<ErrorData>({
    message: getErrorMessage(error, payload),
    status,
    errorCode: backendError?.errorCode,
    authTag: backendError?.authTag,
    data: getPayloadData<ErrorData>(payload),
    payload,
    method: request.method,
    url: request.url,
    isAuthError: isRetryableAuthFailure(status, payload),
    cause: error,
  })
}

const mergeRequestConfigs = (
  config: ApiRequestOptions,
  options?: ApiRequestOptions
): ApiRequestOptions => ({
  ...config,
  ...options,
  data: options?.data ?? config.data,
  credentials: options?.credentials ?? config.credentials ?? "include",
  cache: options?.cache ?? config.cache ?? "no-store",
  headers: toPlainHeaders(config.headers, options?.headers),
})

const withRequestContext = async (
  config: ApiRequestOptions
): Promise<ApiRequestOptions> => {
  const headers = toPlainHeaders(config.headers)
  const shouldUseAuth = config.auth !== false

  if (!hasHeader(headers, "Content-Language")) {
    setHeader(
      headers,
      "Content-Language",
      shouldUseAuth ? await getContentLanguageHeader() : "en"
    )
  }

  if (!hasHeader(headers, "Accept-Language")) {
    setHeader(
      headers,
      "Accept-Language",
      getHeader(headers, "Content-Language") ?? "en"
    )
  }

  if (!isBrowser() && shouldUseAuth) {
    if (!hasHeader(headers, "Cookie")) {
      const cookieHeader = await getServerCookieHeader()

      if (cookieHeader) {
        setHeader(headers, "Cookie", cookieHeader)
      }
    }

    if (!hasHeader(headers, "Authorization")) {
      const accessToken = await getServerCookieValue(ACCESS_TOKEN_COOKIE)

      if (accessToken) {
        setHeader(headers, "Authorization", `Bearer ${accessToken}`)
      }
    }
  }

  return {
    ...config,
    credentials: config.credentials ?? "include",
    cache: config.cache ?? "no-store",
    headers,
  }
}

const requestWithContext = async <T>(config: ApiRequestOptions) => {
  const preparedConfig = await withRequestContext(config)
  const response = await apiInstance.request<T>(
    preparedConfig as XiorRequestConfig
  )

  await syncServerAuthCookies(getPathname(config.url), response.data)

  return response
}

const getAuthTokensFromPayload = (payload: unknown): AuthTokenPair | null => {
  if (!isRecord(payload) || !isRecord(payload.data)) {
    return null
  }

  const data = payload.data as AuthTokenPair

  if (!data.accessToken && !data.refreshToken) {
    return null
  }

  return data
}

const syncServerAuthCookies = async (path: string, payload: unknown) => {
  if (isBrowser()) {
    return
  }

  if (path === LOGOUT_ENDPOINT) {
    await clearServerAuthCookies()
    return
  }

  if (!isAuthEndpoint(path)) {
    return
  }

  const tokens = getAuthTokensFromPayload(payload)

  if (!tokens?.accessToken || !tokens.refreshToken) {
    return
  }

  await setServerAuthCookies(tokens.accessToken, tokens.refreshToken)
}

const setServerAuthCookies = async (
  accessToken: string,
  refreshToken: string
) => {
  const cookieStore = await getServerCookieStore()

  if (!cookieStore) {
    return
  }

  try {
    const secure = process.env.NODE_ENV !== "development"
    const options = {
      httpOnly: true,
      secure,
      sameSite: secure ? "none" : "lax",
      path: "/",
      maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
    } as const

    cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, options)
    cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, options)
  } catch {
    // Server Components can read cookies but cannot write them.
  }
}

const clearServerAuthCookies = async () => {
  const cookieStore = await getServerCookieStore()

  if (!cookieStore) {
    return
  }

  try {
    cookieStore.delete(ACCESS_TOKEN_COOKIE)
    cookieStore.delete(REFRESH_TOKEN_COOKIE)
  } catch {
    // Server Components can read cookies but cannot write them.
  }
}

let browserRefreshPromise: Promise<AuthTokenPair> | null = null

const refreshAuthTokens = async () => {
  const runRefresh = async () => {
    const response = await requestWithContext<AuthTokenResponse>({
      url: REFRESH_ENDPOINT,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: {},
      auth: true,
      skipAuthRefresh: true,
      cache: "no-store",
    })

    return response.data.data ?? {}
  }

  if (!isBrowser()) {
    return runRefresh()
  }

  browserRefreshPromise ??= runRefresh().finally(() => {
    browserRefreshPromise = null
  })

  return browserRefreshPromise
}

const shouldRefreshRequest = (
  request: ApiRequestOptions,
  error: ApiRequestError
) => {
  if (request.skipAuthRefresh || request.auth === false) {
    return false
  }

  if (isAuthEndpoint(request.url)) {
    return false
  }

  return error.isAuthError
}

const withRetryAuthorization = (
  request: ApiRequestOptions,
  accessToken?: string | null
): ApiRequestOptions => {
  const headers = toPlainHeaders(request.headers)

  if (accessToken) {
    setHeader(headers, "Authorization", `Bearer ${accessToken}`)
  }

  return {
    ...request,
    headers,
    skipAuthRefresh: true,
  }
}

export const customInstance = async <T>(
  config: ApiRequestOptions,
  options?: ApiRequestOptions
): Promise<T> => {
  const request = mergeRequestConfigs(config, options)

  try {
    const response = await requestWithContext<T>(request)
    return response.data
  } catch (error) {
    const requestError = createApiRequestError(error, request)

    if (!shouldRefreshRequest(request, requestError)) {
      throw requestError
    }

    try {
      const tokens = await refreshAuthTokens()
      const retryResponse = await requestWithContext<T>(
        withRetryAuthorization(request, tokens.accessToken)
      )

      return retryResponse.data
    } catch (refreshError) {
      if (!isBrowser()) {
        await clearServerAuthCookies()
      }

      throw createApiRequestError(refreshError, request)
    }
  }
}

export const isApiRequestError = <ErrorData = unknown>(
  error: unknown
): error is ApiRequestError<ErrorData> => error instanceof ApiRequestError

export type ErrorType<Error> = ApiRequestError<Error>
