import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, files, writeJson, fingerprint } from './lib/locked-inputs.mjs';

const dist = path.join(ROOT, 'site/.vitepress/dist');
const base = '/dawnlight-core-docs/';
const host = 'https://eltancex.github.io';
const names = await files(dist), htmlFiles = names.filter(f => f.endsWith('.html'));
assert.equal(htmlFiles.length, 7);
const contents = new Map(await Promise.all(htmlFiles.map(async f => [f, await fs.readFile(path.join(dist, f), 'utf8')])));
const ids = new Map([...contents].map(([file, html]) => [file, new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]))]));
let localLinks = 0, assets = 0, anchors = 0;
for (const [file, html] of contents) {
  assert.match(html, /<html[^>]+lang="zh-CN"/);
  for (const match of html.matchAll(/<(a|link|script|img)\b[^>]*?\b(?:href|src)="([^"]+)"/g)) {
    const href = match[2].replaceAll('&amp;', '&');
    if (!href || /^(?:data:|mailto:|tel:|javascript:)/.test(href)) continue;
    const url = new URL(href, `${host}${base}${file}`);
    if (url.origin !== host) continue;
    assert.ok(url.pathname.startsWith(base), `${file}: escaped project base: ${href}`);
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
assert.match(sitemap, /https:\/\/eltancex\.github\.io\/dawnlight-core-docs\/concepts\/pipeline/);
assert.ok(!sitemap.includes('/dawnlight-core-docs/dawnlight-core-docs/'));
for (const name of ['index.html', 'concepts/pipeline.html', 'compatibility/current-baseline.html', '404.html', 'downloads/site-baseline.json']) assert.ok(names.includes(name));
assert.ok(names.some(f => /(?:zh|localSearchIndex|local-search-index|hashmap)/i.test(f)), 'Built search data missing');
const inventory = await Promise.all(names.map(async file => ({ path: file, ...await fingerprint(path.join(dist, file)) })));
await writeJson(path.join(ROOT, 'artifacts/w2/site-build.json'), { status: 'passed', base, htmlPages: htmlFiles.length, localLinks, assets, anchors, files: inventory });
console.log(JSON.stringify({ status: 'passed', htmlPages: htmlFiles.length, localLinks, assets, anchors, base }, null, 2));
