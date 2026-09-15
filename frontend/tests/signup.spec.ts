import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('signup submits the backend schema, recovers from duplicates, and preserves the login destination', async ({
  page,
}) => {
  const payloads: unknown[] = []
  const user = { id: 92, full_name: 'Aditi Sharma', email: 'aditi@example.com', role: 'REVIEWER' }
  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url())
    if (url.pathname.endsWith('/auth/register')) {
      payloads.push(route.request().postDataJSON())
      await route.fulfill({
        status: payloads.length === 1 ? 409 : 201,
        json: payloads.length === 1 ? { detail: 'Email already registered' } : user,
      })
    } else if (url.pathname.endsWith('/auth/login')) {
      expect(route.request().postDataJSON()).toEqual({ email: user.email, password: 'Evidence123' })
      await route.fulfill({ json: { access_token: 'test-token', token_type: 'bearer' } })
    } else await route.fulfill({ json: url.pathname.endsWith('/auth/me') ? user : [] })
  })
  await page.goto('/app/customers')
  await page.getByRole('link', { name: 'Create an account', exact: true }).click()
  await expect(page).toHaveURL('/signup')
  await page.getByLabel('Full name', { exact: true }).fill(' Aditi Sharma ')
  await page.getByLabel('Work email', { exact: true }).fill(user.email)
  await page.getByLabel('Password', { exact: true }).fill('Evidence123')
  await expect(page.getByRole('combobox', { name: 'Role' })).toHaveValue('ANALYST')
  expect(await page.getByRole('option').allTextContents()).toEqual([
    'Analyst',
    'Reviewer',
    'Manager',
    'Admin',
  ])
  await page.getByRole('combobox', { name: 'Role' }).selectOption('REVIEWER')
  await page.getByRole('button', { name: 'Create account', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveText('Email already registered')
  await page.getByRole('button', { name: 'Create account', exact: true }).click()
  await expect(page).toHaveURL('/login')
  await expect(page.getByRole('status')).toHaveText('Account created. Sign in to continue.')
  await expect(page.getByLabel('Work email', { exact: true })).toHaveValue(user.email)
  await expect(page.getByLabel('Password', { exact: true })).toHaveValue('')
  expect(payloads[1]).toEqual({
    full_name: user.full_name,
    email: user.email,
    password: 'Evidence123',
    role: 'REVIEWER',
  })
  await page.getByLabel('Password', { exact: true }).fill('Evidence123')
  await page.getByRole('button', { name: 'Sign in to workspace' }).click()
  await expect(page).toHaveURL('/app/customers')
  await expect(page.getByRole('heading', { name: 'Customers', exact: true })).toBeVisible()
  await expect(page.locator('.fl-sound-dock')).toHaveCount(0)
})

test('signup enforces backend password requirements and exposes request loading', async ({
  page,
}) => {
  let calls = 0
  let release: (() => void) | undefined
  const ready = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/auth/register', async (route) => {
    calls++
    await ready
    await route.fulfill({
      status: 422,
      json: { detail: [{ msg: 'Registration is unavailable for this email.' }] },
    })
  })
  await page.goto('/signup')
  await page.getByLabel('Full name', { exact: true }).fill('Test Analyst')
  await page.getByLabel('Work email', { exact: true }).fill('analyst@example.com')
  await page.getByLabel('Password', { exact: true }).fill('lowercase123')
  await page.getByRole('button', { name: 'Create account', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('uppercase')
  expect(calls).toBe(0)
  await page.getByLabel('Password', { exact: true }).fill('Evidence123')
  await page.getByRole('button', { name: 'Show password' }).click()
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'text')
  await page.getByRole('button', { name: 'Create account', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Creating your account…' })).toBeDisabled()
  release?.()
  await expect(page.getByRole('alert')).toHaveText('Registration is unavailable for this email.')
})

test('auth pages slide between routes, remain accessible, and fit mobile and desktop', async ({
  page,
}) => {
  await page.goto('/login')
  await page
    .getByRole('navigation', { name: 'Account access' })
    .getByRole('link', { name: 'Create account' })
    .click()
  await expect(page.locator('.auth-route')).toHaveCSS('animation-name', 'auth-slide-in')
  await expect(page.getByRole('heading', { name: 'Start with clarity.' })).toBeFocused()
  await expect(page.locator('.auth-route')).toHaveCSS('opacity', '1')
  for (const width of [1440, 820, 390]) {
    await page.setViewportSize({ width, height: 950 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    await page.screenshot({ path: `test-results/signup-${width}.png`, fullPage: true })
  }
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([])
  await page
    .getByRole('navigation', { name: 'Account access' })
    .getByRole('link', { name: 'Sign in' })
    .click()
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeFocused()
  await expect(page.locator('.auth-route')).toHaveCSS('opacity', '1')
  await page.screenshot({ path: 'test-results/signup-to-login.png', fullPage: true })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.getByRole('link', { name: 'Create an account', exact: true }).click()
  await expect(page.locator('.auth-route')).toHaveCSS('animation-name', 'none')
})
