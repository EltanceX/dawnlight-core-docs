import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  ROOT, VENDOR, argsOf, loadLock, verifyTool, defaultToolRoot, run,
  fingerprint, writeJson, hash, files
} from './lib/locked-inputs.mjs';
import { verifySnapshot } from './lib/verify-snapshot.mjs';

const options = argsOf(['--tool-root', '--output']);
const lock = await loadLock(), vendor = path.join(ROOT, VENDOR);
const snapshot = await verifySnapshot(vendor, lock);
const toolRoot = options['tool-root'] ? path.resolve(options['tool-root']) : defaultToolRoot(lock);
const tool = await verifyTool(toolRoot, lock);
const exe = path.join(toolRoot, tool.entrypoint);
const external = await fs.mkdtemp(path.join(os.tmpdir(), 'dawnlight-w1-'));
const output = options.output ? path.resolve(options.output) : path.join(ROOT, 'artifacts/w1/validation');
await fs.mkdir(output, { recursive: true });
const checks = [];
const authoring = name => path.join(vendor, 'authoring', name);
const pack = name => path.join(vendor, 'examples', name);

function checkEvidence(value, pointer = '') {
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    if (key === 'driverStatus') assert.equal(item, 'notProvided', `${pointer}/${key}`);
    if (['liveWorldVerified', 'runtimeEvaluated'].includes(key)) assert.equal(item, false, `${pointer}/${key}`);
    if (key === 'mappingStatus') assert.equal(item, 'deferred', `${pointer}/${key}`);
    if (item && typeof item === 'object') checkEvidence(item, `${pointer}/${key}`);
  }
}
async function check(id, args, validate, { expectedExit = 0, parse = true } = {}) {
  const result = run(exe, args, { cwd: external, allowFailure: true });
  const stdout = path.join(output, `${id}.stdout.${parse ? 'json' : 'txt'}`);
  const stderr = path.join(output, `${id}.stderr.txt`);
  await fs.writeFile(stdout, result.stdout);
  await fs.writeFile(stderr, result.stderr);
  assert.equal(result.status, expectedExit, `${id}: ${result.stderr.toString()}`);
  const value = parse ? JSON.parse(result.stdout) : result;
  if (parse) checkEvidence(value);
  await validate(value);
  checks.push({ id, status: expectedExit ? 'expected-upstream-failure-confirmed' : 'passed', exitCode: result.status,
    args: args.map(arg => arg.replaceAll(vendor, '<vendor>').replaceAll(external, '<external>')),
    stdout: { file: path.basename(stdout), ...await fingerprint(stdout) },
    stderr: { file: path.basename(stderr), ...await fingerprint(stderr) } });
}
await check('catalog', ['catalog', 'list', '--contract', '2', '--format', 'json'], async value => {
  assert.equal(value.hash, lock.contracts.catalogHash);
  assert.equal(hash(await fs.readFile(path.join(output, 'catalog.stdout.json'))),
    hash(await fs.readFile(authoring('catalog/catalog.v2.json'))));
});
for (const bundle of lock.contracts.schemaBundles) {
  const version = Math.max(...bundle.manifestVersions);
  await check(`schema-v${version}`, ['schema', 'verify', '--manifest-version', String(version), '--output', authoring(`docs/${version === 5 ? 'schemas-v5' : 'schemas'}`)], value => {
    assert.equal(value.success, true); assert.equal(value.catalogHash, bundle.catalogHash);
    for (const entry of bundle.artifacts) {
      const actual = value.artifacts.find(a => a.fileName === path.basename(entry.path));
      assert.ok(actual); assert.equal(actual.sha256, entry.sha256); assert.equal(actual.length, entry.length);
    }
  });
}
const diagnostics = authoring('docs/ShaderPackDiagnosticReference.md');
await check('guide-v5-original', ['docs', 'verify-v5', '--guide', authoring('docs/ShaderPackAuthorGuideP11V5.md'), '--diagnostics', diagnostics, '--temp', path.join(external, 'original-v5')], result => {
  assert.match(result.stderr.toString(), /DLTOOL2001/);
}, { expectedExit: 1, parse: false });
for (const [id, operation, guide, example] of [
  ['guide-v4', 'verify', 'docs/ShaderPackAuthorGuide.md', 'SceneAbiLab_v0.1'],
  ['guide-v5-site', 'verify-v5', 'site-variants/ShaderPackAuthorGuideP11V5.site-v1.md', 'CustomDataLab_Both']
]) {
  const extracted = path.join(external, id);
  await check(id, ['docs', operation, '--guide', authoring(guide), '--diagnostics', diagnostics, '--temp', extracted], async value => {
    assert.equal(value.success, true); assert.equal(value.diagnosticReference, 'matched');
    assert.equal(value.files.length, 7);
    assert.deepEqual(await files(extracted), await files(pack(example)));
    for (const entry of value.files) {
      assert.deepEqual(await fingerprint(path.join(extracted, entry.path)), await fingerprint(path.join(pack(example), entry.path)));
    }
  });
}
await check('diagnostic-table', ['docs', 'diagnostics'], async result => {
  assert.equal(hash(result.stdout), hash(await fs.readFile(authoring('diagnostics/generated-table.md'))));
}, { parse: false });
for (const example of ['Dawnlight_v3.1', 'SceneAbiLab_v0.1', 'CustomDataLab_Both', 'MakeUpUltraFast_SC_v0.21']) {
  await check(`pack-${example}`, ['pack', 'validate', pack(example), '--format', 'json'], value => assert.equal(value.valid, true));
}
for (const example of ['SceneAbiLab_v0.1', 'CustomDataLab_Both', 'MakeUpUltraFast_SC_v0.21']) {
  await check(`scene-${example}`, ['scene', 'explain', pack(example), '--include-inactive', '--format', 'json'], value => {
    assert.equal(value.success, true); assert.equal(value.catalogHash, lock.contracts.catalogHash);
    assert.equal(value.sceneAbiHash, lock.contracts.sceneAbiHash); assert.equal(value.driverStatus, 'notProvided');
  });
}
const lab = pack('CustomDataLab_Both');
await check('graph-v5', ['graph', 'dump', lab, '--contract', '2', '--include-inactive'], value => {
  assert.equal(value.success, true); assert.equal(value.selectedVersion, 2); assert.equal(value.driverStatus, 'notProvided');
});
for (const [id, args] of [
  ['materials-explain', ['materials', 'explain', lab, '--format', 'json']],
  ['materials-layout', ['materials', 'layout', lab, '--format', 'json']],
  ['data-interface', ['data', 'interface', lab, '--format', 'json']],
  ['program-interface', ['program', 'interface', lab, '--program', 'materiallab:scene/terrain_opaque', '--contract', '2']]
]) {
  await check(id, args, value => {
    assert.equal(value.success, true); assert.equal(value.dataAbiHash, lock.contracts.dataAbiHash);
    assert.equal(value.driverStatus, 'notProvided'); assert.equal(value.liveWorldVerified, false);
    if (id === 'program-interface') assert.equal(value.contractVersion, 2);
  });
}
// Both the frozen source and self-contained distribution remain unchanged by validation.
await verifySnapshot(vendor, lock); await verifyTool(toolRoot, lock);
const summary = {
  schemaVersion: 1, baselineId: lock.baselineId, sourceCommit: lock.upstream.commit,
  toolInventorySha256: lock.tool.distribution.inventory.sha256, importInventorySha256: lock.importInventory.sha256,
  status: 'passed-with-explicit-upstream-guide-failure', externalWorkingDirectory: true,
  cwdRelationship: 'Temporary OS directory outside project and source repository', snapshot,
  evidenceBoundary: { driverStatus: 'notProvided', mappingStatus: 'deferred', runtimeEvaluated: false, liveWorldVerified: false },
  checks
};
await writeJson(path.join(output, 'summary.json'), summary);
console.log(JSON.stringify({ status: summary.status, checks: checks.length, ordinarySuccesses: checks.filter(c => c.exitCode === 0).length, expectedUpstreamFailures: 1, summary: path.join(output, 'summary.json') }, null, 2));
