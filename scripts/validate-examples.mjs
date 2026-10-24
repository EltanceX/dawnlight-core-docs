import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { ROOT, inside, loadLock, verifyTool, defaultToolRoot, writeJson, extractLocked, verifyInventory, hash, jsonBytes } from './lib/locked-inputs.mjs';
import { loadExamples, loadReceipts, evidenceBoundary } from './lib/content-foundation.mjs';
import { analyzerRunner } from './lib/analyzer-runner.mjs';

const verifyOnly = process.argv.includes('--verify-receipt');
assert.ok(process.argv.slice(2).every(arg => arg === '--verify-receipt'), 'Usage: validate-examples.mjs [--verify-receipt]');
const output = path.join(ROOT, 'artifacts/w3/validation');
let temporary;
try {
  const context = await loadExamples();
  const { lock } = context;
  if (verifyOnly) await loadReceipts(context);
  const toolRoot = defaultToolRoot(lock);
  const tool = await verifyTool(toolRoot, lock);
  temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'dawnlight-w3-'));
  const results = [];
  for (const example of context.examples) {
    const prefix = example.id.replaceAll('/', '-');
    const archive = path.join(temporary, prefix + '.zip');
    const unpacked = path.join(temporary, prefix);
    await fs.writeFile(archive, example.archiveBytes);
    await extractLocked(archive, unpacked);
    await verifyInventory(unpacked, example.inventory);
    const commands = [
      ['pack', root => ['pack', 'validate', root, '--format', 'json']],
      ['scene', root => ['scene', 'explain', root, '--include-inactive', '--format', 'json']],
      ['graph', root => ['graph', 'dump', root, '--contract', '2', '--include-inactive']],
      ...example.programs.map(id => [`interface:${id}`, root => ['program', 'interface', root, '--program', id, '--contract', '2']])
    ];
    const checks = [], manifests = new Set();
    for (const [id, args] of commands) {
      const pair = [];
      for (const [kind, root] of [['source', inside(ROOT, example.root)], ['archive', unpacked]]) {
        const invoke = analyzerRunner(path.join(toolRoot, tool.entrypoint), { cwd: temporary, output: path.join(output, prefix, kind) });
        const result = await invoke(id, args(root), { packRoot: root, exampleId: example.id });
        const value = result.value;
        assert.equal(value.diagnostics.length, 0, `${example.id}: ${id}: diagnostics`);
        manifests.add(value.manifestHash);
        if (id !== 'pack') assert.equal(value.driverStatus, 'notProvided', `${example.id}: ${id}: driver evidence`);
        if (id === 'scene') {
          assert.equal(value.catalogHash, lock.contracts.catalogHash);
          assert.equal(value.sceneAbiHash, lock.contracts.sceneAbiHash);
          assert.equal(value.routes.length, example.expected.terrainRoutes);
          for (const route of value.routes) {
            assert.equal(route.resolved.mode, example.expected.routeMode);
            assert.equal(route.resolved.active, true);
            assert.equal(route.resolved.program.sourceOwner, 'builtIn');
            assert.equal(route.resolved.fallback.materialized, true);
          }
        }
        if (id === 'graph') {
          assert.equal(value.catalogHash, lock.contracts.catalogHash);
          assert.equal(value.graph.nodes.filter(node => node.kind === 'resource' && node.active).length, example.expected.resources);
          assert.equal(value.graph.nodes.filter(node => node.kind === 'command' && node.active).length, example.expected.passes);
        }
        if (id.startsWith('interface:')) {
          assert.equal(value.liveWorldVerified, false);
          assert.equal(value.programs.find(program => program.program === id.slice('interface:'.length))?.sourceContractChecked, true);
        }
        pair.push(result);
      }
      assert.equal(pair[0].outputSha256, pair[1].outputSha256, `${example.id}: ${id}: source/archive output mismatch`);
      checks.push({ id, variant: 'default', exitCode: pair[0].exitCode, archiveExitCode: pair[1].exitCode, outputSha256: pair[0].outputSha256, archiveOutputSha256: pair[1].outputSha256, manifestHash: pair[0].value.manifestHash });
    }
    assert.equal(manifests.size, 1, `${example.id}: manifest identities differ`);
    results.push({ id: example.id, status: 'passed', sourceFingerprint: example.sourceFingerprint, definitionSha256: example.definitionSha256, archiveSha256: example.archiveSha256, archiveLength: example.archiveLength, files: example.inventory, manifestHash: [...manifests][0], checks, runtimeEvidence: evidenceBoundary });
  }
  await verifyTool(toolRoot, lock);
  const report = { schemaVersion: 1, baselineId: lock.baselineId, sourceCommit: lock.upstream.commit, toolInventorySha256: lock.tool.distribution.inventory.sha256, examples: results };
  if (verifyOnly) {
    const previous = await loadReceipts(context);
    assert.equal(hash(jsonBytes(previous)), hash(jsonBytes(report)), 'Analyzer receipt differs from committed evidence');
  } else {
    await writeJson(path.join(ROOT, 'metadata/examples-validation.json'), report);
  }
  await writeJson(path.join(output, 'summary.json'), { status: 'passed', ...report, checkedAt: new Date().toISOString(), externalWorkingDirectory: true, freshlyExtractedArchiveValidated: true });
  console.log(JSON.stringify({ status: 'passed', examples: results.length, analyzerInvocations: results.reduce((sum, item) => sum + item.checks.length * 2, 0), sourceAndArchiveIdentical: true, runtimeEvidence: evidenceBoundary }, null, 2));
} catch (error) {
  await writeJson(path.join(output, 'failure.json'), { status: 'failed', message: error.message, ...(error.report ?? {}) });
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (temporary) {
    const resolved = path.resolve(temporary), parent = path.resolve(os.tmpdir());
    assert.ok(path.dirname(resolved) === parent && path.basename(resolved).startsWith('dawnlight-w3-'));
    await fs.rm(resolved, { recursive: true, force: true });
  }
}
