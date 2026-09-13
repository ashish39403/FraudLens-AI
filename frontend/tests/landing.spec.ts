import { expect, test } from '@playwright/test'

test('animated landing opens the existing workspace and returns without stale scroll effects', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  const canvas = page.locator('.fl-hero-art canvas')
  await expect(canvas).toHaveAttribute('data-ready', 'true')
  await page.screenshot({ path: 'test-results/integrated-hero-desktop.png' })
  await page.evaluate(() => window.scrollTo(0, 900))
  await expect.poll(async () => Number(await canvas.getAttribute('data-frame'))).toBeGreaterThan(40)
  const laterFrame = Number(await canvas.getAttribute('data-frame'))
  await page.evaluate(() => window.scrollTo(0, 250))
  await expect
    .poll(async () => Number(await canvas.getAttribute('data-frame')))
    .toBeLessThan(laterFrame)
  await page.locator('.fl-header').getByRole('link', { name: 'Open workspace' }).click()
  await expect(page).toHaveURL('/login')
  await page.getByRole('button', { name: 'Use demo credentials' }).click()
  await page.getByRole('button', { name: 'Sign in to workspace' }).click()
  await expect(page.getByRole('heading', { name: 'Investigation overview' })).toBeVisible()
  await expect(page.locator('.fl-sequence')).toHaveCount(0)
  await page.locator('.sidebar-brand').click()
  await expect(page.locator('#fl-hero-title')).toBeVisible()
  await page.locator('.fl-header').getByRole('link', { name: 'Open workspace' }).click()
  await expect(page.getByRole('heading', { name: 'Investigation overview' })).toBeVisible()
  expect(errors).toEqual([])
})

test('mobile menu, optimized sequence, and product sections work without overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.locator('.fl-hero-art canvas')).toHaveAttribute('data-ready', 'true')
  expect(
    await page
      .locator('.fl-hero-art img')
      .evaluate((image) => (image as HTMLImageElement).currentSrc),
  ).toContain('/mobile/')
  await page.screenshot({ path: 'test-results/integrated-hero-mobile.png' })
  await page.getByRole('button', { name: 'Open product navigation' }).click()
  await page
    .getByRole('navigation', { name: 'Mobile product navigation' })
    .getByRole('link', { name: 'How it works' })
    .click()
  await expect(page).toHaveURL('/#workflow')
  await expect(page.locator('#fl-mobile-nav')).not.toBeVisible()
  await expect(page.getByRole('heading', { name: 'Trace the context.' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
  await page.screenshot({ path: 'test-results/integrated-workflow-mobile.png' })
})

test('reduced motion uses static art and frame failures keep the landing usable', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('#fl-hero-title')).toBeVisible()
  await expect(page.locator('.fl-hero-art canvas')).not.toBeVisible()
  expect(
    await page.locator('.fl-sequence').evaluate((section) => section.clientHeight),
  ).toBeLessThan(1100)
  await page.locator('.fl-film').scrollIntoViewIfNeeded()
  await expect(page.getByRole('button', { name: 'Play background film' })).toBeVisible()
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.route('**/landing/sequence/desktop/*.webp', (route) =>
    route.request().url().endsWith('frame-150.webp') ? route.continue() : route.abort(),
  )
  await page.goto('/')
  await expect(page.locator('#fl-hero-title')).toBeVisible()
  await expect
    .poll(async () =>
      page
        .locator('.fl-hero-art img')
        .evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0)
  await page.locator('.fl-header').getByRole('link', { name: 'Open workspace' }).click()
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible()
  expect(errors).toEqual([])
})
