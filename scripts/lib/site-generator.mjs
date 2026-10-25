import assert from 'node:assert/strict';
import { hash, jsonBytes } from './locked-inputs.mjs';
import { exampleOutputs } from './example-generator.mjs';
import { referenceOutputs } from './reference-generator.mjs';
import { practiceOutputs } from './practice-foundation.mjs';

export async function siteOutputs(context, receipts, reference, pages) {
  const outputs = exampleOutputs(context, receipts, pages);
  const manifest = 'site/.vitepress/generated/output-manifest.json';
  outputs.delete(manifest);
  for (const [name, bytes] of [...await referenceOutputs(context, reference, pages), ...await practiceOutputs(context)]) {
    assert.ok(!outputs.has(name), `Duplicate generated output ${name}`);
    outputs.set(name, bytes);
  }
  outputs.set(manifest, jsonBytes({ schemaVersion: 1, files: [...outputs].map(([name, bytes]) => ({ path: name, length: bytes.length, sha256: hash(bytes) })).sort((a, b) => a.path.localeCompare(b.path, 'en')) }));
  return outputs;
}
