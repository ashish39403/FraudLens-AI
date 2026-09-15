import type { RegistrationInput } from '../types'

export const USER_ROLES = ['ANALYST', 'REVIEWER', 'MANAGER', 'ADMIN'] as const
export function validateRegistration(input: RegistrationInput) {
  if (!input.full_name.trim()) throw new Error('Enter your full name.')
  if (input.full_name.trim().length > 225)
    throw new Error('Full name must be 225 characters or fewer.')
  if (!USER_ROLES.includes(input.role)) throw new Error('Choose a valid role.')
  if (
    Array.from(input.password).length < 8 ||
    !/\p{Lu}/u.test(input.password) ||
    !/\p{Ll}/u.test(input.password) ||
    !/\p{Nd}/u.test(input.password)
  )
    throw new Error(
      'Use at least 8 characters with an uppercase letter, a lowercase letter, and a number.',
    )
}
export function authDestination(state: unknown) {
  const from = (state as { from?: unknown } | null)?.from
  return typeof from === 'string' && from.startsWith('/app/') ? from : '/app/dashboard'
}
