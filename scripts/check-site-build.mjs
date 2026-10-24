import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, files, writeJson, fingerprint, loadLock } from './lib/locked-inputs.mjs';
import { expectedPages } from './lib/site-pages.mjs';

const dist = path.join(ROOT, 'site/.vitepress/dist');
const { website } = await loadLock();
const base = website.pagesBase;
const host = new URL(website.pagesUrl).origin;
const names = await files(dist), htmlFiles = names.filter(f => f.endsWith('.html'));
assert.deepEqual(htmlFiles.sort(), expectedPages.map(page => page.replace(/\.md$/, '.html')).sort());
const contents = new Map(await Promise.all(htmlFiles.map(async f => [f, await fs.readFile(path.join(dist, f), 'utf8')])));
const ids = new Map([...contents].map(([file, html]) => [file, new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]))]));
let localLinks = 0, assets = 0, anchors = 0;
for (const [file, html] of contents) {
  assert.match(html, file.startsWith('en/') ? /<html[^>]+lang="en-US"/ : /<html[^>]+lang="zh-CN"/);
  if (/(^|\/)404\.html$/.test(file)) {
    assert.ok(!html.includes('rel="canonical"'), `${file}: 404 has no canonical page`);
  } else {
    const route = file.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '');
    const chineseRoute = route.replace(/^en\//, '');
    assert.ok(html.includes(`rel="canonical" href="${host}${base}${route}"`), `${file}: canonical URL`);
    for (const [language, prefix] of [['zh-CN', ''], ['en-US', 'en/']]) {
      assert.ok(html.includes(`hreflang="${language}" href="${host}${base}${prefix}${chineseRoute}"`), `${file}: alternate ${language}`);
    }
  }
  for (const match of html.matchAll(/<(a|link|script|img)\b[^>]*?\b(?:href|src)="([^"]+)"/g)) {
    const href = match[2].replaceAll('&amp;', '&');
    if (!href || /^(?:data:|mailto:|tel:|javascript:)/.test(href)) continue;
    const url = new URL(href, `${host}${base}${file}`);
    if (url.origin !== host) continue;
    assert.ok(url.pathname.startsWith(base), `${file}: escaped site base: ${href}`);
    assert.ok(!url.pathname.startsWith('/dawnlight-core-docs/'), `${file}: obsolete project prefix: ${href}`);
    let relative = decodeURIComponent(url.pathname.slice(base.length));
    if (!relative || relative.endsWith('/')) relative += 'index.html';
    if (!names.includes(relative) && !path.extname(relative)) relative += '.html';
    assert.ok(names.includes(relative), `${file}: missing target ${href} -> ${relative}`);
    if (match[1] === 'a') localLinks++; else assets++;
    if (url.hash && relative.endsWith('.html')) {
      const id = decodeURIComponent(url.hash.slice(1));
      assert.ok(ids.get(relative)?.has(id), `${file}: missing anchor ${href}`); anchors++;
    }
  }
}
const sitemap = await fs.readFile(path.join(dist, 'sitemap.xml'), 'utf8');
assert.ok(sitemap.includes(`${host}${base}concepts/pipeline`));
assert.ok(sitemap.includes(`${host}${base}en/concepts/pipeline`));
for (const match of sitemap.matchAll(/(?:<loc>|href=")([^<"]+)/g)) {
  const url = new URL(match[1]);
  assert.equal(url.origin, host, 'Sitemap must use the custom domain');
  assert.ok(!url.pathname.startsWith('/dawnlight-core-docs/'), 'Obsolete sitemap base');
  assert.ok(!/(^|\/)404$/.test(url.pathname), '404 must not appear in sitemap');
}
assert.equal((await fs.readFile(path.join(dist, 'CNAME'), 'utf8')).trim(), website.customDomain);
for (const name of ['index.html', 'concepts/pipeline.html', 'compatibility/current-baseline.html', '404.html', 'downloads/site-baseline.json']) assert.ok(names.includes(name));
assert.ok(names.some(f => /(?:zh|localSearchIndex|local-search-index|hashmap)/i.test(f)), 'Built search data missing');
const inventory = await Promise.all(names.map(async file => ({ path: file, ...await fingerprint(path.join(dist, file)) })));
await writeJson(path.join(ROOT, 'artifacts/w2/site-build.json'), { status: 'passed', base, htmlPages: htmlFiles.length, localLinks, assets, anchors, files: inventory });
console.log(JSON.stringify({ status: 'passed', htmlPages: htmlFiles.length, localLinks, assets, anchors, base }, null, 2));
