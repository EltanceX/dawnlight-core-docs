import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { deflateRawSync } from 'node:zlib';
import { setTimeout as delay } from 'node:timers/promises';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const VENDOR = 'vendor/dawnlight';
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export const jsonBytes = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
export const readJson = async name => JSON.parse(await fs.readFile(name, 'utf8'));
export async function writeJson(name, value) {
  await fs.mkdir(path.dirname(name), { recursive: true });
  await fs.writeFile(name, jsonBytes(value));
}
export async function fingerprint(name) {
  const bytes = await fs.readFile(name);
  return { length: bytes.length, sha256: hash(bytes) };
}
export function relativeName(name) {
  if (typeof name !== 'string' || !name || name.includes('\\') || name.includes(':') ||
      name.includes('\0') || name.startsWith('/') || name.split('/').some(p => !p || p === '.' || p === '..')) {
    throw new Error(`Unsafe relative path: ${name}`);
  }
  return name;
}
export function inside(root, name) { return path.join(root, relativeName(name)); }
export async function files(root, prefix = '') {
  const result = [];
  for (const item of await fs.readdir(path.join(root, prefix), { withFileTypes: true })) {
    const name = prefix ? `${prefix}/${item.name}` : item.name;
    relativeName(name);
    if (item.isSymbolicLink()) throw new Error(`Symlink is not allowed: ${name}`);
    if (item.isDirectory()) result.push(...await files(root, name));
    else if (item.isFile()) result.push(name);
    else throw new Error(`Unsupported filesystem entry: ${name}`);
  }
  return result.sort();
}
export function run(exe, args, options = {}) {
  const env = { ...process.env };
  for (const key of Object.keys(env)) if (key.toUpperCase().startsWith('DAWNLIGHT_')) delete env[key];
  const result = spawnSync(exe, args, { cwd: ROOT, env, maxBuffer: 512 * 1024 * 1024, windowsHide: true, ...options });
  if (result.error) throw result.error;
  if (result.status !== 0 && !options.allowFailure) {
    throw new Error(`${exe} ${args[0]} exited ${result.status}:\n${result.stderr?.toString().slice(-6000)}`);
  }
  return result;
}
export function argsOf(allowed) {
  const result = {};
  for (let i = 2; i < process.argv.length; i++) {
    const key = process.argv[i];
    if (!allowed.includes(key)) throw new Error(`Unknown option: ${key}`);
    if (['--update-lock', '--offline'].includes(key)) result[key.slice(2)] = true;
    else {
      const value = process.argv[++i];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${key}`);
      result[key.slice(2)] = value;
    }
  }
  return result;
}
export async function loadLock() { return readJson(path.join(ROOT, 'upstream.lock.json')); }
export async function assertFingerprint(name, expected) {
  const actual = await fingerprint(name);
  if (actual.length !== expected.length || actual.sha256 !== expected.sha256) {
    throw new Error(`Fingerprint mismatch: ${name}`);
  }
}
export function verifySource(source, commit) {
  const head = run('git', ['-C', source, 'rev-parse', 'HEAD']).stdout.toString().trim();
  if (head !== commit) throw new Error(`Source HEAD ${head} != locked ${commit}`);
  const dirty = run('git', ['-C', source, 'status', '--porcelain', '--untracked-files=normal']).stdout.toString();
  if (dirty.trim()) throw new Error('Source worktree must be clean; commit changes before selecting a new baseline.');
}
export async function inventory(root) {
  return Promise.all((await files(root)).map(async name => ({ path: name, ...await fingerprint(inside(root, name)) })));
}
export async function verifyInventory(root, entries, excluded = []) {
  const actual = (await files(root)).filter(p => !excluded.includes(p));
  const expected = entries.map(f => relativeName(f.path)).sort();
  if (new Set(expected.map(p => p.toLowerCase())).size !== expected.length) throw new Error('Duplicate/case-colliding inventory path');
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Inventory path mismatch: missing=${expected.filter(p => !actual.includes(p)).join(',')}; extra=${actual.filter(p => !expected.includes(p)).join(',')}`);
  }
  for (const entry of entries) await assertFingerprint(inside(root, entry.path), entry);
}
export async function verifyTool(root, lock = null) {
  lock ??= await loadLock();
  const manifestFile = path.join(ROOT, lock.tool.distribution.inventory.path);
  await assertFingerprint(manifestFile, lock.tool.distribution.inventory);
  const manifest = await readJson(manifestFile);
  if (manifest.sourceCommit !== lock.upstream.commit || manifest.id !== lock.tool.distribution.id ||
      manifest.entrypoint !== lock.tool.distribution.entrypoint || manifest.platform !== 'win-x64' ||
      manifest.selfContained !== true) throw new Error('Tool provenance/platform mismatch');
  await verifyInventory(root, manifest.files);
  return manifest;
}
export function defaultToolRoot(lock) { return path.join(ROOT, '.cache/tools', lock.tool.distribution.id); }
export async function replaceDirectory(stage, target) {
  const within = (parent, child) => {
    const relative = path.relative(path.resolve(parent), path.resolve(child));
    return relative && relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative);
  };
  if (!within(path.join(ROOT, '.cache'), stage) ||
      ![path.join(ROOT, '.cache'), path.join(ROOT, 'vendor')].some(root => within(root, target))) {
    throw new Error('Directory replacement must stay within workspace cache/vendor roots');
  }
  const backup = `${target}.previous-${process.pid}`;
  await fs.mkdir(path.dirname(target), { recursive: true });
  let moved = false;
  try { await fs.rename(target, backup); moved = true; }
  catch (e) { if (e.code !== 'ENOENT') throw e; }
  try { await fs.rename(stage, target); }
  catch (e) { if (moved) await fs.rename(backup, target); throw e; }
  if (moved) await fs.rm(backup, { recursive: true });
}
export async function extractLocked(archive, stage) {
  const names = run('tar', ['-tf', archive]).stdout.toString('utf8').trim().split(/\r?\n/);
  for (const name of names) relativeName(name.replace(/\/$/, ''));
  await fs.mkdir(stage, { recursive: true });
  run('tar', ['-xf', archive, '-C', stage]);
  await files(stage);
}
export async function acquireArchive(asset, { offline = false } = {}) {
  const folder = path.join(ROOT, '.cache/downloads', asset.sha256);
  const target = path.join(folder, relativeName(asset.name));
  try { await assertFingerprint(target, asset); return target; }
  catch (e) { if (offline || e.code !== 'ENOENT') throw e; }
  const stage = await fs.mkdtemp(path.join(await cacheRoot(), 'download-'));
  for (let attempt = 1; attempt <= 3; attempt++) {
    const result = run('gh', ['release', 'download', asset.tag, '--repo', asset.repository,
      '--pattern', asset.name, '--dir', stage, '--clobber'], { allowFailure: true });
    if (result.status === 0) break;
    const message = result.stderr.toString();
    if (attempt === 3 || !/EOF|timeout|timed out|TLS|connection|HTTP 5\d\d|HTTP 429|temporar/i.test(message)) {
      throw new Error(`Locked asset download failed: ${message}`);
    }
    console.error(`Retrying locked asset download after transient network error (${attempt + 1}/3).`);
    await delay(2000);
  }
  const downloaded = inside(stage, asset.name);
  await assertFingerprint(downloaded, asset);
  await fs.mkdir(folder, { recursive: true });
  await fs.rename(downloaded, target);
  await fs.rm(stage, { recursive: true });
  return target;
}
export async function cacheRoot() {
  const name = path.join(ROOT, '.cache');
  await fs.mkdir(name, { recursive: true });
  return name;
}

// Deterministic ZIP: sorted paths, fixed DOS epoch, no extra fields, UTF-8 names.
const crcTable = Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function crc32(bytes) {
  let n = 0xffffffff;
  for (const b of bytes) n = crcTable[(n ^ b) & 255] ^ (n >>> 8);
  return (n ^ 0xffffffff) >>> 0;
}
export async function zipDirectory(root, target) {
  const locals = [], central = [];
  let offset = 0;
  for (const name of await files(root)) {
    const plain = await fs.readFile(inside(root, name)), compressed = deflateRawSync(plain, { level: 6 });
    const filename = Buffer.from(name), crc = crc32(plain);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x800, 6);
    local.writeUInt16LE(8, 8); local.writeUInt16LE(33, 12); local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18); local.writeUInt32LE(plain.length, 22); local.writeUInt16LE(filename.length, 26);
    locals.push(local, filename, compressed);
    const record = Buffer.alloc(46);
    record.writeUInt32LE(0x02014b50); record.writeUInt16LE(20, 4); record.writeUInt16LE(20, 6);
    record.writeUInt16LE(0x800, 8); record.writeUInt16LE(8, 10); record.writeUInt16LE(33, 14);
    record.writeUInt32LE(crc, 16); record.writeUInt32LE(compressed.length, 20); record.writeUInt32LE(plain.length, 24);
    record.writeUInt16LE(filename.length, 28); record.writeUInt32LE(offset, 42);
    central.push(record, filename); offset += local.length + filename.length + compressed.length;
  }
  const directory = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(central.length / 2, 8); end.writeUInt16LE(central.length / 2, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, Buffer.concat([...locals, directory, end]));
  return fingerprint(target);
}
