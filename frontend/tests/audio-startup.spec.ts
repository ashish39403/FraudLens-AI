import { chromium, expect, test, type Page } from '@playwright/test'

async function observeContexts(page: Page, blockAutoplay = false) {
  await page.addInitScript((blockAutoplay) => {
    const contexts: AudioContext[] = []
    let gestureReceived = false
    document.addEventListener(
      'click',
      () => {
        gestureReceived = true
      },
      { capture: true },
    )
    Object.assign(window, { observedAudioContexts: contexts })
    window.AudioContext = new Proxy(window.AudioContext, {
      construct(Target) {
        const context = new Target()
        // Model the browser's gesture gate while retaining real audio nodes and playback.
        if (blockAutoplay) {
          const resume = context.resume.bind(context)
          void context.suspend()
          context.resume = () => (gestureReceived ? resume() : new Promise<void>(() => {}))
        }
        contexts.push(context)
        return context
      },
    })
  }, blockAutoplay)
}

const audioState = (page: Page) =>
  page.evaluate(
    () =>
      (window as unknown as { observedAudioContexts: AudioContext[] }).observedAudioContexts.at(-1)
        ?.state,
  )

test.describe('browser blocks autoplay', () => {
  test('first page interaction starts music without any sound controls', async () => {
    await withPolicy('document-user-activation-required', async (page) => {
      await observeContexts(page, true)
      await page.goto('/')
      await expect.poll(() => audioState(page)).toBe('suspended')
      await expect(page.locator('.fl-sound-dock')).toHaveCount(0)
      await page.locator('#fl-hero-title').click()
      await expect.poll(() => audioState(page)).toBe('running')
    })
  })
})

test.describe('browser allows autoplay', () => {
  test('music starts on page load without any click', async () => {
    await withPolicy('no-user-gesture-required', async (page) => {
      await observeContexts(page)
      await page.goto('/')
      await expect.poll(() => audioState(page)).toBe('running')
      await expect(page.locator('.fl-sound-dock')).toHaveCount(0)
    })
  })
})

test('hero words assemble on scroll and stay static with reduced motion', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 950 })
    await page.goto('/')
    const word = page.locator('#fl-hero-title .fl-assemble-word').first()
    await expect(word).toHaveCSS('opacity', '0.65')
    await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'instant' }))
    await expect(word).toHaveCSS('opacity', '1')
    await expect(word).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
    await expect(page.locator('.fl-hero-accent')).toHaveCSS('font-style', 'italic')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('#fl-hero-title .fl-assemble-word').first()).toHaveCSS(
    'transform',
    'none',
  )
})

async function withPolicy(policy: string, run: (page: Page) => Promise<void>) {
  const browser = await chromium.launch({ args: ['--autoplay-policy=' + policy] })
  try {
    const debugPage = await browser.newPage({ baseURL: 'http://127.0.0.1:5173' })
    await run(debugPage)
  } finally {
    await browser.close()
  }
}
