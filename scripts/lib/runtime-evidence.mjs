import assert from 'node:assert/strict';
import path from 'node:path';
import { readJson, inside, files, assertFingerprint } from './locked-inputs.mjs';

// Validate committed observations without requiring a GPU or the private host.
export async function loadRuntimeEvidence(context, receipts) {
  const record = await readJson(path.join(context.root, 'metadata/w4-runtime.json'));
  assert.equal(record.schemaVersion, 1, 'Runtime evidence schema');
  assert.equal(record.baselineId, context.lock.baselineId, 'Runtime evidence baseline');
  assert.equal(record.sourceCommit, context.lock.upstream.commit, 'Runtime evidence commit');
  assert.equal(record.host.sourceHead, record.sourceCommit, 'Runtime host commit');
  assert.equal(record.status, 'observed-with-limits');
  assert.equal(record.method.independentHumanReader, false, 'Independent human trial is pending');
  const publicRoot = path.join(context.root, 'site/public');
  const inventory = new Map();
  for (const file of record.publicFiles) {
    assert.match(file.path, /^(?:evidence\/w4\/[a-z0-9-]+\.json|media\/w4\/[a-z0-9-]+\.jpg)$/, 'Runtime public file scope');
    assert.ok(!inventory.has(file.path), `Duplicate runtime file: ${file.path}`);
    await assertFingerprint(inside(publicRoot, file.path), file);
    inventory.set(file.path, file);
  }
  for (const scope of ['evidence/w4', 'media/w4']) {
    assert.deepEqual((await files(inside(publicRoot, scope))).map(name => `${scope}/${name}`), [...inventory.keys()].filter(name => name.startsWith(scope + '/')).sort(), 'Runtime public inventory');
  }
  function registered(url, sha256) {
    assert.ok(typeof url === 'string' && url.startsWith('/'), 'Runtime URL must be site-root relative');
    const file = inventory.get(url.slice(1));
    assert.ok(file, `Unregistered runtime asset: ${url}`);
    if (sha256) assert.equal(file.sha256, sha256, `Runtime asset identity: ${url}`);
    return inside(publicRoot, file.path);
  }
  assert.deepEqual(record.examples.map(item => item.id).sort(), context.examples.map(item => item.id).sort(), 'Runtime example IDs');
  for (const item of record.examples) {
    const example = context.examples.find(example => example.id === item.id);
    const receipt = receipts.examples.find(example => example.id === item.id);
    for (const key of ['sourceFingerprint', 'archiveSha256']) assert.equal(item[key], example[key], `${item.id}: stale runtime evidence (${key})`);
    assert.equal(item.manifestHash, receipt.manifestHash, `${item.id}: runtime manifest`);
    assert.equal(item.driverStatus, 'matched');
    const driver = await readJson(registered(item.driverReport, item.driverReportSha256));
    assert.equal(driver.evidence, 'driverObserved');
    assert.equal(driver.published, true);
    assert.equal(driver.reportHash, item.driverReportHash);
    for (const key of ['manifestHash', 'generationId', 'deviceEpoch', 'generationSourceFingerprint', 'graphicsApi', 'driverRenderer']) assert.equal(driver.header[key], item[key], `${item.id}: driver ${key}`);
    assert.equal(driver.programs.length, item.linkedPrograms);
    assert.ok(driver.programs.length && driver.programs.every(program => program.linked), `${item.id}: unlinked program`);
    assert.equal(item.framebuffersComplete, true);
    assert.ok(driver.framebuffers.length && driver.framebuffers.every(target => target.complete), `${item.id}: incomplete framebuffer`);
    assert.deepEqual(item.interfaces.map(entry => entry.program).sort(), [...example.programs].sort(), `${item.id}: missing Program evidence`);
    for (const entry of item.interfaces) {
      const report = await readJson(registered(entry.url, entry.sha256));
      assert.equal(report.success, true);
      assert.equal(report.driverStatus, 'matched');
      assert.equal(report.contractVersion, entry.contractVersion);
      assert.equal(report.programId, entry.program);
      assert.equal(report.manifestHash, item.manifestHash);
      assert.equal(report.driverObserved.reportHash, item.driverReportHash);
      assert.equal(report.driverObserved.generationId, item.generationId);
      assert.ok(driver.programs.some(program => program.programId === entry.program && program.sourceClosureSha256 === report.staticReflection.sourceClosureSha256 && program.effectiveCompilationFingerprint === report.staticReflection.effectiveCompilationFingerprint), `${item.id}: unmatched source closure`);
    }
    const lifecycle = await readJson(registered(item.lifecycle));
    assert.equal(lifecycle.id, item.id.split('/')[1]);
    assert.equal(lifecycle.status, 'passed');
    for (const [phase, active] of [['loaded', `External:${lifecycle.id}`], ['reloaded', `External:${lifecycle.id}`], ['resized', `External:${lifecycle.id}`], ['builtIn', 'BuiltIn']]) {
      assert.equal(lifecycle[phase].error, null, `${item.id}: ${phase} error`);
      assert.equal(lifecycle[phase].pending, 0);
      assert.equal(lifecycle[phase].active, active);
    }
    assert.ok(lifecycle.reloaded.published > lifecycle.loaded.published);
    assert.equal(lifecycle.reloaded.published, item.generationId);
    assert.ok(lifecycle.builtIn.published > lifecycle.reloaded.published);
    assert.notDeepEqual(lifecycle.resized.size, lifecycle.loaded.size, `${item.id}: resize must change dimensions`);
    assert.deepEqual(lifecycle.builtIn.size, lifecycle.loaded.size, `${item.id}: window size not restored`);
    assert.equal(lifecycle.driver.manifestHash, item.manifestHash);
    assert.equal(lifecycle.driver.generationId, item.generationId);
    registered(item.image, item.imageSha256);
  }
  const reader = await readJson(registered(record.readerReproduction));
  const example = context.examples.find(item => item.id === 'course/01-first-post');
  assert.equal(reader.independentHumanReader, false);
  assert.equal(reader.sourceFingerprint, example.sourceFingerprint);
  assert.equal(reader.archiveSha256, example.archiveSha256);
  assert.deepEqual(reader.variants.map(item => item.strength), ['0.0', '1.0']);
  let generation = reader.loaded.published;
  for (const variant of reader.variants) {
    assert.equal(variant.result.error, null);
    assert.ok(variant.result.published > generation);
    generation = variant.result.published;
  }
  assert.equal(reader.restored.active, 'BuiltIn');
  assert.ok(reader.restored.published > generation);
  return record;
}
