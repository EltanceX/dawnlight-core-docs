import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, readJson, writeJson, hash, jsonBytes } from '../lib/locked-inputs.mjs';
import { loadExamples, loadReceipts, composeExampleManifest } from '../lib/content-foundation.mjs';
import { loadPackRuntimeEvidence } from '../lib/pack-runtime-evidence.mjs';

test('six packs cover every optional closure and preserve the five previous releases', async () => {
  const c = await loadExamples(), r = await loadReceipts(c);
  const packs = c.examples.filter(e => e.validationStage === 'w6');
  assert.equal(packs.length, 6);
  assert.equal(r.examples.filter(e => e.branches).reduce((n, e) => n + e.branches.length, 0), 26);
  for (const e of packs) {
    const receipt = r.examples.find(x => x.id === e.id);
    const off = receipt.branches.find(b => b.id === 'grade-off');
    assert.ok(off.activeResources.every(id => !id.startsWith('resource:course:post/')));
    assert.ok(off.activePrograms.every(id => !id.includes('/grade') && !id.includes('/glow')));
    for (const branch of receipt.branches) assert.equal(branch.activeCommands.filter(id => id.startsWith('command:course:present-')).length, 1);
    if (e.manifest.materials) assert.ok(off.activeResources.includes('resource:course:materials'));
  }
  const legacy = await readJson(path.join(ROOT, 'metadata/example-releases.json'));
  assert.equal(legacy.examples.length, 5);
  for (const e of legacy.examples) assert.equal(c.examples.find(x => x.id === e.id).archiveSha256, e.archiveSha256);
});

test('composed final pack is complete and rejects traversal, nesting and duplicate modules', async () => {
  const c = await loadExamples(), e = c.examples.at(-1);
  assert.equal(e.manifest.fragments.length, 5); assert.equal(e.manifest.programs.length, 4);
  assert.equal(e.manifest.materials.fallback, 'course:neutral');
  const root = JSON.parse(e.entries.find(x => x.path === 'shaderpack.json').bytes);
  assert.ok(!Object.hasOwn(root, 'sceneCategories'));
  const entries = e.entries.map(x => ({ ...x }));
  const replace = value => { entries.find(x => x.path === 'shaderpack.json').bytes = Buffer.from(JSON.stringify(value)); };
  replace({ ...root, fragments: ['../secret.json'] });
  assert.throws(() => composeExampleManifest(entries), /Unsafe relative path/);
  replace({ ...root, fragments: ['manifest/data.json', 'manifest/data.json'] });
  assert.throws(() => composeExampleManifest(entries), /Duplicate course fragment field/);
  replace(root);
  entries.find(x => x.path === 'manifest/data.json').bytes = Buffer.from('{"fragments":["other.json"]}');
  assert.throws(() => composeExampleManifest(entries), /Nested course fragments/);
});

test('preset override files retain Number transport at integral endpoints', async () => {
  const c = await loadExamples();
  for (const e of c.examples.filter(e => e.manifest.fragments)) {
    for (const f of e.entries.filter(f => f.path.startsWith('presets/'))) {
      assert.match(f.bytes.toString(), /"course:gain": 1\.0/);
      const values = JSON.parse(f.bytes);
      assert.deepEqual(Object.keys(values).sort(), e.manifest.options.map(o => o.id).sort());
    }
  }
});

test('actual observations cover 26 branches and a fresh final ZIP without human or numeric claims', async () => {
  const c = await loadExamples(), r = await loadPackRuntimeEvidence(c, await loadReceipts(c));
  assert.equal(r.examples.reduce((n, e) => n + e.branches, 0), 26);
  assert.equal(r.method.independentHumanReader, false); assert.equal(r.method.numericValueReadback, false);
});

async function fixture(t) {
  await fs.mkdir(path.join(ROOT, '.cache'), { recursive: true });
  const root = await fs.mkdtemp(path.join(ROOT, '.cache/pack-test-'));
  t.after(async () => { assert.equal(path.dirname(root), path.join(ROOT, '.cache')); assert.ok(path.basename(root).startsWith('pack-test-')); await fs.rm(root, { recursive: true, force: true }); });
  for (const name of ['examples', 'metadata', 'site/public/evidence/w6', 'site/public/media/w6']) await fs.cp(path.join(ROOT, name), path.join(root, name), { recursive: true });
  await fs.copyFile(path.join(ROOT, 'upstream.lock.json'), path.join(root, 'upstream.lock.json'));
  return root;
}
for (const [name, mutate, expected] of [
  ['a missing branch', life => life.variants.pop(), /missing branch observations/],
  ['a stale option', life => life.variants[0].header.options.find(o => o.id === 'course:grade').value = 'false', /runtime option mismatch/],
  ['an unchanged resize', life => life.resized.size = life.loaded.size, /resize must change/],
  ['a mismatched linked closure', life => life.variants[0].linkedPrograms.pop(), /linked closure mismatch/]
]) test(`runtime evidence rejects ${name} after inventory hashes are refreshed`, async t => {
  const root = await fixture(t), file = 'evidence/w6/10-distribution-lifecycle.json';
  const life = await readJson(path.join(root, 'site/public', file)); mutate(life);
  const bytes = jsonBytes(life); await fs.writeFile(path.join(root, 'site/public', file), bytes);
  const record = await readJson(path.join(root, 'metadata/w6-runtime.json'));
  Object.assign(record.publicFiles.find(f => f.path === file), { length: bytes.length, sha256: hash(bytes) });
  await writeJson(path.join(root, 'metadata/w6-runtime.json'), record);
  const c = await loadExamples(root);
  await assert.rejects(loadPackRuntimeEvidence(c, await loadReceipts(c)), expected);
});
