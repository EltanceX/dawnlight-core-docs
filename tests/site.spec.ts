import { test, expect } from '@playwright/test'

test('home and deep page render without overflow or runtime errors', async ({ page }, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('./')
  await expect(page.getByRole('heading', { name: /先看懂一帧/ })).toBeVisible()
  await expect(page.getByRole('link', { name: '开始阅读 →', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: `artifacts/w2/${testInfo.project.name}-home.png`, fullPage: true })
  await page.goto('concepts/resources-targets')
  await expect(page.getByRole('heading', { level: 1, name: '资源、目标与 drawBuffers' })).toBeVisible()
  await page.reload()
  await expect(page.getByText('静态合同已核对', { exact: false })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: `artifacts/w2/${testInfo.project.name}-deep-page.png`, fullPage: true })
  expect(errors).toEqual([])
})

for (const [query, destination] of [
  ['资源', 'concepts/resources-targets'],
  ['drawBuffers', 'concepts/resources-targets'],
  ['DLTOOL2001', 'tools/analyzer']
]) {
  test(`search recalls ${query}`, async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: '搜索文档', exact: true }).click()
    const input = page.locator('#localsearch-input')
    await expect(input).toBeVisible()
    await input.fill(query)
    await expect(page.locator(`.VPLocalSearchBox a[href*="${destination}"]`).first()).toBeVisible()
  })
}

test('navigation, theme, copy button and baseline download work', async ({ page }, testInfo) => {
  await page.goto('concepts/resources-targets')
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: '目录', exact: true }).click()
    await expect(page.getByRole('link', { name: '阅读路线', exact: true })).toBeVisible()
    await page.getByRole('link', { name: '阅读路线', exact: true }).click()
    await expect(page.getByRole('heading', { level: 1, name: '从这里开始' })).toBeVisible()
  } else {
    await page.getByRole('switch', { name: '切换到深色' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
  }
  await page.goto('concepts/resources-targets')
  const block = page.locator('div.language-json').first()
  await block.hover()
  const copy = block.locator('button.copy')
  await copy.click()
  await expect(copy).toHaveClass(/copied/)
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('example:scene/color')
  const response = await page.request.get('downloads/site-baseline.json')
  expect(response.ok()).toBe(true)
  const baseline = await response.json()
  expect(baseline.source.commit).toBe('f8aaa5c4218f54536ccf994a2d512aed2e3678b7')
  expect(baseline.verification.driverStatus).toBe('notProvided')
})

test('404 keeps project navigation and local assets', async ({ page }) => {
  const response = await page.goto('missing-w2-page')
  // Preview servers may serve a fallback; Pages must return a real 404 after deployment.
  if (process.env.SITE_URL) expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: '页面未找到' })).toBeVisible()
  await page.getByRole('link', { name: /^返回文档首页/ }).click()
  await expect(page.getByRole('heading', { name: /先看懂一帧/ })).toBeVisible()
})
