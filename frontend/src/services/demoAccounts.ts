import type { RegistrationInput, User } from '../types'
import { DEMO_EMAIL } from '../data/seed'

// Demo-only credentials stay in memory and disappear on reload. Never persist passwords.
const accounts = new Map<string, { user: User; salt: string; verifier: string }>()
async function derive(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bytes = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 100000, hash: 'SHA-256' },
    key,
    256,
  )
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('')
}
export async function registerDemo(input: RegistrationInput): Promise<User> {
  const email = input.email.trim().toLowerCase()
  if (email === DEMO_EMAIL || accounts.has(email)) throw new Error('Email already registered')
  const salt = crypto.randomUUID()
  const verifier = await derive(input.password, salt)
  if (accounts.has(email)) throw new Error('Email already registered')
  const user = { id: Date.now(), full_name: input.full_name.trim(), email, role: input.role }
  accounts.set(email, { user, salt, verifier })
  return user
}
export async function loginDemoAccount(email: string, password: string): Promise<User | null> {
  const account = accounts.get(email.trim().toLowerCase())
  if (!account || (await derive(password, account.salt)) !== account.verifier) return null
  return account.user
}
