import assert from 'node:assert/strict';
import path from 'node:path';
import { readJson, inside, files, assertFingerprint } from './locked-inputs.mjs';

// Public projections contain identities and bounded observations, never WorldFinal.
export async function loadPackRuntimeEvidence(context, receipts) {
  const record = await readJson(path.join(context.root, 'metadata/w6-runtime.json'));
  assert.equal(record.schemaVersion, 1); assert.equal(record.status, 'observed-with-limits');
  assert.equal(record.baselineId, context.lock.baselineId); assert.equal(record.sourceCommit, context.lock.upstream.commit);
  assert.equal(record.host.sourceHead, record.sourceCommit);
  assert.equal(record.method.independentHumanReader, false);
  assert.equal(record.method.numericValueReadback, false); assert.equal(record.method.performanceGatePassed, null);
  const inventory = new Map(), publicRoot = path.join(context.root, 'site/public');
  for (const file of record.publicFiles) {
    assert.match(file.path, /^(?:evidence\/w6\/[a-z0-9-]+\.json|media\/w6\/[a-z0-9-]+\.jpg)$/);
    assert.ok(!inventory.has(file.path), 'Duplicate W6 public asset');
    await assertFingerprint(inside(publicRoot, file.path), file); inventory.set(file.path, file);
  }
  for (const scope of ['evidence/w6', 'media/w6']) assert.deepEqual((await files(inside(publicRoot, scope))).map(f => scope + '/' + f), [...inventory.keys()].filter(f => f.startsWith(scope + '/')).sort(), 'W6 public inventory');
  const registered = url => {
    assert.ok(typeof url === 'string' && url.startsWith('/') && inventory.has(url.slice(1)), `Unregistered W6 asset: ${url}`);
    return inside(publicRoot, url.slice(1));
  };
  const examples = context.examples.filter(e => e.validationStage === 'w6');
  assert.deepEqual(record.examples.map(e => e.id).sort(), examples.map(e => e.id).sort());
  for (const item of record.examples) {
    const example = examples.find(e => e.id === item.id), receipt = receipts.examples.find(e => e.id === item.id);
    for (const key of ['sourceFingerprint', 'archiveSha256']) assert.equal(item[key], example[key], `W6 stale runtime ${key}`);
    assert.equal(item.manifestHash, receipt.manifestHash);
    registered(item.image);
    const life = await readJson(registered(item.lifecycle)), active = 'External:' + example.id.split('/')[1];
    assert.equal(life.status, 'passed'); assert.equal(life.sourceFingerprint, item.sourceFingerprint); assert.equal(life.archiveSha256, item.archiveSha256);
    for (const [phase, selection] of [['loaded', active], ['reloaded', active], ['resized', active], ['builtIn', 'BuiltIn']]) {
      assert.equal(life[phase].error, null); assert.equal(life[phase].pending, 0); assert.equal(life[phase].active, selection);
    }
    assert.ok(life.reloaded.published > life.loaded.published);
    assert.notDeepEqual(life.resized.size, life.loaded.size, 'W6 resize must change dimensions');
    assert.deepEqual(life.builtIn.size, life.loaded.size);
    assert.deepEqual(life.variants.map(v => v.id), example.variants.map(v => v.id), 'W6 missing branch observations');
    let generation = life.reloaded.published;
    for (const v of life.variants) {
      const declared = example.variants.find(d => d.id === v.id), branch = receipt.branches.find(b => b.id === v.id);
      assert.deepEqual(v.options, declared.options);
      assert.equal(v.status.error, null); assert.equal(v.status.pending, 0); assert.equal(v.status.active, active);
      assert.ok(v.status.published >= generation); generation = v.status.published;
      assert.equal(v.header.generationId, v.status.published); assert.equal(v.header.manifestHash, item.manifestHash);
      for (const o of example.manifest.options) assert.equal(v.header.options.find(x => x.id === o.id)?.value, String(v.options[o.id] ?? o.default), 'W6 runtime option mismatch');
      assert.deepEqual(v.linkedPrograms.slice().sort(), branch.activePrograms.map(p => p.replace(/^program:/, '')).sort(), 'W6 linked closure mismatch');
      assert.equal(v.driver.published, true); assert.equal(v.driver.linked, true); assert.equal(v.driver.framebuffersComplete, true);
      for (const sha of [v.driver.sha256, v.driver.reportHash, v.header.generationSourceFingerprint]) assert.match(sha, /^[a-f0-9]{64}$/);
      if (example.manifest.customData) {
        assert.equal(v.data.driverStatus, 'matched'); assert.equal(v.data.interfaceComplete, true);
        assert.equal(v.data.valueReadback, 'notProvided'); assert.equal(v.data.liveWorldVerified, false);
        assert.deepEqual(v.data.preparedBindings.map(b => b.symbol).sort(), (v.options['course:grade'] ?? true) ? ['u_day', 'u_gain', 'u_rain'] : []);
        if (example.manifest.materials) {
          assert.equal(v.data.materials.worldResolutionPassed, true); assert.ok(v.data.materials.byteSize > 0);
          assert.equal(v.data.materials.recordCount, 3); assert.equal(v.data.materials.propertyCount, 2);
        }
      }
    }
    assert.ok(life.builtIn.published > generation);
    assert.equal(life.capture.sourceFingerprint, item.sourceFingerprint); assert.equal(life.capture.status.active, active);
    assert.equal(life.capture.status.error, null);
  }
  const reader = await readJson(registered(record.readerReproduction)), final = examples.find(e => e.id === 'course/10-distribution');
  assert.equal(reader.status, 'passed'); assert.equal(reader.independentHumanReader, false);
  assert.equal(reader.sourceFingerprint, final.sourceFingerprint); assert.equal(reader.archiveSha256, final.archiveSha256);
  assert.deepEqual(reader.presets.map(p => p.id), ['balanced', 'economy', 'neutral']);
  assert.ok(reader.presets.every(p => p.status.error === null));
  assert.notEqual(reader.edit.originalSha256, reader.edit.modifiedSha256);
  assert.ok(reader.edit.restoredSource.published > reader.edit.edited.published);
  assert.equal(reader.originalInventoryRestored, true); assert.equal(reader.restored.active, 'BuiltIn');
  assert.notDeepEqual(reader.resized.size, reader.loaded.size);
  registered(record.settingsImage);
  registered(record.settingsAppliedImage);
  const settings = await readJson(registered(record.settingsObservation));
  assert.ok(settings.after.published > settings.beforeGeneration);
  assert.equal(settings.after.error, null); assert.equal(settings.options.find(o => o.id === 'course:glow').value, 'false');
  assert.ok(!settings.linkedPrograms.includes('course:post/glow'));
  return record;
}
