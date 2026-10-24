import fs from 'node:fs/promises';
import path from 'node:path';
import {
  ROOT, argsOf, cacheRoot, loadLock, verifySource, run, extractLocked,
  inventory, fingerprint, writeJson, zipDirectory, replaceDirectory, relativeName, files
} from './lib/locked-inputs.mjs';

const options = argsOf(['--source-root', '--update-lock', '--id']);
if (!options['source-root'] || !options['update-lock']) throw new Error('Maintenance only: --source-root <clean repo> --update-lock required');
if (process.platform !== 'win32' || process.arch !== 'x64') throw new Error('Publish on Windows x64');
const lock = await loadLock(), source = path.resolve(options['source-root']);
const distributionId = options.id ?? lock.tool.distribution.id;
if (!/^[a-z0-9][a-z0-9.-]+$/.test(distributionId)) throw new Error('Invalid distribution id');
if (lock.tool.distribution.status === 'published-and-download-verified' && distributionId === lock.tool.distribution.id) {
  throw new Error('Published assets are immutable. Supply a new --id for a reviewed baseline/tool update.');
}
verifySource(source, lock.upstream.commit);
const stage = await fs.mkdtemp(path.join(await cacheRoot(), 'publish-'));
const archive = path.join(stage, 'source.tar'), exactSource = path.join(stage, 'source');
run('git', ['-C', source, 'archive', '--format=tar', '-o', archive, lock.upstream.commit]);
const tree = run('git', ['-C', source, 'ls-tree', '-rz', lock.upstream.commit]).stdout.toString('utf8').split('\0').filter(Boolean);
for (const entry of tree) {
  const [header, name] = entry.split('\t');
  relativeName(name);
  if (!/^100(644|755) blob /.test(header)) throw new Error(`Unsupported source entry: ${name}`);
}
await fs.mkdir(exactSource);
run('tar', ['-xf', archive, '-C', exactSource]);
await files(exactSource);
const sdk = run('dotnet', ['--version']).stdout.toString().trim();
const output = path.join(stage, 'tool');
const command = ['publish', lock.tool.project, '-p:PublishProfile=win-x64', '--output', output, '-v', 'minimal'];
const result = run('dotnet', command, { cwd: exactSource, allowFailure: true });
const logRoot = path.join(ROOT, 'artifacts/w1');
await fs.mkdir(logRoot, { recursive: true });
await fs.writeFile(path.join(logRoot, 'tool-publish.stdout.txt'), result.stdout);
await fs.writeFile(path.join(logRoot, 'tool-publish.stderr.txt'), result.stderr);
if (result.status !== 0) throw new Error(`dotnet publish failed (${result.status}); see artifacts/w1/tool-publish.*`);
const manifest = {
  schemaVersion: 1, id: distributionId, sourceRepository: lock.upstream.repositoryUrl,
  sourceCommit: lock.upstream.commit, sourceBytes: 'git-archive-exact-commit',
  platform: 'win-x64', sdkVersion: sdk, configuration: 'Release', selfContained: true,
  trimmed: false, aot: false, readyToRun: false, singleFile: false,
  publishProfile: 'tools/ShaderPackAnalyzer/Properties/PublishProfiles/win-x64.pubxml',
  entrypoint: 'shaderpack-analyzer.exe',
  buildIdentityNote: 'Archive SHA-256 pins this exact build. Rebuilds are not claimed bit-reproducible; upstream NuGet dependencies are not fully locked.',
  files: await inventory(output)
};
const manifestPath = 'metadata/tool-assets.json';
await writeJson(path.join(ROOT, manifestPath), manifest);
const name = `shaderpack-analyzer-${manifest.id}-win-x64.zip`;
const packagePath = path.join(ROOT, 'artifacts/w1/packages', name);
const packageFingerprint = await zipDirectory(output, packagePath);
lock.tool.distribution = {
  id: manifest.id, status: 'packaged-awaiting-upload', repository: 'EltanceX/DawnlightCore',
  tag: manifest.id, intendedPlatform: 'win-x64', publishProfile: manifest.publishProfile,
  releaseUrl: `https://github.com/EltanceX/DawnlightCore/releases/tag/${manifest.id}`,
  access: 'private-repository-read-token-required', entrypoint: manifest.entrypoint,
  inventory: { path: manifestPath, ...await fingerprint(path.join(ROOT, manifestPath)) },
  archive: { name, ...packageFingerprint, repository: 'EltanceX/DawnlightCore', tag: manifest.id }
};
await writeJson(path.join(ROOT, 'upstream.lock.json'), lock);
await replaceDirectory(output, path.join(ROOT, '.cache/tools', manifest.id));
console.log(JSON.stringify({ status: 'packaged', sourceCommit: manifest.sourceCommit, sdk, files: manifest.files.length, archive: lock.tool.distribution.archive }, null, 2));
