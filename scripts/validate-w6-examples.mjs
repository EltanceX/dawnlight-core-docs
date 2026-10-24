import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { ROOT, inside, verifyTool, defaultToolRoot, writeJson, extractLocked, verifyInventory, hash, jsonBytes } from './lib/locked-inputs.mjs';
import { loadExamples, evidenceBoundary } from './lib/content-foundation.mjs';
import { analyzerRunner } from './lib/analyzer-runner.mjs';
import { analyzerRpc } from './lib/analyzer-rpc.mjs';

const verifyOnly = process.argv.includes('--verify-receipt');
assert.ok(process.argv.slice(2).every(arg => arg === '--verify-receipt'));
const context = await loadExamples(), { lock } = context;
const toolRoot = defaultToolRoot(lock), tool = await verifyTool(toolRoot, lock), exe = path.join(toolRoot, tool.entrypoint);
const output = path.join(ROOT, 'artifacts/w6/validation');
const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'dawnlight-w6-'));
try {
  const examples = [];
  for (const example of context.examples.filter(e => e.validationStage === 'w6')) {
    const id = example.id.split('/')[1], archive = path.join(temporary, id + '.zip'), unpacked = path.join(temporary, id);
    await fs.writeFile(archive, example.archiveBytes); await extractLocked(archive, unpacked); await verifyInventory(unpacked, example.inventory);
    const checks = [], branches = [], manifests = new Set();
    for (const variant of example.variants) {
      const optionFile = path.join(temporary, 'options.json');
      const numberOptions = example.manifest.options.filter(o => o.type === 'number').map(o => o.id);
      await fs.writeFile(optionFile, JSON.stringify(variant.options, (key, value) => numberOptions.includes(key) && typeof value === 'number' && Number.isInteger(value) ? JSON.rawJSON(value + '.0') : value, 2) + '\n');
      const options = ['--options', optionFile];
      const commands = [
        ['pack', root => ['pack', 'validate', root, '--format', 'json']],
        ['scene', root => ['scene', 'explain', root, ...options, '--include-inactive', '--format', 'json']],
        ['graph', null],
        ...example.programs.map(p => [`interface:${p}`, root => ['program', 'interface', root, '--program', p, '--contract', '2', ...options]]),
        ['data', root => ['data', 'explain', root, ...options, '--format', 'json']],
        ...(example.manifest.materials ? [['materials', root => ['materials', 'explain', root, ...options, '--format', 'json']]] : [])
      ];
      for (const [checkId, args] of commands) {
        const pair = [];
        for (const [kind, packRoot] of [['source', inside(ROOT, example.root)], ['archive', unpacked]]) {
          const dir = path.join(output, id, variant.id, kind);
          let result;
          if (checkId === 'graph') {
            const value = await analyzerRpc(exe, 'dawnlight/dumpGraph', { packRoot, catalogHash: lock.contracts.catalogHash, requestVersion: 2, clientSupportedVersions: [2], overlays: [], includeInactive: true, inputs: { options: variant.options, capabilities: {} } }, { cwd: temporary, numberOptions });
            await writeJson(path.join(dir, 'graph.stdout.json'), value);
            assert.equal(value.success, true, `${id}/${variant.id}: graph ${JSON.stringify(value.diagnostics)}`);
            result = { value, exitCode: 0, outputSha256: hash(jsonBytes(JSON.parse(JSON.stringify(value).replaceAll(packRoot, '<pack>').replaceAll(packRoot.replaceAll('\\', '/'), '<pack>')))) };
          } else result = await analyzerRunner(exe, { cwd: temporary, output: dir })(checkId, args(packRoot), { packRoot, exampleId: example.id + '/' + variant.id });
          const v = result.value; assert.equal(v.diagnostics.length, 0, `${id}/${variant.id}/${checkId}: diagnostics`); manifests.add(v.manifestHash);
          if (checkId === 'scene') {
            assert.equal(v.routes.length, 4);
            for (const route of v.routes) {
              assert.equal(route.resolved.active, true);
              assert.equal(route.resolved.mode, route.category.id.endsWith('/terrain_opaque') ? 'override' : 'builtIn');
            }
          }
          if (checkId === 'graph') {
            const active = kind => v.graph.nodes.filter(n => n.kind === kind && n.active).map(n => n.id).sort();
            const grade = variant.options['course:grade'] ?? true, glow = grade && (variant.options['course:glow'] ?? true) && example.programs.includes('course:post/glow');
            const resources = ['course:scene/color', 'course:scene/depth', ...(grade ? ['course:post/color'] : []), ...(glow ? ['course:post/glow'] : []), ...(example.manifest.materials ? ['course:materials'] : [])].map(r => 'resource:' + r).sort();
            assert.deepEqual(active('resource'), resources, `${id}/${variant.id}: active resource closure`);
            const expectedCommands = ['terrain_opaque','terrain_alpha_tested','terrain_transparent','terrain_sorted_translucent', ...(grade ? ['grade'] : []), ...(glow ? ['glow'] : []), grade ? glow ? 'present-glow' : 'present-grade' : 'present-raw'].map(p => `command:course:${p}:0`).sort();
            assert.deepEqual(active('command'), expectedCommands, `${id}/${variant.id}: active command closure`);
            assert.equal(active('program').includes('program:course:post/grade'), grade);
            assert.equal(active('program').includes('program:course:post/glow'), glow);
            assert.deepEqual(active('service'), []);
            if (kind === 'source') branches.push({ id: variant.id, options: variant.options, activeResources: resources, activeCommands: expectedCommands, activePrograms: active('program'), activeServices: active('service') });
          }
          pair.push(result);
        }
        assert.equal(pair[0].outputSha256, pair[1].outputSha256, `${id}/${variant.id}/${checkId}: source/ZIP differ`);
        checks.push({ id: checkId, variant: variant.id, exitCode: pair[0].exitCode, archiveExitCode: pair[1].exitCode, outputSha256: pair[0].outputSha256, archiveOutputSha256: pair[1].outputSha256, manifestHash: pair[0].value.manifestHash });
      }
    }
    assert.equal(manifests.size, 1);
    examples.push({ id: example.id, status: 'passed', sourceFingerprint: example.sourceFingerprint, definitionSha256: example.definitionSha256, archiveSha256: example.archiveSha256, archiveLength: example.archiveLength, files: example.inventory, manifestHash: [...manifests][0], checks, branches, runtimeEvidence: evidenceBoundary });
    console.log(`${example.id}: ${example.variants.length} branches, source and fresh ZIP passed`);
  }
  await verifyTool(toolRoot, lock);
  const report = { schemaVersion: 1, baselineId: lock.baselineId, sourceCommit: lock.upstream.commit, toolInventorySha256: lock.tool.distribution.inventory.sha256, examples };
  const file = path.join(ROOT, 'metadata/w6-examples-validation.json');
  if (verifyOnly) assert.deepEqual(JSON.parse(await fs.readFile(file)), report, 'W6 receipt changed'); else await writeJson(file, report);
  await writeJson(path.join(output, 'summary.json'), { ...report, checkedAt: new Date().toISOString() });
} finally {
  assert.equal(path.dirname(temporary), path.resolve(os.tmpdir())); assert.ok(path.basename(temporary).startsWith('dawnlight-w6-'));
  await fs.rm(temporary, { recursive: true, force: true });
}
