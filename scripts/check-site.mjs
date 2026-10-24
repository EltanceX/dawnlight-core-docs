import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, readJson, loadLock, files, run, assertFingerprint, jsonBytes } from './lib/locked-inputs.mjs';
import { publicBaseline } from './sync-site-baseline.mjs';

const pkg = await readJson(path.join(ROOT, 'package.json'));
assert.equal(process.versions.node, pkg.engines.node, `Use Node ${pkg.engines.node} from .node-version`);
const lock = await loadLock();
for (const item of [...Object.values(lock.discoveryRecords), lock.tool.distribution.inventory, lock.w1Verification]) {
  await assertFingerprint(path.join(ROOT, item.path), item);
}
const source = await readJson(path.join(ROOT, 'metadata/public-source.json'));
assert.equal(source.commit, lock.upstream.commit);
assert.equal(source.repositoryUrl, lock.upstream.publicRepositoryUrl);
assert.equal(source.anonymousAccessVerified, true);
const expected = jsonBytes(await publicBaseline());
assert.ok((await fs.readFile(path.join(ROOT, 'site/public/downloads/site-baseline.json'))).equals(expected), 'Public baseline projection must match lock');
const siteFiles = (await files(path.join(ROOT, 'site'))).filter(f => !f.startsWith('.vitepress/dist/') && !f.startsWith('.vitepress/cache/'));
const pages = siteFiles.filter(f => f.endsWith('.md'));
assert.equal(pages.length, 7, 'W2 publishes six readable pages plus 404');
for (const name of pages) {
  const content = await fs.readFile(path.join(ROOT, 'site', name), 'utf8');
  assert.match(content, /^---\r?\n[\s\S]*?title:/);
  if (!['index.md', '404.md'].includes(name)) {
    assert.match(content, /description:/); assert.match(content, /<BaselineNote\s*\/>/);
  }
  assert.doesNotMatch(content, /(?:TODO|TBD|待编写页面|E:\\sc\\)/);
}
for (const name of siteFiles.filter(f => !f.startsWith('public/'))) {
  const content = await fs.readFile(path.join(ROOT, 'site', name), 'utf8');
  assert.doesNotMatch(content, /vendor[/\\]dawnlight|(?:ghp_|github_pat_)[A-Za-z0-9_]{25,}/, `Private import or credential in ${name}`);
}
assert.deepEqual(siteFiles.filter(f => f.startsWith('public/')).sort(), ['public/downloads/site-baseline.json', 'public/favicon.svg']);
const tracked = run('git', ['ls-files', '-z'], { allowFailure: true });
let trackedFiles = 0;
if (tracked.status === 0) {
  const names = tracked.stdout.toString('utf8').split('\0').filter(Boolean);
  trackedFiles = names.length;
  for (const name of names) assert.doesNotMatch(name, /^(?:vendor|artifacts|\.cache|node_modules)\/|\.(?:dll|exe|zip|tar)$/i, `Unexpected published source file ${name}`);
}
console.log(JSON.stringify({ status: 'passed', publicPages: 6, notFoundPages: 1, sourceCommit: lock.upstream.commit, privateSnapshotRequired: false, trackedFiles }, null, 2));
