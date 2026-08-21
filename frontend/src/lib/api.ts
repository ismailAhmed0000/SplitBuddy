import axios, { AxiosError } from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
  },
})

const AUTH_TOKEN_KEY = 'auth_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/** Laravel's 422 validation error body: `{ message, errors: { field: string[] } }`. */
export type ValidationErrorBody = {
  message: string
  errors?: Record<string, string[]>
}

/** First error message per field, plus a fallback top-level message. */
export function parseApiError(error: unknown): {
  message: string
  fieldErrors: Record<string, string>
} {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<ValidationErrorBody>
    const body = err.response?.data
    const fieldErrors: Record<string, string> = {}

    if (body?.errors) {
      for (const [field, messages] of Object.entries(body.errors)) {
        if (messages[0]) fieldErrors[field] = messages[0]
      }
    }

    return {
      message: body?.message ?? 'Something went wrong. Please try again.',
      fieldErrors,
    }
  }

  return { message: 'Something went wrong. Please try again.', fieldErrors: {} }
}
