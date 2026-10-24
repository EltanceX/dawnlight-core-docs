import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  ROOT, argsOf, cacheRoot, loadLock, run, readJson, fingerprint, writeJson
} from './lib/locked-inputs.mjs';

const options = argsOf(['--tool-archive', '--snapshot-archive']);
if (Boolean(options['tool-archive']) !== Boolean(options['snapshot-archive'])) {
  throw new Error('Provide both local archives or neither (remote download rehearsal).');
}
const lock = await loadLock();
const fresh = await fs.mkdtemp(path.join(await cacheRoot(), 'rehearsal-'));
for (const folder of ['scripts', 'metadata']) await fs.cp(path.join(ROOT, folder), path.join(fresh, folder), { recursive: true });
for (const name of ['upstream.lock.json', '.gitattributes']) await fs.copyFile(path.join(ROOT, name), path.join(fresh, name));
// No vendor, tool, downloads, host checkout or node_modules are copied.
const steps = [];
async function step(script, args = []) {
  const result = run(process.execPath, [path.join(fresh, 'scripts', script), ...args], { cwd: fresh });
  let value;
  try { value = JSON.parse(result.stdout); } catch { value = result.stdout.toString().trim(); }
  steps.push({ script, exitCode: result.status, result: value });
}
await step('acquire-tool.mjs', options['tool-archive'] ? ['--archive', path.resolve(options['tool-archive'])] : []);
await step('restore-upstream.mjs', options['snapshot-archive'] ? ['--archive', path.resolve(options['snapshot-archive'])] : []);
await step('verify-upstream.mjs');
await step('validate-upstream.mjs');
const summaryPath = path.join(fresh, 'artifacts/w1/validation/summary.json');
const summary = await readJson(summaryPath);
assert.equal(summary.ordinarySuccesses ?? summary.checks.filter(c => c.exitCode === 0).length, 18);
assert.equal(summary.externalWorkingDirectory, true);
const receipt = {
  schemaVersion: 1, sourceCommit: lock.upstream.commit,
  mode: options['tool-archive'] ? 'local-archive-recovery' : 'authenticated-github-release-download',
  freshDirectory: path.relative(ROOT, fresh).replaceAll('\\', '/'),
  initialContents: ['scripts', 'metadata', 'upstream.lock.json', '.gitattributes'],
  sourceCheckoutCopied: false, vendorCopied: false, toolCacheCopied: false, nodeModulesCopied: false,
  toolArchiveSha256: lock.tool.distribution.archive.sha256,
  snapshotArchiveSha256: lock.snapshotArchive.sha256,
  validation: { ...await fingerprint(summaryPath), checks: summary.checks.length, expectedUpstreamFailures: 1 },
  steps
};
await writeJson(path.join(ROOT, 'artifacts/w1/rehearsal.json'), receipt);
console.log(JSON.stringify({ status: 'passed', mode: receipt.mode, checks: summary.checks.length, receipt: 'artifacts/w1/rehearsal.json' }, null, 2));
