type ApiErrorLike = {
  name?: string
  status?: number
  statusCode?: number
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

export const getApiErrorStatus = (error: unknown) => {
  if (!isRecord(error)) {
    return undefined
  }

  const status = error.status ?? error.statusCode

  return typeof status === "number" ? status : undefined
}

export const isApiErrorLike = (error: unknown): error is ApiErrorLike =>
  isRecord(error) &&
  (error.name === "ApiRequestError" ||
    typeof error.status === "number" ||
    typeof error.statusCode === "number")

export const shouldRetryApiError = (failureCount: number, error: unknown) => {
  if (failureCount >= 2) {
    return false
  }

  const status = getApiErrorStatus(error)

  if (!status) {
    return true
  }

  return status === 408 || status === 429 || status >= 500
}

export const shouldThrowApiErrorToBoundary = (error: unknown) => {
  const status = getApiErrorStatus(error)

  return !status || status >= 500
}
