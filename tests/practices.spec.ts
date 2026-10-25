import {test,expect,type Page} from '@playwright/test'
import {createHash} from 'node:crypto'
import {readFile} from 'node:fs/promises'
import runtime from '../metadata/w7-runtime.json' with {type:'json'}
import diagnostics from '../metadata/w7-diagnostics.json' with {type:'json'}
const sha=(b:Buffer)=>createHash('sha256').update(b).digest('hex')
const ids=['color-balance','vignette','luma-outline']
const routes=['tools/schema','tools/content-snapshots','tools/driver-reports','troubleshooting/','troubleshooting/loading','troubleshooting/image-scene','troubleshooting/targets-bindings','troubleshooting/graph-hazards','troubleshooting/lifecycle-history','troubleshooting/materials','troubleshooting/driver','troubleshooting/configuration-lab','recipes/','recipes/advanced-boundaries','recipes/runtime','cases/']
const hydrated=(page:Page)=>page.waitForFunction(()=>Boolean((document.querySelector('#app') as Element & {__vue_app__?:unknown})?.__vue_app__))

test('W7 tools and seven symptom paths render in both languages',async({page})=>{
  test.setTimeout(120_000)
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
  for(const prefix of ['', 'en/'])for(const route of routes){
    expect((await page.goto(prefix+route))?.status()).toBe(200)
    await expect(page.locator('.vp-doc h1')).toBeVisible()
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  }
  expect(errors).toEqual([])
})

test('effect pages render complete authoritative files, branches and actual images',async({page},info)=>{
  test.setTimeout(120_000)
  for(const prefix of ['', 'en/'])for(const id of ids){
    await page.goto(prefix+'recipes/'+id)
    await expect(page.locator('.course-branches tbody tr')).toHaveCount(3)
    const item=runtime.examples.find(x=>x.id==='features/'+id)!
    await expect(page.locator('.practice-runtime')).toContainText(item.sourceFingerprint)
    const image=page.locator('.practice-runtime img');await image.scrollIntoViewIfNeeded()
    await expect.poll(()=>image.evaluate((e:HTMLImageElement)=>e.complete&&e.naturalWidth>0)).toBe(true)
    const source=await readFile(new URL('../site/'+prefix+'recipes/'+id+'.md',import.meta.url),'utf8')
    const normalize=(s:string)=>s.replaceAll('\r','').trimEnd()
    const blocks=(await page.locator('.vp-doc div[class*="language-"] code').allTextContents()).map(normalize)
    for(const m of source.matchAll(/^<<< @\/\.\.\/([^\s{]+)(?:\{glsl\})?$/gm))expect(blocks).toContain(normalize(await readFile(new URL('../'+m[1],import.meta.url),'utf8')))
  }
  await page.screenshot({path:`artifacts/w7/${info.project.name}-effect.png`})
})

test('new locale switches preserve the investigation and resource anchors',async({page})=>{
  for(const [route,anchor]of [['troubleshooting/configuration-lab','downloads'],['recipes/vignette','flow'],['cases/','makeup']]){
    await page.goto(route+'#'+anchor);await hydrated(page)
    const menu=page.locator('.VPNavBarTranslations')
    await menu.getByRole('button').click();await menu.getByRole('link',{name:'English',exact:true}).click()
    await expect(page).toHaveURL(new RegExp('/en/'+route+'#'+anchor+'$'))
    await expect(page.locator('[id="'+anchor+'"]')).toBeAttached()
  }
})

test('valid effect downloads and expected-rejected ZIPs retain independent hashes',async({request})=>{
  const index=await(await request.get('downloads/examples/index.json')).json()
  const packs=index.examples.filter((e:{id:string})=>e.id.startsWith('features/'));expect(packs).toHaveLength(3)
  for(const e of packs){
    const r=await request.get(e.downloadUrl);expect(r.ok()).toBe(true);expect(sha(await r.body())).toBe(e.archiveSha256)
    const inventory=await(await request.get(e.inventoryUrl)).json()
    for(const f of inventory.files){const response=await request.get(e.sourceBaseUrl+'/'+f.path);expect(response.ok()).toBe(true);expect(sha(await response.body())).toBe(f.sha256)}
  }
  for(const f of diagnostics.cases){const r=await request.get(f.downloadUrl);expect(r.ok()).toBe(true);expect(sha(await r.body())).toBe(f.archiveSha256);expect(index.examples.some((e:{archiveSha256:string})=>e.archiveSha256===f.archiveSha256)).toBe(false)}
  for(const f of runtime.publicFiles){const r=await request.get(f.path);expect(r.ok()).toBe(true);expect(sha(await r.body())).toBe(f.sha256)}
})

test('case diagrams show real read/write relationships and exact versioned sources',async({page},info)=>{
  await page.goto('en/cases/');await hydrated(page)
  await expect(page.locator('.case-study')).toHaveCount(3)
  expect(await page.locator('.case-flow').count()).toBeGreaterThan(10)
  await expect(page.locator('.case-study a[href*="/src/commit/f8aaa5c4218f54536ccf994a2d512aed2e3678b7/"]').first()).toBeVisible()
  await expect(page.locator('.case-study').nth(2)).toContainText('Conditional')
  expect(await page.locator('code.language-mermaid').count()).toBe(0)
  await page.screenshot({path:`artifacts/w7/${info.project.name}-cases.png`,fullPage:true})
})

test('diagnostic search finds the repair lab in each locale',async({page})=>{
  for(const [prefix,button]of [['','搜索文档'],['en/','Search docs']]){
    await page.goto(prefix||'./');await hydrated(page)
    await page.getByRole('button',{name:button,exact:true}).click();await page.locator('#localsearch-input').fill('DLMAN0001')
    await expect(page.locator(`.VPLocalSearchBox a[href*="/${prefix}troubleshooting/configuration-lab"]`).first()).toBeVisible()
  }
})

test('diagram cards, fault pointers and option tables fit 320px',async({page},info)=>{
  await page.setViewportSize({width:320,height:844})
  for(const route of ['cases/','en/cases/','troubleshooting/configuration-lab','en/recipes/luma-outline']){
    await page.goto(route);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  }
  await page.goto('en/troubleshooting/configuration-lab#downloads')
  await page.screenshot({path:`artifacts/w7/${info.project.name}-lab-narrow.png`})
})
