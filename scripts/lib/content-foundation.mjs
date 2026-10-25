import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseDocument } from 'yaml';
import { ROOT, readJson, files, hash, jsonBytes, inside, relativeName, zipEntries } from './locked-inputs.mjs';

export const generatedScopes = ['site/examples', 'site/en/examples', 'site/public/downloads/examples', 'site/reference', 'site/en/reference', 'site/public/downloads/reference', 'site/.vitepress/generated'];
export const evidenceBoundary = { driverStatus: 'notProvided', runtimeEvaluated: false, liveWorldVerified: false, visual: 'notRun' };

export function frontmatter(text, file) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  assert.ok(match, `${file}: missing frontmatter`);
  const doc = parseDocument(match[1], { uniqueKeys: true });
  assert.equal(doc.errors.length, 0, `${file}: invalid frontmatter: ${doc.errors.join('; ')}`);
  return doc.toJSON();
}

// Only complete, registered source files may be embedded in authored pages.
export function courseIncludes(content, context, file) {
  return [...content.matchAll(/^<<<\s+(.+)$/gm)].map(match => {
    const spec = match[1].trim();
    assert.match(spec, /^@\/\.\.\/examples\/(?:course|features)\/[a-z0-9-]+\/(?:shaderpack\.json|settings\.json|README\.md|(?:shaders|manifest|presets)\/[a-z0-9.-]+)(?:\{glsl\})?$/, `${file}: unsafe or unsupported source include ${spec}`);
    const name = spec.replace(/^@\/\.\.\//, '').replace(/\{glsl\}$/, '');
    const example = context.examples.find(item => name.startsWith(item.root + '/'));
    assert.ok(example && example.snippets.some(item => example.root + '/' + item.file === name && !item.pointer && !item.region), `${file}: unregistered full-source include ${name}`);
    return name;
  });
}

export function snippet(example, spec) {
  const input = example.entries.find(entry => entry.path === spec.file);
  assert.ok(input, `${example.id}: snippet ${spec.id}: missing file ${spec.file}`);
  let code = input.bytes.toString('utf8');
  if (spec.pointer !== undefined) {
    assert.ok(spec.pointer === '' || spec.pointer.startsWith('/'), `${example.id}: snippet ${spec.id}: invalid JSON pointer`);
    let value = JSON.parse(code);
    for (const token of spec.pointer.split('/').slice(1)) {
      const key = token.replaceAll('~1', '/').replaceAll('~0', '~');
      assert.ok(value && Object.hasOwn(value, key), `${example.id}: ${spec.file}#${spec.pointer}: stale snippet ${spec.id}`);
      value = value[key];
    }
    code = JSON.stringify(value, null, 2) + '\n';
  }
  if (spec.region) {
    const lines = code.split('\n');
    const starts = lines.flatMap((line, i) => line.trim() === `// #region ${spec.region}` ? [i] : []);
    const ends = lines.flatMap((line, i) => line.trim() === `// #endregion ${spec.region}` ? [i] : []);
    assert.ok(starts.length === 1 && ends.length === 1 && ends[0] > starts[0], `${example.id}: ${spec.file}: missing/duplicate region ${spec.region}`);
    code = lines.slice(starts[0] + 1, ends[0]).join('\n') + '\n';
  }
  assert.ok(!code.includes('```'), `${example.id}: ${spec.file}: unsafe code fence`);
  return { ...spec, code, sourceSha256: hash(input.bytes), snippetSha256: hash(Buffer.from(code)) };
}

// A source projection for inventories and expectations. The pinned Loader remains
// authoritative and validates the actual composition for every source/ZIP pair.
export function composeExampleManifest(entries, entrypoint = 'shaderpack.json') {
  const get = name => {
    relativeName(name);
    const entry = entries.find(e => e.path === name);
    assert.ok(entry, `Missing manifest fragment: ${name}`);
    return JSON.parse(entry.bytes);
  };
  const root = get(entrypoint), result = { ...root };
  for (const name of root.fragments ?? []) {
    const fragment = get(name);
    assert.ok(!fragment.fragments, 'Nested course fragments are unsupported');
    for (const [key, value] of Object.entries(fragment)) {
      assert.ok(['options', 'resources', 'programs', 'passes', 'sceneCategories', 'materials', 'customData'].includes(key), `Unsupported course fragment field: ${key}`);
      if (Array.isArray(value)) result[key] = [...result[key] ?? [], ...value];
      else { assert.ok(!Object.hasOwn(result, key), `Duplicate course fragment field: ${key}`); result[key] = value; }
    }
  }
  return result;
}

export async function loadExamples(root = ROOT) {
  const lock = await readJson(path.join(root, 'upstream.lock.json'));
  const registry = await readJson(path.join(root, 'examples/registry.json'));
  const sourceMap = await readJson(path.join(root, 'metadata/source-map.json'));
  assert.equal(registry.schemaVersion, 1, 'examples/registry.json: schema version');
  assert.equal(registry.baselineId, lock.baselineId, 'examples/registry.json: wrong baseline');
  assert.equal(registry.sourceCommit, lock.upstream.commit, 'examples/registry.json: wrong source commit');
  const ids = new Set(), roots = new Set(), pages = new Set(), examples = [];
  for (const definition of registry.examples) {
    const fail = message => `${definition.id}: ${message}`;
    assert.match(definition.id, /^[a-z0-9-]+\/[a-z0-9-]+$/, fail('invalid example ID'));
    assert.ok(!ids.has(definition.id), fail('duplicate ID')); ids.add(definition.id);
    relativeName(definition.root);
    assert.equal(definition.root, `examples/${definition.id}`, fail('source root must match ID'));
    assert.ok(!roots.has(definition.root), fail('duplicate root')); roots.add(definition.root);
    assert.match(definition.page, /^examples\/[a-z0-9-]+\.md$/, fail('invalid page'));
    assert.ok(!pages.has(definition.page), fail('duplicate page')); pages.add(definition.page);
    assert.equal(definition.sourceType, 'website-authored', fail('unknown source ownership'));
    for (const source of definition.sourceRefs) {
      assert.equal(source.repository, 'upstream', fail('unknown upstream reference'));
      assert.equal(source.commit, lock.upstream.commit, fail(`wrong source commit: ${source.path}`));
      assert.ok(sourceMap.sources.some(entry => entry.path === source.path && entry.commit === source.commit), fail(`unregistered upstream reference: ${source.path}`));
    }
    assert.equal(definition.manifestVersion, lock.authoring.primaryManifestVersion, fail('manifest baseline mismatch'));
    assert.equal(definition.sceneAbiVersion, lock.authoring.sceneAbiVersion, fail('scene ABI mismatch'));
    assert.equal(definition.entrypoint, 'shaderpack.json', fail('entrypoint'));
    if (['w6', 'w7'].includes(definition.validationStage)) {
      assert.ok(definition.variants.length >= 3, fail('W6 needs explicit branch validation'));
      assert.equal(new Set(definition.variants.map(v => v.id)).size, definition.variants.length, fail('duplicate variant'));
      for (const variant of definition.variants) {
        assert.match(variant.id, /^[a-z0-9-]+$/);
        assert.equal(variant.capabilities, 'host-default');
        assert.ok(variant.options && typeof variant.options === 'object' && !Array.isArray(variant.options));
      }
    } else assert.deepEqual(definition.variants, [{ id: 'default', options: {}, capabilities: 'host-default' }], fail('The course currently supports unconditional examples; new branches need explicit validation support'));
    assert.deepEqual(definition.runtimeEvidence, evidenceBoundary, fail('unverified runtime evidence'));
    for (const language of ['zh-CN', 'en-US']) assert.ok(definition.titles[language], fail(`missing title: ${language}`));
    const actual = await files(inside(root, definition.root));
    assert.deepEqual(actual, [...definition.files].sort(), fail(`missing or extra source file: missing=${definition.files.filter(file => !actual.includes(file)).join(',')}; extra=${actual.filter(file => !definition.files.includes(file)).join(',')}`));
    assert.ok(actual.includes(definition.entrypoint), fail('missing shaderpack.json'));
    const entries = await Promise.all(actual.map(async name => {
      assert.match(name, /\.(?:json|md|vsh|psh|glsl)$/, fail(`unexpected source file ${name}`));
      const bytes = await fs.readFile(inside(inside(root, definition.root), name));
      assert.ok(!bytes.includes(13) && !bytes.subarray(0, 3).equals(Buffer.from([239, 187, 191])), fail(`${name}: sources must use UTF-8 LF without BOM`));
      return { path: name, bytes };
    }));
    const inventory = entries.map(entry => ({ path: entry.path, length: entry.bytes.length, sha256: hash(entry.bytes) }));
    const sourceFingerprint = hash(jsonBytes({ baselineId: lock.baselineId, sourceCommit: lock.upstream.commit, id: definition.id, files: inventory }));
    const manifest = composeExampleManifest(entries, definition.entrypoint);
    assert.equal(manifest.manifestVersion, definition.manifestVersion, fail('shaderpack.json: manifest version'));
    assert.equal(manifest.sceneAbiVersion, definition.sceneAbiVersion, fail('shaderpack.json: scene ABI'));
    assert.deepEqual(manifest.programs.map(program => program.id).sort(), [...definition.programs].sort(), fail('shaderpack.json: program IDs'));
    if (!definition.validationStage) assert.deepEqual(manifest.options, [], fail('starter unexpectedly declares options'));
    else for (const variant of definition.variants) for (const id of Object.keys(variant.options)) assert.ok(manifest.options.some(option => option.id === id), fail(`unknown variant option: ${id}`));
    const overrides = manifest.sceneCategories.filter(route => route.mode === 'override').map(route => route.id).sort();
    assert.deepEqual(overrides, [...definition.expected.overrides ?? []].sort(), fail('shaderpack.json: expected override routes'));
    const archiveBytes = zipEntries(entries);
    const example = { ...definition, manifest, entries, inventory, sourceFingerprint, definitionSha256: hash(jsonBytes(definition)), archiveBytes, archiveSha256: hash(archiveBytes), archiveLength: archiveBytes.length };
    assert.equal(new Set(definition.snippets.map(spec => spec.id)).size, definition.snippets.length, fail('duplicate snippet ID'));
    example.snippets = definition.snippets.map(spec => snippet(example, spec));
    examples.push(example);
  }
  return { root, lock, registry, examples };
}

export async function loadReceipts(context) {
  const legacy = await readJson(path.join(context.root, 'metadata/examples-validation.json'));
  const stages = [legacy];
  if (context.examples.some(e => e.validationStage === 'w6')) stages.push(await readJson(path.join(context.root, 'metadata/w6-examples-validation.json')));
  if (context.examples.some(e => e.validationStage === 'w7')) stages.push(await readJson(path.join(context.root, 'metadata/w7-examples-validation.json')));
  for (const stage of stages) {
    assert.equal(stage.schemaVersion, 1, 'Example receipt schema');
    assert.equal(stage.baselineId, context.lock.baselineId, 'Example receipt baseline');
    assert.equal(stage.sourceCommit, context.lock.upstream.commit, 'Example receipt commit');
    assert.equal(stage.toolInventorySha256, context.lock.tool.distribution.inventory.sha256, 'Example receipt tool');
  }
  const report = { ...legacy, examples: stages.flatMap(stage => stage.examples) };
  assert.equal(report.schemaVersion, 1, 'Example receipt schema');
  assert.equal(report.baselineId, context.lock.baselineId, 'Example receipt baseline');
  assert.equal(report.sourceCommit, context.lock.upstream.commit, 'Example receipt commit');
  assert.equal(report.toolInventorySha256, context.lock.tool.distribution.inventory.sha256, 'Example receipt tool');
  assert.deepEqual(report.examples.map(example => example.id).sort(), context.examples.map(example => example.id).sort(), 'Example receipt IDs');
  for (const example of context.examples) {
    const receipt = report.examples.find(item => item.id === example.id);
    for (const key of ['sourceFingerprint', 'definitionSha256', 'archiveSha256', 'archiveLength']) assert.equal(receipt[key], example[key], `${example.id}: stale validation receipt (${key}); run examples:check`);
    assert.equal(receipt.status, 'passed', `${example.id}: static validation failed`);
    assert.deepEqual(receipt.runtimeEvidence, evidenceBoundary, `${example.id}: runtime claims`);
    assert.deepEqual(receipt.files, example.inventory, `${example.id}: receipt file inventory`);
    const ids = ['pack', 'scene', 'graph', ...example.programs.map(id => `interface:${id}`), ...(example.validationStage ? ['data', ...(example.manifest.materials ? ['materials'] : [])] : [])];
    assert.deepEqual(receipt.checks.map(check => `${check.variant}:${check.id}`).sort(), example.variants.flatMap(v => ids.map(id => `${v.id}:${id}`)).sort(), `${example.id}: incomplete checks`);
    for (const check of receipt.checks) {
      assert.equal(check.exitCode, 0, `${example.id}: ${check.id}`);
      assert.equal(check.archiveExitCode, 0, `${example.id}: archive ${check.id}`);
      assert.equal(check.archiveOutputSha256, check.outputSha256, `${example.id}: archive ${check.id} differs`);
      assert.match(check.outputSha256, /^[a-f0-9]{64}$/);
      assert.equal(check.manifestHash, receipt.manifestHash, `${example.id}: ${check.id}: manifest mismatch`);
    }
  }
  const legacyReleases = await readJson(path.join(context.root, 'metadata/example-releases.json'));
  const releases = { ...legacyReleases, examples: [...legacyReleases.examples, ...(context.examples.some(e => e.validationStage === 'w6') ? (await readJson(path.join(context.root, 'metadata/w6-example-releases.json'))).examples : []), ...(context.examples.some(e => e.validationStage === 'w7') ? (await readJson(path.join(context.root, 'metadata/w7-example-releases.json'))).examples : [])] };
  assert.equal(releases.schemaVersion, 1, 'Published example index schema');
  for (const release of releases.examples) {
    const example = context.examples.find(item => item.id === release.id);
    assert.ok(example, `${release.id}: published example must remain registered`);
    for (const key of ['sourceFingerprint', 'archiveSha256', 'archiveLength']) assert.equal(example[key], release[key], `${release.id}: published release is immutable (${key}); register a new revision`);
  }
  return report;
}

export function managedOutput(name) {
  relativeName(name);
  assert.ok(generatedScopes.some(scope => name.startsWith(scope + '/')), `Refuse to overwrite source: ${name}`);
  return name;
}

export async function applyOutputs(outputs, { root = ROOT, check = false } = {}) {
  for (const [name, value] of outputs) {
    managedOutput(name);
    const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value);
    let previous;
    try { previous = await fs.readFile(inside(root, name)); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (!previous?.equals(bytes)) {
      assert.ok(!check, `Stale generated output: ${name}; run docs:generate`);
      await fs.mkdir(path.dirname(inside(root, name)), { recursive: true });
      await fs.writeFile(inside(root, name), bytes);
    }
  }
  for (const scope of generatedScopes) {
    let names = [];
    try { names = await files(inside(root, scope)); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    for (const file of names) {
      const name = managedOutput(scope + '/' + file);
      if (!outputs.has(name)) {
        assert.ok(!check, `Unexpected generated output: ${name}`);
        await fs.unlink(inside(root, name));
      }
    }
  }
}
