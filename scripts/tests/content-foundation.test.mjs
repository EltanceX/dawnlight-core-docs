import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, hash, readJson, jsonBytes, writeJson, extractLocked, verifyInventory, zipEntries, unzipEntries } from '../lib/locked-inputs.mjs';
import { loadExamples, loadReceipts, snippet, applyOutputs, managedOutput, frontmatter } from '../lib/content-foundation.mjs';
import { exampleOutputs } from '../lib/example-generator.mjs';
import { analyzerRunner } from '../lib/analyzer-runner.mjs';

async function fixture(t) {
  await fs.mkdir(path.join(ROOT, '.cache'), { recursive: true });
  const root = await fs.mkdtemp(path.join(ROOT, '.cache/content-test-'));
  t.after(async () => {
    const target = path.resolve(root), parent = path.resolve(ROOT, '.cache');
    assert.equal(path.dirname(target), parent);
    assert.ok(path.basename(target).startsWith('content-test-'));
    await fs.rm(target, { recursive: true, force: true });
  });
  for (const name of ['examples', 'metadata']) await fs.mkdir(path.join(root, name));
  await fs.cp(path.join(ROOT, 'examples'), path.join(root, 'examples'), { recursive: true });
  for (const name of ['upstream.lock.json', 'metadata/examples-validation.json', 'metadata/source-map.json', 'metadata/pages.json', 'metadata/example-releases.json']) await fs.copyFile(path.join(ROOT, name), path.join(root, name));
  return root;
}

test('the public source and committed receipt agree', async () => {
  const context = await loadExamples();
  const report = await loadReceipts(context);
  assert.equal(report.examples.length, 1);
  assert.equal(report.examples[0].checks.length, 4);
});

for (const [name, mutate, expected] of [
  ['duplicate example IDs', registry => registry.examples.push(registry.examples[0]), /duplicate ID/],
  ['wrong baseline', registry => registry.baselineId = 'wrong', /wrong baseline/],
  ['wrong source commit', registry => registry.sourceCommit = '0'.repeat(40), /wrong source commit/],
  ['source path traversal', registry => registry.examples[0].root = 'examples/../private', /Unsafe relative path/],
  ['missing snippet source', registry => registry.examples[0].snippets[0].file = 'missing.psh', /course\/00-starter: snippet manifest: missing file missing.psh/],
  ['stale JSON pointer', registry => registry.examples[0].snippets[1].pointer = '/frameTarget/missing', /shaderpack.json#\/frameTarget\/missing: stale snippet/],
  ['unregistered option branch', registry => registry.examples[0].variants.push({ id: 'off' }), /new branches need explicit validation/]
]) {
  test(`registry rejects ${name}`, async t => {
    const root = await fixture(t), file = path.join(root, 'examples/registry.json');
    const registry = await readJson(file); mutate(registry); await writeJson(file, registry);
    await assert.rejects(loadExamples(root), expected);
  });
}

test('missing and unexpected source files are rejected before packaging', async t => {
  const root = await fixture(t);
  const file = path.join(root, 'examples/course/00-starter/shaders/present.psh');
  await fs.rename(file, file + '.log');
  await assert.rejects(loadExamples(root), /course\/00-starter: missing or extra source file/);
});

test('source edits invalidate the Analyzer receipt', async t => {
  const root = await fixture(t);
  await fs.appendFile(path.join(root, 'examples/course/00-starter/shaders/present.psh'), '// changed\n');
  await assert.rejects(loadReceipts(await loadExamples(root)), /stale validation receipt \(sourceFingerprint\)/);
});

test('region selection rejects duplicate and missing boundaries', () => {
  const example = { id: 'fixture/region', entries: [{ path: 'shader.glsl', bytes: Buffer.from('// #region main\na\n// #endregion main\n// #region main\nb\n// #endregion main\n') }] };
  assert.throws(() => snippet(example, { id: 'main', file: 'shader.glsl', region: 'main' }), /duplicate region/);
  assert.throws(() => snippet(example, { id: 'gone', file: 'shader.glsl', region: 'gone' }), /missing\/duplicate region/);
});

test('published source and archive identities cannot be silently replaced', async t => {
  const root = await fixture(t), file = path.join(root, 'metadata/example-releases.json');
  const releases = await readJson(file);
  releases.examples[0].archiveSha256 = '0'.repeat(64);
  await writeJson(file, releases);
  await assert.rejects(loadReceipts(await loadExamples(root)), /published release is immutable \(archiveSha256\)/);
});

test('ZIP is deterministic, extracts without a wrapper folder, and rejects modified contents', async t => {
  const root = await fixture(t), a = await loadExamples(root), b = await loadExamples(root);
  assert.equal(hash(a.examples[0].archiveBytes), hash(b.examples[0].archiveBytes));
  const archive = path.join(root, 'starter.zip'), extracted = path.join(root, 'extracted');
  await fs.writeFile(archive, a.examples[0].archiveBytes);
  await extractLocked(archive, extracted);
  await verifyInventory(extracted, a.examples[0].inventory);
  await fs.appendFile(path.join(extracted, 'shaderpack.json'), ' ');
  await assert.rejects(verifyInventory(extracted, a.examples[0].inventory), /Fingerprint mismatch.*shaderpack.json/);
});

test('generation is deterministic, preserves source bytes and detects edited derived pages', async t => {
  const root = await fixture(t), context = await loadExamples(root), report = await loadReceipts(context);
  const registry = await readJson(path.join(root, 'metadata/pages.json'));
  const a = exampleOutputs(context, report, registry), b = exampleOutputs(context, report, registry);
  assert.equal(hash(jsonBytes([...a].map(([name, bytes]) => [name, hash(bytes)]))), hash(jsonBytes([...b].map(([name, bytes]) => [name, hash(bytes)]))));
  await applyOutputs(a, { root });
  await applyOutputs(b, { root, check: true });
  assert.equal((await loadExamples(root)).examples[0].sourceFingerprint, context.examples[0].sourceFingerprint);
  await fs.appendFile(path.join(root, 'site/examples/course-starter.md'), 'edited');
  await assert.rejects(applyOutputs(b, { root, check: true }), /Stale generated output: site\/examples\/course-starter.md/);
});

test('generator cannot overwrite the unique example source', () => {
  assert.throws(() => managedOutput('examples/course/00-starter/shaderpack.json'), /Refuse to overwrite source/);
  assert.throws(() => managedOutput('site/examples/../../examples/registry.json'), /Unsafe relative path/);
});

test('frontmatter rejects duplicate keys instead of silently changing the baseline', () => {
  assert.throws(() => frontmatter('---\ntitle: A\ntitle: B\n---\n', 'fixture.md'), /fixture.md: invalid frontmatter/);
});

test('portable ZIP reader rejects traversal, duplicate paths and corrupt payloads before extraction', () => {
  const duplicate = zipEntries([{ path: 'A.txt', bytes: Buffer.from('x') }, { path: 'a.txt', bytes: Buffer.from('x') }]);
  assert.throws(() => unzipEntries(duplicate), /duplicate path/);
  const escape = zipEntries([{ path: 'safe.txt', bytes: Buffer.from('x') }]);
  // Same-length replacement in both local and central names.
  for (let offset = 0; (offset = escape.indexOf('safe.txt', offset)) >= 0; offset += 8) escape.write('../x.txt', offset);
  assert.throws(() => unzipEntries(escape), /Unsafe relative path/);
  const corrupt = zipEntries([{ path: 'file.txt', bytes: Buffer.from('payload') }]);
  const central = corrupt.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
  corrupt.writeUInt32LE(0, central + 16);
  assert.throws(() => unzipEntries(corrupt), /CRC mismatch/);
});

for (const [exit, kind] of [[1, 'contract-failure'], [2, 'command-misuse']]) {
  test(`Analyzer wrapper distinguishes ${kind} and saves diagnostics`, async t => {
    const root = await fixture(t);
    const invoke = analyzerRunner(process.execPath, { cwd: root, output: path.join(root, 'reports') });
    await assert.rejects(invoke('pack', ['-e', `process.stdout.write(JSON.stringify({valid:false,diagnostics:[{file:'shaderpack.json',code:'fixture'}]}));process.exit(${exit})`], { packRoot: root, exampleId: 'course/00-starter' }), error => error.report.failureKind === kind && error.report.diagnostics[0].file === 'shaderpack.json');
    assert.equal((await readJson(path.join(root, 'reports/pack.result.json'))).exitCode, exit);
  });
}
