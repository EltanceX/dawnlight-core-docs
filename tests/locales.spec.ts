import { test, expect, type Page } from '@playwright/test'

const routes = [
  ['', 'Shader pack author documentation'],
  ['start/', 'Reading guide'],
  ['concepts/pipeline', 'From configuration to a frame'],
  ['concepts/resources-targets', 'Resources, targets and drawBuffers'],
  ['tools/analyzer', 'Analyzer and evidence'],
  ['compatibility/current-baseline', 'Versions and support']
]

async function switchLanguage(page: Page, language: 'English' | '简体中文') {
  const menu = page.locator('.VPNavBarTranslations')
  await menu.getByRole('button').click()
  await menu.getByRole('link', { name: language, exact: true }).click()
}

test('English pages, localized components and deep reloads render correctly', async ({ page }, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  for (const [route, title] of routes) {
    const response = await page.goto('en/' + route)
    expect(response?.status()).toBe(200)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
    await expect(page).toHaveTitle(title + ' | DawnlightCore')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    expect(await page.locator('#VPContent').innerText()).not.toMatch(/\p{Script=Han}/u)
    if (!route) {
      await expect(page.getByRole('link', { name: 'Start reading →', exact: true })).toHaveAttribute('href', /\/en\/start\/$/)
      await page.screenshot({ path: `artifacts/w2/${testInfo.project.name}-en-home.png`, fullPage: true })
    } else {
      await expect(page.locator('.baseline-note a')).toHaveText(/Static contracts checked/)
      await expect(page.locator('.baseline-note a')).toHaveAttribute('href', /\/en\/compatibility\/current-baseline$/)
    }
  }
  await page.goto('en/concepts/resources-targets')
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'Resources, targets and drawBuffers' })).toBeVisible()
  await expect(page.locator('.source-note').first()).toContainText('Source:')
  await page.screenshot({ path: `artifacts/w2/${testInfo.project.name}-en-deep-page.png`, fullPage: true })
  const block = page.locator('div.language-json').first()
  await block.hover()
  await block.locator('button.copy').click()
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('example:scene/color')
  const download = await page.request.get('downloads/site-baseline.json')
  expect(download.ok()).toBe(true)
  expect((await download.json()).verification.driverStatus).toBe('notProvided')
  expect(errors).toEqual([])
})

for (const [route] of routes) {
  test(`top bar switches corresponding pages: ${route || 'home'}`, async ({ page }) => {
    await page.goto(route || './')
    await expect(page.locator('.VPNavBarTranslations')).toBeVisible()
    await switchLanguage(page, 'English')
    await expect(page).toHaveURL(new RegExp('/en/' + route.replaceAll('/', '\\/') + '$'))
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
    await expect(page.locator('.VPNavBarTranslations button')).toHaveAttribute('aria-label', 'Change language')
    await switchLanguage(page, '简体中文')
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
    await expect(page).not.toHaveURL(/\/en\//)
    await expect(page).toHaveURL(new RegExp('/dawnlight-core-docs/' + route.replaceAll('/', '\\/') + '$'))
  })
}

test('language switching preserves the current section and old Chinese anchors', async ({ page }) => {
  await page.goto('compatibility/current-baseline#support-boundaries')
  await switchLanguage(page, 'English')
  await expect(page).toHaveURL(/\/en\/compatibility\/current-baseline#support-boundaries$/)
  await expect(page.locator('#support-boundaries')).toHaveText('Support boundaries')
  await switchLanguage(page, '简体中文')
  await expect(page).toHaveURL(/\/dawnlight-core-docs\/compatibility\/current-baseline#support-boundaries$/)
  await expect(page.locator('#support-boundaries')).toHaveText('支持边界')
  await page.goto('compatibility/current-baseline#支持边界')
  await expect(page.locator('[id="支持边界"]')).toHaveCount(1)
  await switchLanguage(page, 'English')
  await expect(page.locator('[id="支持边界"]')).toHaveCount(1)
})

for (const [query, destination] of [
  ['resources', 'concepts/resources-targets'],
  ['drawBuffers', 'concepts/resources-targets'],
  ['DLTOOL2001', 'tools/analyzer']
]) {
  test(`English search recalls ${query} without Chinese results`, async ({ page }) => {
    await page.goto('en/')
    await page.getByRole('button', { name: 'Search docs', exact: true }).click()
    await page.locator('#localsearch-input').fill(query)
    const results = page.locator('.VPLocalSearchBox a.result')
    await expect(page.locator(`.VPLocalSearchBox a[href*="/en/${destination}"]`).first()).toBeVisible()
    for (const href of await results.evaluateAll(links => links.map(link => link.getAttribute('href')))) {
      expect(href).toContain('/dawnlight-core-docs/en/')
    }
  })
}

test('English navigation, theme and 404 return stay in English', async ({ page }, testInfo) => {
  await page.goto('en/concepts/resources-targets')
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Menu', exact: true }).click()
    await page.getByRole('link', { name: 'Reading guide', exact: true }).click()
    await expect(page.getByRole('heading', { name: /^Start here/ })).toBeVisible()
  } else {
    await page.getByRole('switch', { name: 'Switch to dark theme' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await page.screenshot({ path: 'artifacts/w2/desktop-en-dark.png', fullPage: true })
  }
  const response = await page.goto('en/missing-language-page')
  if (process.env.SITE_URL) expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'Page not found', exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Back to documentation', exact: true }).click()
  await expect(page).toHaveURL(/\/dawnlight-core-docs\/en\/$/)
  await expect(page.getByRole('link', { name: 'Start reading →', exact: true })).toBeVisible()
})

test('language control fits phone and tablet top bars', async ({ page }) => {
  for (const width of [320, 768, 960, 1024]) {
    await page.setViewportSize({ width, height: 740 })
    await page.goto('./')
    await expect(page.locator('.VPNavBarTranslations')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await switchLanguage(page, 'English')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    if (width === 768) {
      await page.getByRole('button', { name: 'mobile navigation', exact: true }).click()
      await page.locator('.VPNavScreen').getByRole('link', { name: 'Get started', exact: true }).click()
      await expect(page).toHaveURL(/\/en\/start\/$/)
    }
  }
})
