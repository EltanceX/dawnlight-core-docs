import fs from 'node:fs/promises';
import path from 'node:path';
import {
  ROOT, VENDOR, argsOf, loadLock, acquireArchive, assertFingerprint,
  cacheRoot, extractLocked, replaceDirectory
} from './lib/locked-inputs.mjs';
import { verifySnapshot } from './lib/verify-snapshot.mjs';

const options = argsOf(['--archive', '--offline']), lock = await loadLock();
const archive = options.archive ? path.resolve(options.archive) :
  await acquireArchive(lock.snapshotArchive, { offline: options.offline });
await assertFingerprint(archive, lock.snapshotArchive);
const stage = await fs.mkdtemp(path.join(await cacheRoot(), 'restore-'));
await extractLocked(archive, stage);
const result = await verifySnapshot(stage, lock);
await replaceDirectory(stage, path.join(ROOT, VENDOR));
console.log(JSON.stringify({ status: 'restored', baselineId: lock.baselineId, ...result }, null, 2));
