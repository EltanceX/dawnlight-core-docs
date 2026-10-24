import { test, expect, type Page } from '@playwright/test'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import runtime from '../metadata/w4-runtime.json' with { type: 'json' }

const ids = ['00-starter', '01-first-post', '02-resources', '03-scene', '04-mrt']
const sha256 = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex')
const normalize = (code: string) => code.replaceAll('\r', '').trimEnd()
async function hydrated(page: Page) {
  await page.waitForFunction(() => Boolean((document.querySelector('#app') as Element & { __vue_app__?: unknown })?.__vue_app__))
}

test('the bilingual learning path renders complete source and bounded game observations', async ({ page }, testInfo) => {
  test.setTimeout(90_000)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  for (const prefix of ['', 'en/']) {
    for (const route of ['start/environment', 'start/glsl', ...ids.map(id => 'tutorial/' + id), 'tutorial/runtime']) {
      const response = await page.goto(prefix + route)
      expect(response?.status()).toBe(200)
      await expect(page.locator('.vp-doc h1')).toBeVisible()
      if (prefix) expect(await page.locator('#VPContent').innerText()).not.toMatch(/\p{Script=Han}/u)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      if (route.startsWith('tutorial/') && route !== 'tutorial/runtime') {
        const id = route.slice('tutorial/'.length)
        const item = runtime.examples.find(item => item.id === 'course/' + id)!
        await expect(page.locator('.runtime-note')).toContainText(item.sourceFingerprint)
        await expect(page.locator('.runtime-note img')).toHaveAttribute('src', item.image)
        const source = await readFile(new URL(`../site/${prefix}${route}.md`, import.meta.url), 'utf8')
        const blocks = (await page.locator('.vp-doc div[class*="language-"] code').allTextContents()).map(normalize)
        for (const match of source.matchAll(/^<<< @\/\.\.\/([^\s{]+)(?:\{glsl\})?$/gm)) {
          expect(blocks).toContain(normalize(await readFile(new URL('../' + match[1], import.meta.url), 'utf8')))
        }
      }
    }
  }
  expect(errors).toEqual([])
  await page.goto('en/tutorial/04-mrt#verification')
  await page.screenshot({ path: `artifacts/w4/${testInfo.project.name}-en-mrt.png`, fullPage: true })
})

test('course language switching retains each chapter and section', async ({ page }) => {
  for (const id of ids) {
    await page.goto(`tutorial/${id}#resource-flow`)
    await hydrated(page)
    const menu = page.locator('.VPNavBarTranslations')
    await menu.getByRole('button').click()
    await menu.getByRole('link', { name: 'English', exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`/en/tutorial/${id}#resource-flow$`))
    await expect(page.locator('#resource-flow')).toHaveText('Resource flow')
    await menu.getByRole('button').click()
    await menu.getByRole('link', { name: '简体中文', exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`/tutorial/${id}#resource-flow$`))
    await expect(page.locator('#resource-flow')).toHaveText('资源流')
  }
})

test('native source includes copy authoritative shader bytes', async ({ page }) => {
  await page.goto('en/tutorial/01-first-post#shader-sources')
  await hydrated(page)
  const block = page.locator('div.language-glsl').nth(1)
  await block.hover()
  await block.locator('button.copy').click()
  const source = await readFile(new URL('../examples/course/01-first-post/shaders/present.psh', import.meta.url), 'utf8')
  await expect.poll(async () => normalize(await page.evaluate(() => navigator.clipboard.readText()))).toBe(normalize(source))
})

test('all five complete archives and raw source downloads match their inventories', async ({ request }) => {
  test.setTimeout(90_000)
  const index = await (await request.get('downloads/examples/index.json')).json()
  const historical = index.examples.filter((item: { id: string }) => ids.some(id => item.id === 'course/' + id))
  expect(historical.map((item: { id: string }) => item.id)).toEqual(ids.map(id => 'course/' + id))
  for (const example of historical) {
    const archive = await request.get(example.downloadUrl)
    expect(archive.ok()).toBe(true)
    expect(sha256(await archive.body())).toBe(example.archiveSha256)
    const inventory = await (await request.get(example.inventoryUrl)).json()
    expect(inventory.sourceFingerprint).toBe(runtime.examples.find(item => item.id === example.id)!.sourceFingerprint)
    for (const file of inventory.files) {
      const response = await request.get(example.sourceBaseUrl + '/' + file.path)
      expect(response.ok()).toBe(true)
      expect(sha256(await response.body())).toBe(file.sha256)
    }
  }
})

test('published runtime JSON and game images retain their exact identities', async ({ request }) => {
  test.setTimeout(90_000)
  for (const file of runtime.publicFiles) {
    const response = await request.get(file.path)
    expect(response.ok()).toBe(true)
    const bytes = await response.body()
    expect(bytes.length).toBe(file.length)
    expect(sha256(bytes)).toBe(file.sha256)
  }
})

test('search finds MRT and oct encoding in both languages', async ({ page }) => {
  for (const [prefix, button] of [['', '搜索文档'], ['en/', 'Search docs']]) {
    for (const query of ['MRT', 'oct']) {
      await page.goto(prefix || './')
      await hydrated(page)
      await page.getByRole('button', { name: button, exact: true }).click()
      await page.locator('#localsearch-input').fill(query)
      await expect(page.locator(`.VPLocalSearchBox a[href*="/${prefix}tutorial/04-mrt"]`).first()).toBeVisible()
    }
  }
})

test('course diagrams, long identities and runtime images fit narrow widths', async ({ page }) => {
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('en/tutorial/04-mrt')
    await expect(page.locator('.VPNavBarTranslations')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const image = page.locator('.runtime-note img')
    await image.scrollIntoViewIfNeeded()
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true)
  }
})
