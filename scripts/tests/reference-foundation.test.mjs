import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, readJson, writeJson, hash } from '../lib/locked-inputs.mjs';
import { loadExamples, loadReceipts } from '../lib/content-foundation.mjs';
import { loadReference, schemaCoverage, referencePages } from '../lib/reference-foundation.mjs';
import { siteOutputs } from '../lib/site-generator.mjs';

async function fixture(t) {
  await fs.mkdir(path.join(ROOT,'.cache'),{recursive:true});
  const root=await fs.mkdtemp(path.join(ROOT,'.cache/reference-test-'));
  t.after(async()=>{
    assert.equal(path.dirname(path.resolve(root)),path.resolve(ROOT,'.cache'));
    assert.ok(path.basename(root).startsWith('reference-test-'));
    await fs.rm(root,{recursive:true,force:true});
  });
  for(const name of ['examples','reference','metadata'])await fs.cp(path.join(ROOT,name),path.join(root,name),{recursive:true});
  await fs.copyFile(path.join(ROOT,'upstream.lock.json'),path.join(root,'upstream.lock.json'));
  return root;
}

test('all named fields, conditional occurrences and dynamic dictionaries have an owner',async()=>{
  const context=await loadExamples(),ref=await loadReference(context);
  assert.equal(ref.pages.length,18);
  assert.equal(ref.coverage.filter(row=>row.kind==='property').length,1052);
  assert.ok(ref.coverage.some(row=>row.kind==='dictionary'&&row.pointer.includes('materialDefinition')));
  for(const def of ['materials','materialProperty','materialMapping','customVariable','dataExpression'])assert.ok(ref.coverage.some(row=>row.version===5&&row.pointer.startsWith('#/$defs/'+def+'/')));
  for(const object of ['root','page','group','control','choice','condition','hiddenOption'])assert.ok(ref.coverage.some(row=>row.version==='settings-ui-v1'&&row.pointer.startsWith(object+'.')));
  assert.ok(ref.coverage.some(row=>row.pointer==='root.translations.*.*'));
  assert.ok(ref.coverage.every(row=>row.examples.length&&row.behaviorAnchor==='behavior'));
  assert.equal(new Set(ref.coverage.map(row=>row.version+':'+row.pointer)).size,ref.coverage.length);
});

test('coverage follows new fields and rejects new unowned definitions',()=>{
  const owners=new Map([['root','manifest']]);
  const schema={$defs:{root:{properties:{first:{type:'string'}},allOf:[{if:{properties:{gate:{const:true}}},then:{properties:{nested:{properties:{value:{type:'number'}}}}}}]}}};
  const rows=schemaCoverage(schema,5,owners);
  assert.deepEqual(rows.map(row=>row.name),['first','gate','nested','value']);
  schema.$defs.future={properties:{secret:{type:'string'}}};
  assert.throws(()=>schemaCoverage(schema,5,owners),/Unowned Schema definition future/);
});

for(const [name,file,mutate,expected] of [
  ['wrong baseline','metadata/reference-inputs.json',r=>r.baselineId='wrong',/Reference baseline/],
  ['missing pinned input','metadata/reference-inputs.json',r=>r.inputs.pop(),/Reference input IDs/],
  ['duplicate definition owner','reference/groups.json',r=>r.groups.resources.push('manifest'),/Duplicate definition owner/],
  ['missing definition owner','reference/groups.json',r=>r.groups.materials=r.groups.materials.filter(name=>name!=='materialMapping'),/Unowned Schema definition/],
  ['unregistered example','reference/pages.json',r=>r.pages[0].examples=['upstream/missing'],/unregistered example/],
  ['missing page registration','metadata/pages.json',r=>r.pages=r.pages.filter(page=>page.path!=='reference/scene.md'),/missing generated page registration/],
  ['uncovered command category','metadata/reference-examples.json',r=>r.examples.find(e=>e.id==='upstream/makeup').features.commandKinds=r.examples.find(e=>e.id==='upstream/makeup').features.commandKinds.filter(k=>k!=='clear'),/No complete reference example for commandKinds:clear/],
  ['negative fixture relabeled passed','metadata/reference-examples.json',r=>r.examples.at(-1).status='static-passed',/expected-rejected-combination/],
  ['missing rejection diagnostic','metadata/reference-examples.json',r=>r.examples.at(-1).checks[1].diagnostics=[],/assertion|false == true|falsy/i]
])test(`reference rejects ${name}`,async t=>{
  const root=await fixture(t),value=await readJson(path.join(root,file));mutate(value);await writeJson(path.join(root,file),value);
  await assert.rejects(loadReference(await loadExamples(root)),expected);
});

for(const [name,file,expected]of [
  ['stale Schema bytes','reference/inputs/schema-v5.json',/Fingerprint mismatch/],
  ['stale UI whitelist','reference/settings-ui-fields.json',/Fingerprint mismatch/],
  ['changed negative fixture','reference/examples/uniform-buffer/shaders/present.psh',/Local reference example file inventory/]
])test(`reference detects ${name}`,async t=>{
  const root=await fixture(t);await fs.appendFile(path.join(root,file),' ');
  await assert.rejects(loadReference(await loadExamples(root)),expected);
});

test('all categories retain their evidence status and versions stay separate',async()=>{
  const ref=await loadReference(await loadExamples());
  for(const key of ['commandKinds','resourceKinds','sceneModes'])for(const entries of Object.values(ref.featureCoverage[key]))assert.ok(entries.some(entry=>entry.status==='static-passed'));
  assert.deepEqual(ref.featureCoverage.bindingKinds.uniformBuffer,[{id:'reference/uniform-buffer',status:'expected-rejected-combination'}]);
  assert.equal(ref.inputs.get('completion-v2').value.dataAbiCatalog.inputs.length,23);
  assert.deepEqual(ref.inputs.get('catalog').value.supportedFormats.manifest,[3,4]);
  assert.ok(ref.coverage.filter(row=>row.version===3||row.version===4).every(row=>row.page==='reference/manifest-versions'));
});

test('generation is deterministic, preserves prose and manifests every public output',async()=>{
  const context=await loadExamples(),receipts=await loadReceipts(context),ref=await loadReference(context),pages=await readJson(path.join(ROOT,'metadata/pages.json'));
  const before=await fs.readFile(path.join(ROOT,'reference/prose/en/resources.md'));
  const one=await siteOutputs(context,receipts,ref,pages),two=await siteOutputs(context,receipts,ref,pages);
  assert.deepEqual(one,two);
  assert.ok((await fs.readFile(path.join(ROOT,'reference/prose/en/resources.md'))).equals(before));
  const manifest=JSON.parse(one.get('site/.vitepress/generated/output-manifest.json'));
  assert.equal(manifest.files.length,one.size-1);
  for(const record of manifest.files)assert.equal(record.sha256,hash(one.get(record.path)));
  for(const id of referencePages)for(const prefix of ['','en/']){
    const page=one.get(`site/${prefix}reference/${id}.md`).toString('utf8');
    assert.match(page,/\{#examples\}/);assert.match(page,/\{#behavior\}/);
    assert.doesNotMatch(page,/&lt;code>/);
  }
  const index=JSON.parse(one.get('site/public/downloads/reference/examples.json'));
  assert.ok(index.examples.every(example=>!('entries'in example)&&!('archiveBytes'in example)));
  assert.equal(index.examples.at(-1).status,'expected-rejected-combination');
  const resource=one.get('site/en/reference/resources.md').toString();
  assert.match(resource,/Schema default does not establish a runtime default/);
  assert.match(resource,/reject asset\/clear\/external/);
});
