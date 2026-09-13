import { expect, test } from '@playwright/test'

test('widescreen art fills the viewport and original story scenes stay responsive', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.goto('/')
  await expect(page.locator('.fl-hero-art canvas')).toHaveAttribute('data-ready', 'true')
  const hero = await page.locator('.fl-hero-art').boundingBox()
  expect(hero?.x).toBe(0)
  expect(hero?.width).toBe(1920)
  expect((await page.locator('#fl-hero-title').boundingBox())?.x).toBeLessThan(100)
  await page.screenshot({ path: 'test-results/polished-hero-1920.png' })
  for (const [index, name] of ['trace', 'investigate', 'decide'].entries()) {
    const scene = page.locator('.fl-scene').nth(index)
    await scene.scrollIntoViewIfNeeded()
    await expect
      .poll(() => scene.locator('img').evaluate((img) => (img as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0)
    expect(await scene.locator('img').getAttribute('src')).toBe(`/landing/art/${name}.webp`)
    expect((await scene.boundingBox())?.width).toBe(1920)
    await expect(scene.locator('.fl-scene-copy h3')).toHaveCSS('opacity', '1')
    await page.screenshot({ path: `test-results/polished-${name}-1920.png` })
  }
  const spacing = await page.evaluate(() => {
    const scenes = [...document.querySelectorAll('.fl-scene')].map((el) =>
      el.getBoundingClientRect(),
    )
    const film = document.querySelector('.fl-film')!.getBoundingClientRect()
    return [
      scenes[1].top - scenes[0].bottom,
      scenes[2].top - scenes[1].bottom,
      film.top - scenes[2].bottom,
    ]
  })
  for (const gap of spacing) expect(gap).toBeGreaterThanOrEqual(110)
  for (const width of [820, 390]) {
    await page.setViewportSize({ width, height: 844 })
    const scene = page.locator('.fl-scene').first()
    await scene.scrollIntoViewIfNeeded()
    await expect(scene.getByRole('heading')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    await page.screenshot({ path: `test-results/polished-story-${width}.png` })
  }
})

test('ambient music starts automatically or on first gesture, has no controls and closes on navigation', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const Original = window.AudioContext
    const probe = {
      contexts: [] as AudioContext[],
      gains: [] as GainNode[],
      analyser: null as AnalyserNode | null,
    }
    Object.assign(window, { audioProbe: probe })
    window.AudioContext = new Proxy(Original, {
      construct(Target) {
        const context = new Target()
        probe.contexts.push(context)
        const createGain = context.createGain.bind(context)
        context.createGain = () => {
          const gain = createGain()
          if (
            probe.contexts.at(-1) === context &&
            !probe.gains.some((gain) => gain.context === context)
          ) {
            probe.analyser = context.createAnalyser()
            gain.connect(probe.analyser)
          }
          probe.gains.push(gain)
          return gain
        }
        return context
      },
    })
  })
  const read = () =>
    page.evaluate(() => {
      const probe = (
        window as unknown as {
          audioProbe: { contexts: AudioContext[]; gains: GainNode[]; analyser: AnalyserNode | null }
        }
      ).audioProbe
      const samples = new Float32Array(probe.analyser?.fftSize ?? 2048)
      probe.analyser?.getFloatTimeDomainData(samples)
      return {
        count: probe.contexts.length,
        state: probe.contexts.at(-1)?.state,
        gain: probe.gains.find((gain) => gain.context === probe.contexts.at(-1))?.gain.value ?? 0,
        energy: samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length,
      }
    })
  await page.goto('/')
  await page.locator('#fl-hero-title').click()
  const contextCount = (await read()).count
  await expect(page.locator('.fl-sound-dock')).toHaveCount(0)
  await expect(page.getByRole('slider', { name: 'Music volume' })).toHaveCount(0)
  await expect.poll(async () => (await read()).energy).toBeGreaterThan(0.000000001)
  await expect.poll(async () => (await read()).gain).toBeCloseTo(0.22, 2)
  await page.locator('.fl-header').getByRole('link', { name: 'Open workspace' }).click()
  await expect(page).toHaveURL('/login')
  await expect.poll(async () => (await read()).state).toBe('closed')
  await expect(page.locator('.fl-sound-dock')).toHaveCount(0)
  await page.getByRole('button', { name: 'Use demo credentials' }).click()
  await page.getByRole('button', { name: 'Sign in to workspace' }).click()
  await expect(page.getByRole('heading', { name: 'Investigation overview' })).toBeVisible()
  expect((await read()).state).toBe('closed')
  expect((await read()).count).toBe(contextCount)
  await expect(page.locator('.fl-sound-dock')).toHaveCount(0)
})
