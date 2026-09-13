export const isDemo = import.meta.env.VITE_DATA_MODE !== 'api'
const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '')
let token: string | null = null
export const setAccessToken = (value: string | null) => {
  token = value
}
export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
    signal: options.signal ?? AbortSignal.timeout(15000),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    if (response.status === 401) window.dispatchEvent(new Event('fraudlens:unauthorized'))
    throw new ApiError(
      typeof body?.detail === 'string'
        ? body.detail
        : response.status === 422
          ? 'The API could not validate this request. Check your inputs.'
          : `Request failed (${response.status}). Please try again.`,
      response.status,
    )
  }
  return response.status === 204 ? (undefined as T) : (response.json() as Promise<T>)
}
