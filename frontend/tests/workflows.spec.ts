import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function demo(page: Page) {
  await page.goto('/')
  await page.getByRole('link', { name: 'Open workspace' }).first().click()
  await page.getByRole('button', { name: 'Use demo credentials' }).click()
  await page.getByRole('button', { name: 'Sign in to workspace' }).click()
  await expect(page.getByRole('heading', { name: 'Investigation overview' })).toBeVisible()
}
test('authentication validates credentials and preserves a protected destination', async ({
  page,
}) => {
  await page.goto('/app/customers')
  await expect(page).toHaveURL('/login')
  await page.getByRole('textbox', { name: 'Work email' }).fill('wrong@example.com')
  await page.getByLabel('Password', { exact: true }).fill('Incorrect123')
  await page.getByRole('button', { name: 'Sign in to workspace' }).click()
  await expect(page.getByRole('alert')).toContainText('incorrect')
  await page.getByRole('button', { name: 'Use demo credentials' }).click()
  await page.getByRole('button', { name: 'Sign in to workspace' }).click()
  await expect(page).toHaveURL('/app/customers')
  await expect(page.getByRole('heading', { name: 'Customers', exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Customers', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL('/login')
})

test('login and detail dialogs support accessible mobile keyboard interaction', async ({
  page,
}) => {
  test.setTimeout(60000)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible()
  const loginScan = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect
    .soft(
      loginScan.violations.map((v) => ({
        rule: v.id,
        nodes: v.nodes.map((n) => n.failureSummary),
      })),
    )
    .toEqual([])
  await page.screenshot({ path: 'test-results/login-mobile.png', fullPage: true })
  await demo(page)
  await page.goto('/app/transactions?transaction=10842')
  await expect(page.getByRole('dialog')).toBeVisible()
  const dialogScan = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect
    .soft(
      dialogScan.violations.map((v) => ({
        rule: v.id,
        nodes: v.nodes.map((n) => n.failureSummary),
      })),
    )
    .toEqual([])
  await page.screenshot({ path: 'test-results/transaction-drawer-mobile.png', fullPage: true })
  await page.getByRole('button', { name: 'Run AI Investigation' }).focus()
  await page.keyboard.press('Tab')
  expect(await page.evaluate(() => Boolean(document.activeElement?.closest('dialog')))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.getByRole('button', { name: 'Search workspace' }).click()
  await expect(page.getByRole('dialog')).toContainText('Search your workspace')
})

test('an analyst investigates, opens a case, records notes, and updates an alert', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await demo(page)
  await page.goto('/app/transactions?transaction=10842')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Run AI Investigation' }).click()
  await expect(page.getByRole('button', { name: 'Analyzing transaction' })).toBeDisabled()
  await expect(page).toHaveURL(/\/app\/investigations\?report=/)
  await expect(page.getByRole('heading', { name: 'Supporting evidence' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Data gaps & contradictions' })).toBeVisible()
  await page.getByRole('button', { name: 'Open investigation case' }).click()
  await expect(page).toHaveURL(/\/app\/cases\?case=/)
  await page
    .getByRole('textbox', { name: 'Case note' })
    .fill('Requested source-of-funds documents and a counterparty invoice.')
  await page.getByRole('button', { name: 'Add note' }).click()
  await expect(page.getByRole('status')).toContainText('Note added')
  await page.getByRole('combobox', { name: 'Case status' }).selectOption('IN_REVIEW')
  await page.getByRole('button', { name: 'Update', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Case status updated')
  await page.reload()
  await expect(page.getByRole('dialog')).toContainText('Requested source-of-funds documents')
  await expect(page.getByRole('combobox', { name: 'Case status' })).toHaveValue('IN_REVIEW')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.goto('/app/alerts?alert=3201')
  await page.getByRole('combobox', { name: 'Status', exact: true }).selectOption('RESOLVED')
  await page.getByRole('button', { name: 'Save status' }).click()
  await expect(page.getByRole('status')).toContainText('Alert status updated')
  await page.goto('/app/audit-logs')
  await expect(page.getByText('Changed alert status to resolved')).toBeVisible()
  await expect(page.getByText('Opened investigation case')).toBeVisible()
  expect(errors).toEqual([])
})

test('search, filters, pagination, and global navigation work', async ({ page }) => {
  await demo(page)
  await page.goto('/app/customers')
  await page.getByRole('searchbox').fill('no-such-customer')
  await expect(page.getByRole('heading', { name: 'No results found' })).toBeVisible()
  await page.getByRole('searchbox').fill('Meridian')
  await expect(
    page.getByRole('button', { name: 'Meridian Trading Ltd', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Meridian Trading Ltd', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('United Kingdom')
  await page.keyboard.press('Escape')
  await page.goto('/app/transactions')
  await expect(page.getByText('1–10 of 84 results')).toBeVisible()
  await page.getByRole('button', { name: 'Next page' }).click()
  await expect(page.getByText('11–20 of 84 results')).toBeVisible()
  await page.getByRole('combobox', { name: 'Risk levels' }).selectOption('HIGH')
  await expect(page.getByText('1–8 of 8 results')).toBeVisible()
  await page.getByRole('button', { name: 'Search workspace' }).click()
  await page
    .getByRole('searchbox', { name: 'Search customers, transactions, reports' })
    .fill('Northstar')
  await page.getByRole('link', { name: /Northstar Imports/ }).click()
  await expect(page.getByRole('dialog')).toContainText('Northstar Imports')
})

test('all pages are accessible and fit desktop, tablet, and mobile screens', async ({ page }) => {
  test.setTimeout(120000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const landingScan = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect
    .soft(
      landingScan.violations.map((v) => ({
        rule: v.id,
        nodes: v.nodes.map((n) => ({ target: n.target, issue: n.failureSummary })),
      })),
    )
    .toEqual([])
  await page.screenshot({ path: 'test-results/landing-desktop.png', fullPage: true })
  await demo(page)
  for (const width of [1440, 820, 390]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const route of [
      'dashboard',
      'customers',
      'transactions',
      'investigations',
      'alerts',
      'cases',
      'audit-logs',
    ]) {
      await page.goto(`/app/${route}`)
      await expect(page.locator('main h1')).toBeVisible()
      await expect(page.getByText('Loading your workspace…')).not.toBeVisible()
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      )
      expect(overflows, `${route} overflows at ${width}px`).toBe(false)
      if (width === 1440 || width === 390)
        await page.screenshot({ path: `test-results/${route}-${width}.png`, fullPage: true })
      if (width === 1440) {
        const scan = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
        expect
          .soft(
            scan.violations.map((v) => ({
              rule: v.id,
              nodes: v.nodes.map((n) => ({ target: n.target, issue: n.failureSummary })),
            })),
            `${route} accessibility`,
          )
          .toEqual([])
      }
    }
  }
  await page.getByRole('button', { name: 'Open navigation' }).click()
  await expect(page.getByRole('dialog', { name: 'Navigation' })).toBeVisible()
  await page.getByRole('dialog').getByRole('link', { name: 'Transactions', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Transactions', exact: true })).toBeVisible()
  await expect(page.getByRole('dialog', { name: 'Navigation' })).not.toBeVisible()
  await page.goto('/')
  await page.screenshot({ path: 'test-results/landing-mobile.png', fullPage: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(
    false,
  )
  expect(errors).toEqual([])
})
