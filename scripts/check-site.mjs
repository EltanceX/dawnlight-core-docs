import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, readJson, loadLock, files, run, assertFingerprint, jsonBytes } from './lib/locked-inputs.mjs';
import { publicBaseline } from './sync-site-baseline.mjs';
import { expectedPages, pagePaths, localePrefixes } from './lib/site-pages.mjs';
import { loadExamples, loadReceipts } from './lib/content-foundation.mjs';
import { exampleOutputs } from './lib/example-generator.mjs';
import { loadRuntimeEvidence } from './lib/runtime-evidence.mjs';

const pkg = await readJson(path.join(ROOT, 'package.json'));
assert.equal(process.versions.node, pkg.engines.node, `Use Node ${pkg.engines.node} from .node-version`);
const lock = await loadLock();
assert.equal(lock.website.pagesBase, '/');
assert.equal(lock.website.pagesUrl, `https://${lock.website.customDomain}/`);
assert.equal((await fs.readFile(path.join(ROOT, 'site/public/CNAME'), 'utf8')).trim(), lock.website.customDomain);
for (const item of [...Object.values(lock.discoveryRecords), lock.tool.distribution.inventory, lock.w1Verification, ...[lock.w2Verification, lock.w3Verification, lock.w4Verification].filter(Boolean)]) {
  await assertFingerprint(path.join(ROOT, item.path), item);
}
if (lock.w4Verification) {
  const stage = await readJson(path.join(ROOT, lock.w4Verification.path));
  for (const item of stage.evidence) await assertFingerprint(path.join(ROOT, item.path), item);
}
const source = await readJson(path.join(ROOT, 'metadata/public-source.json'));
assert.equal(source.commit, lock.upstream.commit);
assert.equal(source.repositoryUrl, lock.upstream.publicRepositoryUrl);
assert.equal(source.anonymousAccessVerified, true);
const expected = jsonBytes(await publicBaseline());
assert.ok((await fs.readFile(path.join(ROOT, 'site/public/downloads/site-baseline.json'))).equals(expected), 'Public baseline projection must match lock');
const siteFiles = (await files(path.join(ROOT, 'site'))).filter(f => !f.startsWith('.vitepress/dist/') && !f.startsWith('.vitepress/cache/'));
const pages = siteFiles.filter(f => f.endsWith('.md') && !f.startsWith('public/'));
assert.deepEqual(pages.sort(), expectedPages, 'Each published page needs a Chinese and English counterpart');
for (const name of pages) {
  const content = await fs.readFile(path.join(ROOT, 'site', name), 'utf8');
  assert.match(content, /^---\r?\n[\s\S]*?title:/);
  const relativePage = name.replace(/^en\//, '');
  if (!['index.md', '404.md'].includes(relativePage)) {
    assert.match(content, /description:/); assert.match(content, /<BaselineNote\s*\/>/);
  }
  assert.doesNotMatch(content, /(?:TODO|TBD|待编写页面|E:\\sc\\)/);
}
for (const page of pagePaths) {
  const [zh, en] = await Promise.all(localePrefixes.map(prefix => fs.readFile(path.join(ROOT, 'site', prefix + page), 'utf8')));
  const examples = content => [...content.replaceAll('\r', '').matchAll(/^```(json|powershell)[^\n]*\n([\s\S]*?)^```/gm)].map(m => ({ language: m[1], code: m[2] }));
  assert.deepEqual(examples(en), examples(zh), `Technical examples must stay identical: ${page}`);
  const anchors = content => [...content.matchAll(/\{#([\w-]+)\}/g)].map(m => m[1]);
  assert.deepEqual(anchors(en), anchors(zh), `Section anchors must match between languages: ${page}`);
}
for (const name of siteFiles.filter(f => !f.startsWith('public/'))) {
  const content = await fs.readFile(path.join(ROOT, 'site', name), 'utf8');
  assert.doesNotMatch(content, /vendor[/\\]dawnlight|(?:ghp_|github_pat_)[A-Za-z0-9_]{25,}/, `Private import or credential in ${name}`);
}
const examples = await loadExamples();
const generated = exampleOutputs(examples, await loadReceipts(examples), await readJson(path.join(ROOT, 'metadata/pages.json')));
const generatedPublic = [...generated.keys()].filter(name => name.startsWith('site/public/')).map(name => name.slice('site/'.length));
const runtime = await loadRuntimeEvidence(examples, await loadReceipts(examples));
assert.deepEqual(siteFiles.filter(f => f.startsWith('public/')).sort(), ['public/CNAME', 'public/downloads/site-baseline.json', 'public/favicon.svg', ...generatedPublic, ...runtime.publicFiles.map(file => 'public/' + file.path)].sort());
const tracked = run('git', ['ls-files', '-z'], { allowFailure: true });
let trackedFiles = 0;
if (tracked.status === 0) {
  const names = tracked.stdout.toString('utf8').split('\0').filter(Boolean);
  trackedFiles = names.length;
  for (const name of names) assert.doesNotMatch(name, /^(?:vendor|artifacts|\.cache|node_modules)\/|\.(?:dll|exe|zip|tar)$/i, `Unexpected published source file ${name}`);
}
console.log(JSON.stringify({ status: 'passed', locales: ['zh-CN', 'en-US'], publicPages: pages.length - 2, notFoundPages: 2, sourceCommit: lock.upstream.commit, privateSnapshotRequired: false, trackedFiles }, null, 2));
