import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, loadLock, jsonBytes, readJson } from './lib/locked-inputs.mjs';

export async function publicBaseline() {
  const lock = await loadLock();
  const evidence = await readJson(path.join(ROOT, 'metadata/public-source.json'));
  const verified = await readJson(path.join(ROOT, 'metadata/w1-verification.json'));
  return {
    schemaVersion: 1,
    purpose: 'documentation-baseline-not-a-shaderpack',
    baselineId: lock.baselineId,
    source: { repositoryUrl: lock.upstream.publicRepositoryUrl, commit: lock.upstream.commit, anonymousAccessVerified: evidence.anonymousAccessVerified },
    authoring: lock.authoring,
    contracts: { catalog: lock.contracts.catalogContractVersion, graph: lock.contracts.graphContractVersion, programInterfaceForV5: lock.contracts.programInterfaceContractForV5, catalogHash: lock.contracts.catalogHash, sceneAbiHash: lock.contracts.sceneAbiHash },
    verification: { ordinarySuccesses: verified.validation.ordinarySuccesses, expectedOriginalGuideFailures: verified.validation.expectedUpstreamFailures, originalGuideDiagnostic: verified.originalGuide.code, regressionTestsPassed: verified.regression.passed, ...verified.runtimeEvidence }
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.join(ROOT, 'scripts/sync-site-baseline.mjs')) {
  if (process.argv.length > 3 || (process.argv[2] && process.argv[2] !== '--check')) throw new Error('Usage: sync-site-baseline.mjs [--check]');
  const file = path.join(ROOT, 'site/public/downloads/site-baseline.json');
  const expected = jsonBytes(await publicBaseline());
  if (process.argv.includes('--check')) {
    if (!(await fs.readFile(file)).equals(expected)) throw new Error('Public baseline is stale: run node scripts/sync-site-baseline.mjs and review the change.');
    console.log('Public baseline matches locked metadata.');
  } else {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, expected);
    console.log('Wrote public baseline projection.');
  }
}
