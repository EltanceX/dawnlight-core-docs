import fs from 'node:fs/promises';
import path from 'node:path';
import { argsOf, loadLock, defaultToolRoot, verifyTool, acquireArchive, cacheRoot, extractLocked, replaceDirectory, assertFingerprint } from './lib/locked-inputs.mjs';

const options = argsOf(['--archive', '--offline']), lock = await loadLock();
const target = defaultToolRoot(lock);
try { await verifyTool(target, lock); console.log(`Verified cached tool: ${lock.tool.distribution.id}`); }
catch (error) {
  if (error.code !== 'ENOENT') throw error; // Never repair a tampered cache silently.
  const archive = options.archive ? path.resolve(options.archive) : await acquireArchive(lock.tool.distribution.archive, { offline: options.offline });
  await assertFingerprint(archive, lock.tool.distribution.archive);
  const stage = await fs.mkdtemp(path.join(await cacheRoot(), 'tool-'));
  await extractLocked(archive, stage);
  await verifyTool(stage, lock);
  await replaceDirectory(stage, target);
  console.log(`Acquired and verified: ${lock.tool.distribution.id}`);
}
