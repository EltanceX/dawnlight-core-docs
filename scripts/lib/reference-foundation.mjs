import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, readJson, inside, files, assertFingerprint, hash, jsonBytes, relativeName, zipEntries } from './locked-inputs.mjs';

export const referencePages = ['index','manifest','options','resources','programs','passes','commands','targets','bindings','scene','materials','custom-data','settings-ui','catalog','diagnostics','tool-contracts','manifest-versions','examples'];
export function walkProperties(node, visit, pointer = '#') {
  if (!node || typeof node !== 'object') return;
  for (const [key,value] of Object.entries(node)) {
    const next = pointer + '/' + key.replaceAll('~','~0').replaceAll('/','~1');
    if (key === 'properties') for (const [name,field] of Object.entries(value)) visit(name,field,next+'/'+name.replaceAll('~','~0').replaceAll('/','~1'),node);
    walkProperties(value,visit,next);
  }
}
export function schemaCoverage(schema, version, owners) {
  for(const def of Object.keys(schema.$defs)) assert.ok(owners.has(def),`Unowned Schema definition ${def}`);
  const result=[];
  const record=(name,pointer,kind)=>{
    const def=pointer.match(/^#\/\$defs\/([^/]+)/)?.[1];
    assert.ok(def && owners.has(def),`Unowned Schema ${kind} ${pointer}`);
    const page=version===5?owners.get(def):'manifest-versions';
    result.push({version,kind,pointer,name,page:`reference/${page}`,anchor:`v${version}-${def.toLowerCase()}`,behaviorAnchor:'behavior',status:version===5?'generated-structure-with-reviewed-behavior':'compatibility-only'});
  };
  walkProperties(schema,(name,field,pointer)=>record(name,pointer,'property'));
  function dictionaries(node,pointer='#') {
    if(!node||typeof node!=='object')return;
    for(const [key,value]of Object.entries(node)) {
      const next=pointer+'/'+key.replaceAll('~','~0').replaceAll('/','~1');
      if(key==='additionalProperties'&&typeof value==='object')record('*',next,'dictionary');
      dictionaries(value,next);
    }
  }
  dictionaries(schema);
  return result;
}
export async function loadReference(context) {
  const root = context.root ?? ROOT;
  const record = await readJson(inside(root,'metadata/reference-inputs.json'));
  assert.equal(record.schemaVersion,1);
  assert.equal(record.baselineId,context.lock.baselineId,'Reference baseline');
  assert.equal(record.sourceCommit,context.lock.upstream.commit,'Reference commit');
  const inputs = new Map();
  for (const entry of record.inputs) {
    assert.ok(!inputs.has(entry.id),'Duplicate reference input');
    assert.equal(entry.sourceCommit,context.lock.upstream.commit);
    assert.match(entry.path,/^reference\/inputs\/[a-z0-9-]+\.(json|md)$/);
    await assertFingerprint(inside(root,entry.path),entry);
    const bytes = await fs.readFile(inside(root,entry.path));
    inputs.set(entry.id,{...entry,bytes,value:entry.path.endsWith('.json')?JSON.parse(bytes):bytes.toString('utf8')});
  }
  assert.deepEqual([...inputs.keys()].sort(),['schema-v3','schema-v4','schema-v5','completion-v1','completion-v2','catalog','diagnostics','temporal','settings-guide'].sort(),'Reference input IDs');
  assert.deepEqual(await files(inside(root,'reference/inputs')),record.inputs.map(entry=>entry.path.slice('reference/inputs/'.length)).sort(),'Reference input inventory');
  for(const bundle of context.lock.contracts.schemaBundles) for(const artifact of bundle.artifacts) {
    const entry=[...inputs.values()].find(entry=>entry.sourcePath===artifact.path);
    if(entry) assert.equal(entry.sha256,artifact.sha256,'Locked Schema/completion bytes');
  }
  assert.equal(inputs.get('catalog').value.hash,context.lock.contracts.catalogHash);
  assert.equal(inputs.get('completion-v2').value.dataAbiCatalog.dataAbiHash,context.lock.contracts.dataAbiHash);
  assert.equal(inputs.get('catalog').value.sceneAbiHash,context.lock.contracts.sceneAbiHash);
  await assertFingerprint(inside(root,'reference/settings-ui-fields.json'),record.settingsFields);
  const ui = await readJson(inside(root,'reference/settings-ui-fields.json'));
  assert.equal(ui.sourceCommit,context.lock.upstream.commit);
  const {groups} = await readJson(inside(root,'reference/groups.json'));
  const owners = new Map();
  for(const [group,defs] of Object.entries(groups)) {
    assert.ok(referencePages.includes(group));
    for(const def of defs){assert.ok(!owners.has(def),`Duplicate definition owner ${def}`);owners.set(def,group);}
  }
  const coverage=[];
  for(const version of [3,4,5]) {
    const schema=inputs.get(`schema-v${version}`).value;
    coverage.push(...schemaCoverage(schema,version,owners));
  }
  for(const [object,names] of Object.entries(ui.objects))for(const name of names)coverage.push({version:'settings-ui-v1',kind:'property',pointer:`${object}.${name}`,name,page:'reference/settings-ui',anchor:'ui-'+object.toLowerCase(),behaviorAnchor:'behavior',status:'reviewed-loader-whitelist'});
  for(const pointer of ['root.translations.*','root.translations.*.*'])coverage.push({version:'settings-ui-v1',kind:'dictionary',pointer,name:'*',page:'reference/settings-ui',anchor:'ui-root',behaviorAnchor:'behavior',status:'reviewed-loader-dictionary'});
  const examples=await readJson(inside(root,'metadata/reference-examples.json'));
  assert.equal(examples.schemaVersion,1);
  assert.equal(examples.baselineId,context.lock.baselineId);
  assert.equal(examples.sourceCommit,context.lock.upstream.commit);
  assert.equal(examples.toolInventorySha256,context.lock.tool.distribution.inventory.sha256);
  const ids=new Set();
  for(const example of examples.examples){
    assert.ok(!ids.has(example.id));ids.add(example.id);
    relativeName(example.sourceRoot);
    if(example.sourceType==='website-authored') {
      assert.equal(example.sourceRoot,'reference/examples/uniform-buffer');
      const entries=await Promise.all((await files(inside(root,example.sourceRoot))).map(async name=>({path:name,bytes:await fs.readFile(inside(root,example.sourceRoot+'/'+name))})));
      const inventory=entries.map(({path,bytes})=>({path,length:bytes.length,sha256:hash(bytes)}));
      assert.deepEqual(example.files,inventory,'Local reference example file inventory');
      assert.equal(example.sourceFingerprint,hash(jsonBytes({baselineId:context.lock.baselineId,sourceCommit:context.lock.upstream.commit,id:example.id,files:inventory})),'Local reference source identity');
      const archiveBytes=zipEntries(entries);
      assert.equal(example.archiveSha256,hash(archiveBytes),'Local reference archive identity');
      assert.equal(example.archiveLength,archiveBytes.length);
      assert.deepEqual(example.checks.map(c=>c.id),['pack','scene','graph','interface']);
      assert.equal(example.status,'expected-rejected-combination');
      assert.equal(example.expectedDiagnostic,'DLMAT1002');
      for(const check of example.checks){assert.equal(check.exitCode,check.id==='pack'?0:1);assert.equal(check.archiveExitCode,check.exitCode);assert.equal(check.archiveOutputSha256,check.outputSha256);if(check.exitCode)assert.ok(check.diagnostics.some(d=>d.message.includes(example.expectedDiagnostic)));}
      example.entries=entries;example.archiveBytes=archiveBytes;
    } else assert.equal(example.sourceUrl,`${context.lock.upstream.publicRepositoryUrl}/src/commit/${context.lock.upstream.commit}/${example.sourceRoot}`);
    assert.equal(example.runtimeVerified,false,'Upstream reference has no website game observation');
    if(!example.sourceType){assert.equal(example.status,'static-passed');assert.ok(example.checks.length>=3 && example.checks.every(check=>check.exitCode===0));}
    assert.ok(example.files.some(file=>file.path==='shaderpack.json'));
    assert.equal(new Set(example.files.map(file=>file.path)).size,example.files.length);
    for(const check of example.checks){assert.match(check.outputSha256,/^[0-9a-f]{64}$/);if(!example.sourceType)assert.ok((check.diagnostics??[]).every(d=>d.severity!=='error'));}
    for(const file of example.files){relativeName(file.path);if(!example.sourceType)assert.equal(file.sourcePath,example.sourceRoot+'/'+file.path);assert.match(file.sha256,/^[0-9a-f]{64}$/);}
  }
  const pages=await readJson(inside(root,'reference/pages.json'));
  assert.deepEqual(pages.pages.map(page=>page.id),referencePages,'Reference page ownership');
  for(const page of pages.pages){
    assert.ok(page.examples.length,`${page.id}: complete example required`);
    for(const id of page.examples)assert.ok(ids.has(id)||context.examples.some(example=>example.id===id),`${page.id}: unregistered example ${id}`);
    for(const locale of ['zh','en']) {
      const prose=await fs.readFile(inside(root,`reference/prose/${locale}/${page.id}.md`),'utf8');
      assert.match(prose,/\{#behavior\}/,`${page.id}: reviewed behavior missing`);
    }
  }
  const registrants=await readJson(inside(root,'metadata/pages.json'));
  for(const page of pages.pages)assert.ok(registrants.pages.some(record=>record.path===`reference/${page.id}.md`&&record.generated),`${page.id}: missing generated page registration`);
  for(const row of coverage)row.examples=pages.pages.find(page=>'reference/'+page.id===row.page).examples;
  const featureCoverage={};
  for(const [key,expected] of Object.entries({commandKinds:['clear','compute','copy','engineDraw','fullscreen','historyCommit','present'],bindingKinds:['image2D','sampler2D','sampler2DShadow','samplerCube','storageBuffer','uniformBuffer'],resourceKinds:['buffer','texture2D','textureCube'],sceneModes:['builtin','disabled','override']})){
    featureCoverage[key]=Object.fromEntries(expected.map(value=>{
      const matching=examples.examples.filter(example=>example.features[key]?.includes(value)).map(example=>example.id);
      assert.ok(matching.length,`No complete reference example for ${key}:${value}`);
      return [value,matching.map(id=>({id,status:examples.examples.find(example=>example.id===id).status}))];
    }));
  }
  return {root,record,inputs,ui,groups,owners,coverage,featureCoverage,examples:examples.examples,pages:pages.pages,coverageHash:hash(jsonBytes(coverage))};
}
