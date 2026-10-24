import path from 'node:path';
import { ROOT, VENDOR, argsOf, loadLock, zipDirectory, writeJson } from './lib/locked-inputs.mjs';
import { verifySnapshot } from './lib/verify-snapshot.mjs';

const options = argsOf(['--update-lock']);
if (!options['update-lock']) throw new Error('Maintenance only: --update-lock required');
const lock = await loadLock();
await verifySnapshot(path.join(ROOT, VENDOR), lock);
const distribution = lock.tool.distribution;
const name = `dawnlight-authoring-${distribution.id}.zip`;
const archive = {
  name, ...await zipDirectory(path.join(ROOT, VENDOR), path.join(ROOT, 'artifacts/w1/packages', name)),
  repository: distribution.repository, tag: distribution.tag,
  access: distribution.access, content: 'Complete vendor/dawnlight tree including exact-byte source inventory'
};
if (distribution.status === 'published-and-download-verified' && archive.sha256 !== lock.snapshotArchive?.sha256) {
  throw new Error('Published snapshot is immutable. Create a new distribution id before packaging changed inputs.');
}
lock.snapshotArchive = archive.name === lock.snapshotArchive?.name && archive.sha256 === lock.snapshotArchive?.sha256
  ? { ...lock.snapshotArchive, ...archive } : archive;
await writeJson(path.join(ROOT, 'upstream.lock.json'), lock);
console.log(JSON.stringify(lock.snapshotArchive, null, 2));
