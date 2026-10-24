import { test, expect, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import runtime from '../metadata/w6-runtime.json' with { type: 'json' }
const ids = ['05-options','06-custom-data','07-materials','08-post-chain','09-complete-pack','10-distribution']
const sha = (b: Buffer) => createHash('sha256').update(b).digest('hex')
const normalize = (s: string) => s.replaceAll('\r', '').trimEnd()
const hydrated = (page: Page) => page.waitForFunction(() => Boolean((document.querySelector('#app') as Element & { __vue_app__?: unknown })?.__vue_app__))

test('six bilingual pack chapters render authoritative files, branch matrices and game evidence', async ({ page }, info) => {
  test.setTimeout(120_000)
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message))
  for (const prefix of ['', 'en/']) for (const id of ids) {
    expect((await page.goto(prefix + 'tutorial/' + id))?.status()).toBe(200)
    await expect(page.locator('.vp-doc h1')).toBeVisible()
    const item = runtime.examples.find(e => e.id === 'course/' + id)!
    await expect(page.locator('.pack-runtime-note')).toContainText(item.sourceFingerprint)
    await expect(page.locator('.pack-runtime-note img')).toHaveAttribute('src', item.image)
    await expect(page.locator('.course-branches tbody tr')).toHaveCount(item.branches)
    const source = await readFile(new URL(`../site/${prefix}tutorial/${id}.md`, import.meta.url), 'utf8')
    const blocks = (await page.locator('.vp-doc div[class*="language-"] code').allTextContents()).map(normalize)
    for (const match of source.matchAll(/^<<< @\/\.\.\/([^\s{]+)(?:\{glsl\})?$/gm)) expect(blocks).toContain(normalize(await readFile(new URL('../' + match[1], import.meta.url), 'utf8')))
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  expect(errors).toEqual([])
  await page.goto('en/tutorial/09-complete-pack')
  await page.screenshot({ path: `artifacts/w6/${info.project.name}-course.png`, fullPage: true })
})

test('pack chapter locale switching preserves every resource-flow anchor', async ({ page }) => {
  for (const id of ids) {
    await page.goto('tutorial/' + id + '#resource-flow'); await hydrated(page)
    const menu = page.locator('.VPNavBarTranslations')
    await menu.getByRole('button').click(); await menu.getByRole('link', { name: 'English', exact: true }).click()
    await expect(page).toHaveURL(new RegExp('/en/tutorial/' + id + '#resource-flow$'))
    await expect(page.locator('#resource-flow')).toHaveText('Resource flow')
    await menu.getByRole('button').click(); await menu.getByRole('link', { name: '简体中文', exact: true }).click()
    await expect(page).toHaveURL(new RegExp('/tutorial/' + id + '#resource-flow$'))
  }
})

test('six independent ZIPs, fragments, presets and receipts match download identities', async ({ request }) => {
  test.setTimeout(120_000)
  const index = await (await request.get('downloads/examples/index.json')).json()
  const examples = index.examples.filter((e: { id: string }) => ids.includes(e.id.split('/')[1]))
  expect(examples).toHaveLength(6)
  for (const e of examples) {
    const archive = await request.get(e.downloadUrl); expect(archive.ok()).toBe(true)
    expect(sha(await archive.body())).toBe(e.archiveSha256)
    const inventory = await (await request.get(e.inventoryUrl)).json()
    for (const f of inventory.files) {
      const response = await request.get(e.sourceBaseUrl + '/' + f.path); expect(response.ok()).toBe(true)
      expect(sha(await response.body())).toBe(f.sha256)
    }
    const receipt = await (await request.get(e.validationUrl)).json()
    expect(receipt.sourceFingerprint).toBe(e.sourceFingerprint)
    expect(receipt.branches).toHaveLength(runtime.examples.find(x => x.id === e.id)!.branches)
    expect(receipt.checks.every((c: { outputSha256: string, archiveOutputSha256: string }) => c.outputSha256 === c.archiveOutputSha256)).toBe(true)
  }
})

test('bounded runtime summaries and screenshots retain exact public bytes', async ({ request }) => {
  for (const f of runtime.publicFiles) {
    const r = await request.get(f.path); expect(r.ok()).toBe(true)
    const bytes = await r.body(); expect(bytes.length).toBe(f.length); expect(sha(bytes)).toBe(f.sha256)
  }
  const reader = await (await request.get(runtime.readerReproduction)).json()
  expect(reader.independentHumanReader).toBe(false)
  expect(reader.presets.map((p: { id: string }) => p.id)).toEqual(['balanced','economy','neutral'])
})

test('search locates independent pack lessons in both languages', async ({ page }) => {
  for (const [prefix, button] of [['','搜索文档'],['en/','Search docs']]) {
    await page.goto(prefix || './'); await hydrated(page)
    await page.getByRole('button', { name: button, exact: true }).click()
    await page.locator('#localsearch-input').fill('Amber')
    await expect(page.locator(`.VPLocalSearchBox a[href*="/${prefix}tutorial/09-complete-pack"]`).first()).toBeVisible()
  }
})

test('branch tables, settings and final download fit narrow viewports', async ({ page }, info) => {
  for (const width of [320,768,1024]) {
    await page.setViewportSize({ width, height: 844 })
    for (const route of ['en/tutorial/08-post-chain','en/tutorial/pack-runtime#settings','en/examples/10-distribution']) {
      await page.goto(route)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    }
  }
  await page.goto('en/tutorial/pack-runtime#settings')
  const image = page.locator('img[src="/media/w6/settings.jpg"]')
  await image.scrollIntoViewIfNeeded()
  await expect.poll(() => image.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBe(true)
  await page.screenshot({ path: `artifacts/w6/${info.project.name}-settings.png` })
})
