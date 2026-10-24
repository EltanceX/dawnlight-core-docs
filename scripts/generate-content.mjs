import assert from 'node:assert/strict';
import path from 'node:path';
import { loadExamples, loadReceipts, applyOutputs } from './lib/content-foundation.mjs';
import { readJson } from './lib/locked-inputs.mjs';
import { loadReference } from './lib/reference-foundation.mjs';
import { siteOutputs } from './lib/site-generator.mjs';

assert.ok(process.argv.slice(2).every(arg => arg === '--check'), 'Usage: generate-content.mjs [--check]');
const context = await loadExamples();
const report = await loadReceipts(context);
const pages = await readJson(path.join(context.root, 'metadata/pages.json'));
const reference = await loadReference(context);
const outputs = await siteOutputs(context, report, reference, pages);
await applyOutputs(outputs, { check: process.argv.includes('--check') });
console.log(JSON.stringify({ status: 'passed', mode: process.argv.includes('--check') ? 'check' : 'generate', examples: context.examples.length, referencePages: reference.pages.length * 2, propertyOccurrences: reference.coverage.filter(row => row.kind === 'property').length, dictionaryOccurrences: reference.coverage.filter(row => row.kind === 'dictionary').length, generatedFiles: outputs.size, uniqueSourceOverwritten: false }, null, 2));
