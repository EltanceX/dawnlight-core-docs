import fs from 'node:fs/promises';
import path from 'node:path';
import {
  ROOT, readJson, assertFingerprint, verifyInventory, inside, hash, jsonBytes
} from './locked-inputs.mjs';
import { siteGuideVariant } from './site-guide-variant.mjs';

export async function verifySnapshot(root, lock) {
  if (!lock.importInventory) throw new Error('No locked import inventory');
  await assertFingerprint(path.join(root, 'source-inventory.json'), lock.importInventory);
  const inventory = await readJson(path.join(root, 'source-inventory.json'));
  if (inventory.sourceCommit !== lock.upstream.commit || inventory.baselineId !== lock.baselineId) throw new Error('Snapshot baseline mismatch');
  await verifyInventory(root, inventory.files, ['source-inventory.json']);
  const policyPath = path.join(ROOT, lock.importPolicy.path);
  await assertFingerprint(policyPath, lock.importPolicy);
  const policy = await readJson(policyPath);
  if (policy.commit !== inventory.sourceCommit) throw new Error('Whitelist commit mismatch');
  for (const rule of policy.rules) {
    const matches = inventory.files.filter(f => f.origin === 'git-blob' &&
      (rule.kind === 'file' ? f.sourcePath === rule.source : f.sourcePath.startsWith(rule.source + '/')));
    if (!matches.length) throw new Error(`Empty whitelist rule: ${rule.source}`);
    for (const entry of matches) {
      const expected = rule.target + (rule.kind === 'tree' ? entry.sourcePath.slice(rule.source.length) : '');
      if (entry.path !== expected) throw new Error(`Whitelist mapping mismatch: ${entry.path}`);
    }
  }
  for (const entry of inventory.files.filter(f => f.origin === 'git-blob')) {
    if (!policy.rules.some(r => r.kind === 'file' ? r.source === entry.sourcePath && r.target === entry.path :
      entry.sourcePath.startsWith(r.source + '/') && entry.path === r.target + entry.sourcePath.slice(r.source.length))) {
      throw new Error(`File not covered by whitelist: ${entry.path}`);
    }
  }
  const variant = siteGuideVariant(await fs.readFile(inside(root, 'authoring/docs/ShaderPackAuthorGuideP11V5.md')));
  if (hash(await fs.readFile(inside(root, variant.record.outputPath))) !== hash(variant.output)) throw new Error('Variant content mismatch');
  if (hash(await fs.readFile(inside(root, 'authoring/site-variants/transformation.v1.json'))) !== hash(jsonBytes(variant.record))) throw new Error('Variant transformation record mismatch');
  const receipt = await readJson(inside(root, 'import-receipt.json'));
  if (receipt.commit !== lock.upstream.commit || receipt.policySha256 !== lock.importPolicy.sha256 ||
      receipt.toolInventorySha256 !== lock.tool.distribution.inventory.sha256) throw new Error('Import receipt provenance mismatch');
  return { files: inventory.files.length, gitBlobFiles: inventory.files.filter(f => f.origin === 'git-blob').length, sha256: lock.importInventory.sha256 };
}
