export const label = (value: string) =>
  value
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/^./, (c) => c.toUpperCase())
export const money = (amount: string | number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(
    Number(amount),
  )
export const timestamp = (value: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(value))
export const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.'
