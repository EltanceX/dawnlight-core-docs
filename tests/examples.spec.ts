import { test, expect } from '@playwright/test'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

const sha256 = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex')

test('generated example pages keep language, section and source code aligned', async ({ page }, testInfo) => {
  await page.goto('examples/')
  await page.getByRole('link', { name: '00 · 外置起步包', exact: true }).last().click()
  await expect(page.getByRole('heading', { level: 1, name: '00 · 外置起步包' })).toBeVisible()
  await page.goto('examples/course-starter#shader-sources')
  const menu = page.locator('.VPNavBarTranslations')
  await menu.getByRole('button').click()
  await menu.getByRole('link', { name: 'English', exact: true }).click()
  await expect(page).toHaveURL(/\/en\/examples\/course-starter#shader-sources$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
  expect(await page.locator('#VPContent').innerText()).not.toMatch(/\p{Script=Han}/u)
  await page.reload()
  await expect(page.locator('#runtime-boundaries')).toHaveText('Runtime checks still required')
  await page.locator('.vp-code-group .tabs label').filter({ hasText: 'shaders/present.psh' }).click()
  const block = page.locator('.vp-code-group div.language-glsl:visible')
  await block.hover()
  await block.locator('button.copy').click()
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('o_color = texture(u_sceneColor, v_uv)')
  await page.locator('details summary').click()
  await expect(page.locator('details code')).toContainText('"id": "course:starter"')
  await page.goto('en/examples/course-starter')
  await page.screenshot({ path: `artifacts/w3/${testInfo.project.name}-en-starter.png` })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('downloaded ZIP and every raw source file match the published inventory', async ({ page }) => {
  const indexResponse = await page.request.get('downloads/examples/index.json')
  expect(indexResponse.ok()).toBe(true)
  const index = await indexResponse.json(), example = index.examples[0]
  const inventoryResponse = await page.request.get(example.inventoryUrl)
  expect(inventoryResponse.ok()).toBe(true)
  const inventory = await inventoryResponse.json()
  await page.goto('en/examples/course-starter')
  await expect(page.locator('.download-hash').first()).toHaveText(example.archiveSha256)
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('link', { name: 'Download starter ZIP', exact: true }).click()
  ])
  expect(download.suggestedFilename()).toBe('starter.zip')
  expect(sha256(await readFile((await download.path())!))).toBe(example.archiveSha256)
  for (const file of inventory.files) {
    const response = await page.request.get(example.sourceBaseUrl + '/' + file.path)
    expect(response.ok()).toBe(true)
    expect(sha256(await response.body())).toBe(file.sha256)
  }
  const validation = await (await page.request.get(example.validationUrl)).json()
  expect(validation.sourceFingerprint).toBe(inventory.sourceFingerprint)
  expect(validation.archiveSha256).toBe(example.archiveSha256)
  expect(validation.runtimeEvidence.driverStatus).toBe('notProvided')
  expect(validation.checks.every((check: { outputSha256: string; archiveOutputSha256: string }) => check.outputSha256 === check.archiveOutputSha256)).toBe(true)
})

test('local search finds the generated example in each language', async ({ page }) => {
  for (const [prefix, button] of [['', '搜索文档'], ['en/', 'Search docs']]) {
    await page.goto(prefix || './')
    await page.getByRole('button', { name: button, exact: true }).click()
    await page.locator('#localsearch-input').fill('course:post/present')
    await expect(page.locator(`.VPLocalSearchBox a[href*="/${prefix}examples/course-starter"]`).first()).toBeVisible()
  }
})

test('example hashes and code fit narrow screens', async ({ page }) => {
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('en/examples/course-starter')
    await expect(page.locator('.VPNavBarTranslations')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
})
