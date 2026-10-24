import { test, expect, type Page } from '@playwright/test'
import { createHash } from 'node:crypto'
import inputs from '../metadata/reference-inputs.json' with { type: 'json' }
import reference from '../reference/pages.json' with { type: 'json' }

const sha = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex')
async function ready(page: Page) {
  await page.waitForFunction(() => Boolean((document.querySelector('#app') as Element & { __vue_app__?: unknown })?.__vue_app__))
}

test('all 18 bilingual references render public fields without page overflow', async ({ page }) => {
  test.setTimeout(150_000)
  const errors: string[] = []
  page.on('pageerror', e => errors.push(e.message))
  for (const prefix of ['', 'en/']) for (const record of reference.pages) {
    const response = await page.goto(prefix + 'reference/' + (record.id === 'index' ? '' : record.id))
    expect(response?.status()).toBe(200)
    await expect(page.locator('.vp-doc h1')).toHaveText(record.titles[prefix ? 'en-US' : 'zh-CN'])
    await expect(page.locator('html')).toHaveAttribute('lang', prefix ? 'en-US' : 'zh-CN')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    if (prefix) expect(await page.locator('#VPContent').innerText()).not.toMatch(/\p{Script=Han}/u)
    await expect(page.locator('#behavior')).toBeVisible()
    await expect(page.locator('#examples')).toHaveCount(1)
  }
  expect(errors).toEqual([])
})

test('reference language switching retains a deep structural anchor', async ({ page }) => {
  for (const [id, anchor] of [['materials', 'v5-materialmapping'], ['custom-data', 'v5-dataexpression'], ['settings-ui', 'ui-control'], ['manifest-versions', 'v4-manifest']]) {
    await page.goto(`reference/${id}#${anchor}`)
    await ready(page)
    const menu = page.locator('.VPNavBarTranslations')
    await menu.getByRole('button').click()
    await menu.getByRole('link', { name: 'English', exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`/en/reference/${id}#${anchor}$`))
    await expect(page.locator('#' + anchor)).toBeVisible()
    await menu.getByRole('button').click()
    await menu.getByRole('link', { name: '简体中文', exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`/reference/${id}#${anchor}$`))
  }
})

test('reference downloads match locked bytes and distinguish rejected examples', async ({ request }) => {
  for (const input of inputs.inputs) {
    const response = await request.get('downloads/reference/' + input.path.split('/').at(-1))
    expect(response.ok()).toBe(true)
    expect(sha(await response.body())).toBe(input.sha256)
  }
  const coverage = await (await request.get('downloads/reference/coverage.json')).json()
  expect(coverage.entries.filter((row: { kind: string }) => row.kind === 'property')).toHaveLength(1052)
  expect(coverage.featureCoverage.bindingKinds.uniformBuffer).toEqual([{ id: 'reference/uniform-buffer', status: 'expected-rejected-combination' }])
  const index = await (await request.get('downloads/reference/examples.json')).json()
  expect(index.examples.filter((e: { status: string }) => e.status === 'static-passed')).toHaveLength(4)
  const negative = index.examples.find((e: { id: string }) => e.id === 'reference/uniform-buffer')
  const base = 'downloads/reference/' + negative.id + '/' + negative.sourceFingerprint
  const archive = await request.get(base + '/uniform-buffer.zip')
  expect(archive.ok()).toBe(true)
  expect(sha(await archive.body())).toBe(negative.archiveSha256)
  for (const file of negative.files) {
    const response = await request.get(base + '/files/' + file.path)
    expect(response.ok()).toBe(true)
    expect(sha(await response.body())).toBe(file.sha256)
  }
  expect(negative.checks.filter((check: { exitCode: number }) => check.exitCode === 1)).toHaveLength(3)
})

test('reference search recalls ABI fields, settings conditions and diagnostics in each language', async ({ page }) => {
  for (const prefix of ['', 'en/']) for (const [query, destination] of [['materialMapping', 'materials'], ['customBindings', 'bindings'], ['notEquals', 'settings-ui'], ['DLABI2005', 'diagnostics']]) {
    await page.goto(prefix + 'reference/')
    await ready(page)
    await page.getByRole('button', { name: prefix ? 'Search docs' : '搜索文档', exact: true }).click()
    await page.locator('#localsearch-input').fill(query)
    await expect(page.locator(`.VPLocalSearchBox a[href*="/${prefix}reference/${destination}"]`).first()).toBeVisible()
    await page.keyboard.press('Escape')
  }
})

test('generated definitions expose exact Schema JSON and all 23 ABI inputs', async ({ page }) => {
  await page.goto('en/reference/materials#v5-materialmapping')
  await ready(page)
  const detail = page.locator('details').filter({ has: page.locator('summary', { hasText: '#/$defs/materialMapping' }) })
  await detail.locator('summary').click()
  const schema = await (await page.request.get('downloads/reference/schema-v5.json')).json()
  expect(JSON.parse(await detail.locator('code').innerText())).toEqual(schema.$defs.materialMapping)
  await page.goto('en/reference/catalog#data-inputs')
  const completion = await (await page.request.get('downloads/reference/completion-v2.json')).json()
  const table = page.locator('#data-inputs + table')
  await expect(table.locator('tbody tr')).toHaveCount(23)
  for (const input of completion.dataAbiCatalog.inputs) await expect(table).toContainText(input.id + '@' + input.version)
  await page.goto('en/reference/examples#uniform-buffer')
  await expect(page.locator('.reference-content')).toContainText('Expected rejection; not a working preset')
  await expect(page.locator('.reference-content')).toContainText('DLMAT1002')
})

test('long Catalog metadata and navigation fit 320, 768 and 1024 pixel screens', async ({ page }, testInfo) => {
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 })
    for (const route of ['reference/catalog', 'en/reference/catalog', 'en/reference/manifest-versions', 'en/reference/settings-ui']) {
      await page.goto(route)
      await ready(page)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      const language = page.locator('.VPNavBarTranslations')
      await expect(language).toBeVisible()
      const rect = await language.boundingBox()
      expect(rect!.x + rect!.width).toBeLessThanOrEqual(width)
    }
  }
  await page.setViewportSize(testInfo.project.use.viewport!)
  for (const id of ['index', 'catalog', 'settings-ui']) {
    await page.goto('en/reference/' + (id === 'index' ? '' : id))
    await ready(page)
    await page.screenshot({ path: `artifacts/w5/${testInfo.project.name}-${id}.png` })
  }
})
