import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, readJson, files, relativeName, inside } from './lib/locked-inputs.mjs';
import { loadExamples, loadReceipts, frontmatter, evidenceBoundary, courseIncludes } from './lib/content-foundation.mjs';
import { loadRuntimeEvidence } from './lib/runtime-evidence.mjs';
import { loadReference } from './lib/reference-foundation.mjs';

const context = await loadExamples();
const receipts = await loadReceipts(context);
await loadRuntimeEvidence(context, receipts);
await loadReference(context);
const registry = await readJson(path.join(ROOT, 'metadata/pages.json'));
const sourceMap = await readJson(path.join(ROOT, 'metadata/source-map.json'));
assert.equal(registry.schemaVersion, 1, 'metadata/pages.json: schema version');
assert.equal(registry.baselineId, context.lock.baselineId, 'metadata/pages.json: baseline');
assert.deepEqual(registry.locales, { 'zh-CN': '', 'en-US': 'en/' });
assert.equal(new Set(registry.pages.map(page => page.path)).size, registry.pages.length, 'Duplicate page registration');
const expectedPages = [];
for (const record of registry.pages) {
  relativeName(record.path);
  assert.ok(['published', 'utility'].includes(record.publication), `${record.path}: publication state`);
  assert.ok(record.sourceRefs.length, `${record.path}: source references required`);
  for (const source of record.sourceRefs) {
    relativeName(source.path);
    if (source.repository === 'upstream') {
      assert.equal(source.commit, context.lock.upstream.commit, `${record.path}: stale source commit`);
      assert.ok(sourceMap.sources.some(entry => entry.path === source.path && entry.commit === source.commit), `${record.path}: unregistered upstream source ${source.path}`);
    } else {
      assert.equal(source.repository, 'website', `${record.path}: unknown source ownership`);
      assert.ok(!/^(vendor|artifacts|\.cache|node_modules)\//.test(source.path), `${record.path}: private source reference`);
      assert.ok((await fs.stat(inside(ROOT, source.path))).isFile(), `${record.path}: missing source ${source.path}`);
    }
  }
  if (record.example) assert.ok(context.examples.some(example => example.id === record.example && (!record.generated || example.page === record.path)), `${record.path}: unregistered example`);
  let pairedIncludes;
  for (const [language, prefix] of Object.entries(registry.locales)) {
    const file = 'site/' + prefix + record.path;
    expectedPages.push(prefix + record.path);
    const content = await fs.readFile(inside(ROOT, file), 'utf8');
    const fm = frontmatter(content, file);
    const includes = courseIncludes(content, context, file);
    if (pairedIncludes) assert.deepEqual(includes, pairedIncludes, `${file}: translated source includes differ`);
    pairedIncludes = includes;
    if (record.example && !record.generated) assert.ok(includes.length && includes.every(name => name.startsWith(`examples/${record.example}/`)), `${file}: chapter must include its own snapshot`);
    assert.ok(typeof fm.title === 'string' && fm.title.length && typeof fm.description === 'string' && fm.description.length, `${file}: title and description required`);
    assert.equal(fm.lang, language, `${file}: language mismatch`);
    const expected = { publication: record.publication, baseline: context.lock.baselineId, manifestVersions: record.manifestVersions, sceneAbiVersions: record.sceneAbiVersions, sourceRefs: record.sourceRefs, ...(record.example ? { example: record.example, verification: { static: 'passed', ...evidenceBoundary } } : {}) };
    assert.deepEqual(fm.dawnlight, expected, `${file}: frontmatter differs from page registry`);
    for (const match of content.matchAll(/<SourceNote\s+path="([^"]+)"/g)) assert.ok(record.sourceRefs.some(source => source.repository === 'upstream' && source.path === match[1]), `${file}: source link absent from registry: ${match[1]}`);
    assert.equal(content.includes('<!-- Generated from '), record.generated, `${file}: generated/source ownership mismatch`);
  }
}
const actualPages = (await files(path.join(ROOT, 'site'))).filter(file => file.endsWith('.md') && !file.startsWith('.vitepress/') && !file.startsWith('public/'));
assert.deepEqual(actualPages.sort(), expectedPages.sort(), 'Unregistered or missing page');
console.log(JSON.stringify({ status: 'passed', registeredPages: expectedPages.length, examples: context.examples.length, sourceRefsVerified: true, liveAnalyzerRun: false, matchingCommittedAnalyzerReceipt: true }, null, 2));
