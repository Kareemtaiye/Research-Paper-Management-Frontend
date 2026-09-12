import axios from "axios"

const NETWORK_MESSAGE = "You don't have internet connection"
const SERVER_MESSAGE = "Something went wrong, please try again later"
const DEFAULT_MESSAGE =
  "An error occurred, try reloading the page and try again"

type ToastFn = (
  message: string,
  type?: "success" | "error" | "warning" | "info",
) => void

/** FastAPI HTTPException(detail=ErrorResponse(status, code, message)) */
function readErrorBody(data: unknown): { message?: string code?: number } {
  if (!data || typeof data !== "object") return {}

  const body = data as Record<string, unknown>
  const detail = body.detail

  if (typeof detail === "string") {
    return {
      message: detail,
      code: typeof body.code === "number" ? body.code : undefined,
    }
  }

  if (detail && typeof detail === "object") {
    const nested = detail as Record<string, unknown>
    return {
      message: typeof nested.message === "string" ? nested.message : undefined,
      code:
        typeof nested.code === "number"
          ? nested.code
          : typeof body.code === "number"
            ? body.code
            : undefined,
    }
  }

  return {
    message: typeof body.message === "string" ? body.message : undefined,
    code: typeof body.code === "number" ? body.code : undefined,
  }
}

export function isNetworkError(err: unknown): boolean {
  return (
    axios.isAxiosError(err) && (err.code === "ERR_NETWORK" || !err.response)
  )
}

export function isServerError(err: unknown): boolean {
  if (!axios.isAxiosError(err) || !err.response) return false
  const { code } = readErrorBody(err.response.data)
  return err.response.status >= 500 || code === 500
}

export function isUnauthorized(err: unknown): boolean {
  if (!axios.isAxiosError(err) || !err.response) return false
  const { code } = readErrorBody(err.response.data)
  return err.response.status === 401 || code === 401
}

export function getApiErrorMessage(
  err: unknown,
  fallback = DEFAULT_MESSAGE,
): string {
  if (isNetworkError(err)) return NETWORK_MESSAGE

  if (axios.isAxiosError(err) && err.response) {
    const { message, code } = readErrorBody(err.response.data)
    if (err.response.status >= 500 || code === 500) return SERVER_MESSAGE
    if (message) return message
  }

  return fallback
}

export function toastApiError(err: unknown, toast: ToastFn, fallback?: string) {
  toast(getApiErrorMessage(err, fallback), "error")
}
