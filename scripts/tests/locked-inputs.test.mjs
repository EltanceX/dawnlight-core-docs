import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  ROOT, VENDOR, loadLock, cacheRoot, defaultToolRoot, verifyTool,
  inventory, verifyInventory, zipDirectory, extractLocked, run, replaceDirectory
} from '../lib/locked-inputs.mjs';
import { verifySnapshot } from '../lib/verify-snapshot.mjs';

const lock = await loadLock();
async function fixture(t, prefix) {
  const folder = await fs.mkdtemp(path.join(await cacheRoot(), prefix));
  t.after(async () => {
    // Resolve and check the absolute target before recursively deleting a test fixture.
    const cache = path.resolve(ROOT, '.cache');
    assert.ok(path.resolve(folder).startsWith(cache + path.sep));
    await fs.rm(folder, { recursive: true, force: true });
  });
  return folder;
}
test('snapshot rejects modified, missing, extra files and changed provenance', async t => {
  const folder = await fixture(t, 'snapshot-test-');
  await fs.cp(path.join(ROOT, VENDOR), folder, { recursive: true });
  await verifySnapshot(folder, lock);
  const file = path.join(folder, 'examples/CustomDataLab_Both/shaderpack.json');
  const original = await fs.readFile(file);
  await fs.appendFile(file, '\n');
  await assert.rejects(verifySnapshot(folder, lock), /Fingerprint mismatch/);
  await fs.writeFile(file, original);
  await fs.rename(file, file + '.missing');
  await assert.rejects(verifySnapshot(folder, lock), /Inventory path mismatch/);
  await fs.rename(file + '.missing', file);
  await fs.writeFile(path.join(folder, 'unexpected.txt'), 'extra');
  await assert.rejects(verifySnapshot(folder, lock), /extra=unexpected.txt/);
  await fs.unlink(path.join(folder, 'unexpected.txt'));
  const receipt = path.join(folder, 'import-receipt.json');
  await fs.appendFile(receipt, ' ');
  await assert.rejects(verifySnapshot(folder, lock), /Fingerprint mismatch/);
});
test('tool rejects a changed executable before invocation', async t => {
  const folder = await fixture(t, 'tool-test-');
  await fs.cp(defaultToolRoot(lock), folder, { recursive: true });
  await verifyTool(folder, lock);
  await fs.appendFile(path.join(folder, lock.tool.distribution.entrypoint), 'tamper');
  await assert.rejects(verifyTool(folder, lock), /Fingerprint mismatch/);
});
test('deterministic archive round trip preserves binary and mixed newline bytes', async t => {
  const folder = await fixture(t, 'zip-test-'), source = path.join(folder, 'source');
  await fs.mkdir(source);
  await fs.writeFile(path.join(source, '混合.txt'), Buffer.from('LF\nCRLF\r\nCR\r'));
  await fs.writeFile(path.join(source, 'binary.bin'), Buffer.from([0, 255, 13, 10, 128]));
  const a = await zipDirectory(source, path.join(folder, 'a.zip'));
  const b = await zipDirectory(source, path.join(folder, 'b.zip'));
  assert.deepEqual(a, b);
  const restored = path.join(folder, 'restored');
  await extractLocked(path.join(folder, 'a.zip'), restored);
  await verifyInventory(restored, await inventory(source));
});
test('checkout with core.autocrlf=true preserves all frozen vendor bytes', async t => {
  const folder = await fixture(t, 'checkout-test-');
  const repo = path.join(folder, 'repo'), clone = path.join(folder, 'clone');
  await fs.mkdir(repo);
  await fs.copyFile(path.join(ROOT, '.gitattributes'), path.join(repo, '.gitattributes'));
  await fs.mkdir(path.join(repo, 'vendor'));
  await fs.cp(path.join(ROOT, VENDOR), path.join(repo, VENDOR), { recursive: true });
  run('git', ['init', '--quiet', repo]);
  run('git', ['-C', repo, 'config', 'core.autocrlf', 'true']);
  run('git', ['-C', repo, 'add', '.']);
  run('git', ['-C', repo, '-c', 'user.name=Input test', '-c', 'user.email=input-test@example.invalid', 'commit', '--quiet', '-m', 'Test byte preservation']);
  run('git', ['-c', 'core.autocrlf=true', 'clone', '--quiet', '--no-local', repo, clone]);
  await verifySnapshot(path.join(clone, VENDOR), lock);
});
test('directory replacement rejects targets outside the designated workspace roots', async () => {
  await assert.rejects(replaceDirectory(path.join(ROOT, '.cache/stage'), path.join(ROOT, 'docs/keep')), /must stay within/);
  await assert.rejects(replaceDirectory(path.join(ROOT, 'docs/stage'), path.join(ROOT, VENDOR)), /must stay within/);
});
test('import rejects a source commit other than the locked commit', async t => {
  const folder = await fixture(t, 'wrong-source-test-');
  run('git', ['init', '--quiet', folder]);
  run('git', ['-C', folder, '-c', 'user.name=Input test', '-c', 'user.email=input-test@example.invalid', 'commit', '--quiet', '--allow-empty', '-m', 'Wrong baseline']);
  const result = run(process.execPath, [path.join(ROOT, 'scripts/import-upstream.mjs'), '--source-root', folder], { allowFailure: true });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr.toString(), /!= locked/);
});
