import fs from 'node:fs/promises';
import path from 'node:path';
import { run, writeJson, hash, jsonBytes } from './locked-inputs.mjs';

// Preserve raw stdout/stderr privately; only normalized hashes enter public receipts.
export function analyzerRunner(exe, { cwd, output }) {
  return async function invoke(id, args, { packRoot, exampleId } = {}) {
    const result = run(exe, args, { cwd, allowFailure: true });
    await fs.mkdir(output, { recursive: true });
    const filename = id.replace(/[^A-Za-z0-9_-]/g, '_');
    await fs.writeFile(path.join(output, filename + '.stdout.json'), result.stdout);
    await fs.writeFile(path.join(output, filename + '.stderr.txt'), result.stderr);
    let value;
    try { value = JSON.parse(result.stdout); } catch { /* Failure can be plain stderr. */ }
    const record = {
      exampleId, id, exitCode: result.status,
      failureKind: result.status === 2 ? 'command-misuse' : result.status === 1 ? 'contract-failure' : result.status === 0 ? null : 'process-failure',
      args: args.map(arg => packRoot ? arg.replaceAll(packRoot, '<pack>') : arg),
      diagnostics: value?.diagnostics ?? [], stderr: result.stderr.toString('utf8')
    };
    await writeJson(path.join(output, filename + '.result.json'), record);
    if (result.status !== 0 || !value || (value.valid !== true && value.success !== true)) {
      const error = new Error(`${exampleId}: ${id}: ${record.failureKind ?? 'invalid-result'}; ${JSON.stringify(record.diagnostics)} ${record.stderr}`);
      error.report = record;
      throw error;
    }
    const normalized = JSON.stringify(value).replaceAll(packRoot, '<pack>').replaceAll(packRoot.replaceAll('\\', '/'), '<pack>');
    return { value, exitCode: result.status, outputSha256: hash(jsonBytes(JSON.parse(normalized))) };
  };
}
