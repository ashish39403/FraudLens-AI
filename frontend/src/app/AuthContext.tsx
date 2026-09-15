import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { repository } from '../services/repository'
import { isDemo, setAccessToken } from '../services/client'
import type { Session } from '../types'

function initialSession(): Session | null {
  try {
    const stored = sessionStorage.getItem('fraudlens.session')
    const value = stored ? (JSON.parse(stored) as Session) : null
    const validDemo = isDemo && value?.access_token === 'local-demo-session'
    const validApi = !isDemo && Boolean(value?.access_token)
    if (value?.user?.email && (validDemo || validApi)) {
      setAccessToken(value.access_token)
      return value
    }
    return null
  } catch {
    return null
  }
}
const AuthContext = createContext<{
  session: Session | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
} | null>(null)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(initialSession)
  const logout = useCallback(() => {
    setSession(null)
    setAccessToken(null)
    try {
      sessionStorage.removeItem('fraudlens.session')
    } catch {
      /* Storage optional. */
    }
  }, [])
  useEffect(() => {
    window.addEventListener('fraudlens:unauthorized', logout)
    return () => window.removeEventListener('fraudlens:unauthorized', logout)
  }, [logout])
  async function login(email: string, password: string) {
    const next = await repository.login(email, password)
    setAccessToken(next.access_token)
    setSession(next)
    try {
      sessionStorage.setItem('fraudlens.session', JSON.stringify(next))
    } catch {
      /* Storage optional. */
    }
  }
  return <AuthContext.Provider value={{ session, login, logout }}>{children}</AuthContext.Provider>
}
export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('AuthProvider is required.')
  return value
}
