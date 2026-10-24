import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, readJson, loadLock, verifyTool, defaultToolRoot, writeJson, assertFingerprint, files, hash, jsonBytes, zipEntries, extractLocked, verifyInventory, run } from './lib/locked-inputs.mjs';
import { analyzerRunner } from './lib/analyzer-runner.mjs';

const lock = await loadLock();
assert.ok(process.argv.slice(2).every(arg=>arg==='--verify-receipt'),'Usage: validate-reference-upstream.mjs [--verify-receipt]');
const verifyReceipt=process.argv.includes('--verify-receipt');
const inventory = await readJson(path.join(ROOT, 'vendor/dawnlight/source-inventory.json'));
await assertFingerprint(path.join(ROOT, 'vendor/dawnlight/source-inventory.json'), lock.importInventory);
const toolRoot = defaultToolRoot(lock), tool = await verifyTool(toolRoot, lock);
const definitions = [
  ['upstream/scene-lab','SceneAbiLab_v0.1'], ['upstream/data-lab','CustomDataLab_Both'],
  ['upstream/dawnlight','Dawnlight_v3.1'], ['upstream/makeup','MakeUpUltraFast_SC_v0.21']
];
const examples = [];
for (const [id, directory] of definitions) {
  const prefix = `examples/${directory}/`, entries = inventory.files.filter(file => file.path.startsWith(prefix));
  assert.ok(entries.length);
  for (const entry of entries) await assertFingerprint(path.join(ROOT, 'vendor/dawnlight', entry.path), entry);
  const root = path.join(ROOT, 'vendor/dawnlight/examples', directory);
  const manifest = await readJson(path.join(root, 'shaderpack.json'));
  const sourceRoot = entries.find(file => file.path === prefix + 'shaderpack.json').sourcePath.replace(/\/shaderpack.json$/, '');
  const programs = [], resources = [], commands = [], bindings = [], routes = [];
  function walk(value) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value.programs)) programs.push(...value.programs.filter(p => typeof p === 'object'));
    if (Array.isArray(value.resources)) resources.push(...value.resources);
    if (Array.isArray(value.commands)) commands.push(...value.commands);
    if (Array.isArray(value.bindings)) bindings.push(...value.bindings);
    if (Array.isArray(value.sceneCategories)) routes.push(...value.sceneCategories);
    for (const child of Object.values(value)) walk(child);
  }
  walk(manifest);
  for (const fragment of manifest.fragments ?? []) walk(await readJson(path.join(root, fragment)));
  const invoke = analyzerRunner(path.join(toolRoot, tool.entrypoint), { cwd: ROOT, output: path.join(ROOT, 'artifacts/w5/upstream', directory) });
  const checks = [];
  const operations = [
    ['pack', ['pack','validate',root,'--format','json']],
    ['scene', ['scene','explain',root,'--include-inactive','--format','json']],
    ['graph', ['graph','dump',root,'--contract','2','--include-inactive']]
  ];
  if (id === 'upstream/data-lab') operations.push(
    ['materials', ['materials','explain',root,'--format','json']],
    ['layout', ['materials','layout',root,'--format','json']],
    ['data', ['data','interface',root,'--format','json']]
  );
  let manifestHash;
  for (const [name,args] of operations) {
    const result = await invoke(name,args,{packRoot:root,exampleId:id});
    assert.ok(result.value.diagnostics.every(diagnostic => diagnostic.severity !== 'error'), JSON.stringify(result.value.diagnostics));
    manifestHash ??= result.value.manifestHash;
    assert.equal(result.value.manifestHash,manifestHash);
    checks.push({id:name,exitCode:result.exitCode,outputSha256:result.outputSha256,diagnostics:result.value.diagnostics});
  }
  examples.push({id,directory,sourceRoot,sourceUrl:`${lock.upstream.publicRepositoryUrl}/src/commit/${lock.upstream.commit}/${sourceRoot}`,manifestVersion:manifest.manifestVersion,sceneAbiVersion:manifest.sceneAbiVersion??null,manifestHash,status:'static-passed',runtimeVerified:false,checks,
    features:{programKinds:[...new Set(programs.map(p=>p.kind))].sort(),resourceKinds:[...new Set(resources.map(r=>r.kind))].sort(),commandKinds:[...new Set(commands.map(c=>c.type))].sort(),bindingKinds:[...new Set(bindings.map(b=>b.kind))].sort(),sceneModes:[...new Set(routes.map(r=>r.mode))].sort(),settings:Boolean(manifest.settings)},
    files:entries.map(file=>({path:file.path.slice(prefix.length),sourcePath:file.sourcePath,length:file.length,sha256:file.sha256}))});
}
// Complete negative fixture: materialTable cannot be reinterpreted as a UBO.
const id='reference/uniform-buffer',sourceRoot='reference/examples/uniform-buffer';
const localRoot=path.join(ROOT,sourceRoot), entries=await Promise.all((await files(localRoot)).map(async name=>({path:name,bytes:await fs.readFile(path.join(localRoot,name))})));
const inventoryLocal=entries.map(({path,bytes})=>({path,length:bytes.length,sha256:hash(bytes)}));
const sourceFingerprint=hash(jsonBytes({baselineId:lock.baselineId,sourceCommit:lock.upstream.commit,id,files:inventoryLocal}));
const archiveBytes=zipEntries(entries),output=path.join(ROOT,'artifacts/w5/uniform-buffer');
await fs.mkdir(output,{recursive:true});
const archive=path.join(output,'uniform-buffer.zip'),unpacked=await fs.mkdtemp(path.join(output,'unpacked-'));
await fs.writeFile(archive,archiveBytes);
await extractLocked(archive,unpacked);await verifyInventory(unpacked,inventoryLocal);
const checks=[];let manifestHash;
for(const [name,args] of [
  ['pack',root=>['pack','validate',root,'--format','json']],
  ['scene',root=>['scene','explain',root,'--include-inactive','--format','json']],
  ['graph',root=>['graph','dump',root,'--contract','2','--include-inactive']],
  ['interface',root=>['program','interface',root,'--program','reference:ubo/post/present','--contract','2']]
]) {
  const results=[];
  for(const [kind,root] of [['source',localRoot],['archive',unpacked]]) {
    const raw=run(path.join(toolRoot,tool.entrypoint),args(root),{cwd:ROOT,allowFailure:true});
    await fs.mkdir(path.join(output,kind),{recursive:true});
    await fs.writeFile(path.join(output,kind,name+'.stdout.json'),raw.stdout);
    await fs.writeFile(path.join(output,kind,name+'.stderr.txt'),raw.stderr);
    const value=JSON.parse(raw.stdout),expected=name==='pack'?0:1;
    assert.equal(raw.status,expected,`UBO negative fixture ${name}: expected ${expected}`);
    if(expected===0){assert.equal(value.valid??value.success,true);manifestHash=value.manifestHash;}
    else {assert.equal(value.success??value.valid,false);assert.ok(value.diagnostics.some(d=>d.message.includes('DLMAT1002')),'Expected materialTable binding rejection');}
    const normalized=JSON.stringify(value).replaceAll(root,'<pack>').replaceAll(root.replaceAll('\\','/'),'<pack>');
    results.push({exitCode:raw.status,outputSha256:hash(jsonBytes(JSON.parse(normalized))),diagnostics:value.diagnostics});
  }
  assert.equal(results[0].outputSha256,results[1].outputSha256,'UBO source/archive differ');
  checks.push({id:name,exitCode:results[0].exitCode,outputSha256:results[0].outputSha256,archiveExitCode:results[1].exitCode,archiveOutputSha256:results[1].outputSha256,diagnostics:results[0].diagnostics});
}
examples.push({id,directory:'Uniform Buffer / materialTable negative fixture',sourceType:'website-authored',sourceRoot,sourceUrl:'https://github.com/EltanceX/dawnlight-core-docs/tree/main/'+sourceRoot,manifestVersion:5,sceneAbiVersion:2,manifestHash,sourceFingerprint,archiveSha256:hash(archiveBytes),archiveLength:archiveBytes.length,status:'expected-rejected-combination',expectedDiagnostic:'DLMAT1002',runtimeVerified:false,checks,features:{programKinds:['graphics'],resourceKinds:['buffer','texture2D'],commandKinds:['engineDraw','present'],bindingKinds:['sampler2D','uniformBuffer','storageBuffer'],sceneModes:['builtin'],settings:false},files:inventoryLocal});
const report={schemaVersion:1,baselineId:lock.baselineId,sourceCommit:lock.upstream.commit,toolInventorySha256:lock.tool.distribution.inventory.sha256,evidence:'loader-and-offline-analysis-only',examples};
if(verifyReceipt)assert.deepEqual(report,await readJson(path.join(ROOT,'metadata/reference-examples.json')),'Reference Analyzer receipt changed');
else await writeJson(path.join(ROOT,'metadata/reference-examples.json'),report);
await writeJson(path.join(ROOT,'artifacts/w5/reference-validation.json'),{status:'passed',...report,analyzerInvocations:23});
console.log(JSON.stringify({status:'passed',examples:examples.map(({id,status,features,files})=>({id,status,features,files:files.length})),analyzerInvocations:examples.reduce((n,e)=>n+e.checks.reduce((n,c)=>n+(c.archiveExitCode!==undefined?2:1),0),0)},null,2));
