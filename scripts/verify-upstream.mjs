import path from 'node:path';
import { ROOT, VENDOR, argsOf, loadLock, assertFingerprint } from './lib/locked-inputs.mjs';
import { verifySnapshot } from './lib/verify-snapshot.mjs';

const options = argsOf(['--vendor-root']), lock = await loadLock();
for (const item of Object.values(lock.discoveryRecords)) await assertFingerprint(path.join(ROOT, item.path), item);
await assertFingerprint(path.join(ROOT, lock.tool.distribution.inventory.path), lock.tool.distribution.inventory);
if (lock.w1Verification) await assertFingerprint(path.join(ROOT, lock.w1Verification.path), lock.w1Verification);
const result = await verifySnapshot(options['vendor-root'] ? path.resolve(options['vendor-root']) : path.join(ROOT, VENDOR), lock);
console.log(JSON.stringify({ status: 'verified', baselineId: lock.baselineId, ...result }, null, 2));
