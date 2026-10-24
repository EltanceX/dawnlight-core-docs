import assert from 'node:assert/strict';
import path from 'node:path';
import { loadExamples, loadReceipts, applyOutputs } from './lib/content-foundation.mjs';
import { readJson } from './lib/locked-inputs.mjs';
import { exampleOutputs } from './lib/example-generator.mjs';

assert.ok(process.argv.slice(2).every(arg => arg === '--check'), 'Usage: generate-content.mjs [--check]');
const context = await loadExamples();
const report = await loadReceipts(context);
const pages = await readJson(path.join(context.root, 'metadata/pages.json'));
const outputs = exampleOutputs(context, report, pages);
await applyOutputs(outputs, { check: process.argv.includes('--check') });
console.log(JSON.stringify({ status: 'passed', mode: process.argv.includes('--check') ? 'check' : 'generate', examples: context.examples.length, generatedFiles: outputs.size, uniqueSourceOverwritten: false }, null, 2));
