import fs from 'node:fs/promises';
import path from 'node:path';
import {
  ROOT, VENDOR, argsOf, loadLock, verifySource, readJson, run, inside, relativeName,
  hash, writeJson, fingerprint, verifyTool, defaultToolRoot, cacheRoot, replaceDirectory
} from './lib/locked-inputs.mjs';
import { siteGuideVariant } from './lib/site-guide-variant.mjs';
import { verifySnapshot } from './lib/verify-snapshot.mjs';

const options = argsOf(['--source-root', '--tool-root', '--update-lock']);
if (!options['source-root']) throw new Error('--source-root <clean git repository> required; use restore-upstream.mjs for locked remote assets');
const lock = await loadLock(), source = path.resolve(options['source-root']);
verifySource(source, lock.upstream.commit);
const policyPath = 'metadata/upstream-import.json', policy = await readJson(path.join(ROOT, policyPath));
if (policy.commit !== lock.upstream.commit || policy.baselineId !== lock.baselineId) throw new Error('Whitelist baseline mismatch');
const toolRoot = options['tool-root'] ? path.resolve(options['tool-root']) : defaultToolRoot(lock);
await verifyTool(toolRoot, lock);
const tree = run('git', ['-C', source, 'ls-tree', '-rz', lock.upstream.commit]).stdout.toString('utf8').split('\0').filter(Boolean)
  .map(line => { const i = line.indexOf('\t'); const [mode, type, oid] = line.slice(0, i).split(' '); return { mode, type, oid, path: line.slice(i + 1) }; });
const selected = [];
for (const rule of policy.rules) {
  relativeName(rule.source); relativeName(rule.target);
  if (!['file', 'tree'].includes(rule.kind)) throw new Error(`Unknown rule kind ${rule.kind}`);
  const matches = tree.filter(f => rule.kind === 'file' ? f.path === rule.source : f.path.startsWith(rule.source + '/'));
  if (!matches.length || (rule.kind === 'file' && matches.length !== 1)) throw new Error(`Whitelist rule not found: ${rule.source}`);
  for (const entry of matches) {
    if (!/^100(644|755)$/.test(entry.mode) || entry.type !== 'blob') throw new Error(`Non-file source entry ${entry.path}`);
    selected.push({ ...entry, target: rule.target + (rule.kind === 'tree' ? entry.path.slice(rule.source.length) : '') });
  }
}
selected.sort((a, b) => a.target < b.target ? -1 : a.target > b.target ? 1 : 0);
if (new Set(selected.map(f => f.target.toLowerCase())).size !== selected.length) throw new Error('Duplicate/case-colliding target');
const objects = run('git', ['-C', source, 'cat-file', '--batch'], { input: Buffer.from(selected.map(f => f.oid).join('\n') + '\n') }).stdout;
const stage = await fs.mkdtemp(path.join(await cacheRoot(), 'import-'));
const entries = [];
let cursor = 0;
for (const entry of selected) {
  const end = objects.indexOf(10, cursor), [oid, type, size] = objects.subarray(cursor, end).toString().split(' ');
  if (oid !== entry.oid || type !== 'blob' || !/^\d+$/.test(size)) throw new Error(`Git batch mismatch: ${entry.path}`);
  const bytes = objects.subarray(end + 1, end + 1 + Number(size));
  cursor = end + 2 + Number(size);
  await fs.mkdir(path.dirname(inside(stage, entry.target)), { recursive: true });
  await fs.writeFile(inside(stage, entry.target), bytes);
  entries.push({ path: entry.target, length: bytes.length, sha256: hash(bytes), origin: 'git-blob', sourcePath: entry.path, gitBlob: entry.oid });
}
async function add(name, bytes, origin, extra = {}) {
  await fs.mkdir(path.dirname(inside(stage, name)), { recursive: true });
  await fs.writeFile(inside(stage, name), bytes);
  entries.push({ path: name, length: bytes.length, sha256: hash(bytes), origin, ...extra });
}
const variant = siteGuideVariant(await fs.readFile(inside(stage, 'authoring/docs/ShaderPackAuthorGuideP11V5.md')));
await add(variant.record.outputPath, variant.output, 'website-variant', { variantId: variant.record.id });
await writeJson(inside(stage, 'authoring/site-variants/transformation.v1.json'), variant.record);
entries.push({ path: 'authoring/site-variants/transformation.v1.json', ...await fingerprint(inside(stage, 'authoring/site-variants/transformation.v1.json')), origin: 'website-variant-receipt' });
for (const [name, args] of [
  ['authoring/catalog/catalog.v2.json', ['catalog', 'list', '--contract', '2', '--format', 'json']],
  ['authoring/diagnostics/generated-table.md', ['docs', 'diagnostics']]
]) {
  const result = run(inside(toolRoot, lock.tool.distribution.entrypoint), args, { cwd: stage });
  if (name.endsWith('.json') && JSON.parse(result.stdout).hash !== lock.contracts.catalogHash) throw new Error('Catalog identity mismatch');
  await add(name, result.stdout, 'analyzer-output', { args, toolInventorySha256: lock.tool.distribution.inventory.sha256 });
}
const receipt = {
  schemaVersion: 1, baselineId: lock.baselineId, commit: lock.upstream.commit,
  sourceCommittedAt: run('git', ['-C', source, 'show', '-s', '--format=%cI', lock.upstream.commit]).stdout.toString().trim(),
  bytePolicy: 'git-blob-exact', policySha256: (await fingerprint(path.join(ROOT, policyPath))).sha256,
  toolInventorySha256: lock.tool.distribution.inventory.sha256,
  gitBlobFiles: selected.length, completeExampleTrees: policy.rules.filter(r => r.target.startsWith('examples/')),
  variantId: variant.record.id, timestamps: 'Receipt uses source commit timestamp; execution time is an untracked audit artifact.'
};
await writeJson(inside(stage, 'import-receipt.json'), receipt);
entries.push({ path: 'import-receipt.json', ...await fingerprint(inside(stage, 'import-receipt.json')), origin: 'import-receipt' });
await writeJson(inside(stage, 'source-inventory.json'), {
  schemaVersion: 1, baselineId: lock.baselineId, sourceCommit: lock.upstream.commit,
  bytePolicy: 'git-blob-exact', files: entries.sort((a,b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0)
});
const candidate = structuredClone(lock);
candidate.importPolicy = { path: policyPath, ...await fingerprint(path.join(ROOT, policyPath)) };
candidate.importInventory = { path: `${VENDOR}/source-inventory.json`, ...await fingerprint(inside(stage, 'source-inventory.json')) };
if (!options['update-lock'] && (candidate.importInventory.sha256 !== lock.importInventory?.sha256 || candidate.importPolicy.sha256 !== lock.importPolicy?.sha256)) {
  throw new Error('Import differs from lock; review a baseline update and use --update-lock explicitly. Staged output retained.');
}
await verifySnapshot(stage, options['update-lock'] ? candidate : lock);
await replaceDirectory(stage, path.join(ROOT, VENDOR));
if (options['update-lock']) await writeJson(path.join(ROOT, 'upstream.lock.json'), candidate);
console.log(JSON.stringify({ status: 'imported', files: entries.length, gitBlobFiles: selected.length, sha256: candidate.importInventory.sha256 }, null, 2));
