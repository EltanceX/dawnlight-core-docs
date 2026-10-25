import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {ROOT,readJson,writeJson,hash,jsonBytes,unzipEntries} from '../lib/locked-inputs.mjs';
import {loadExamples,loadReceipts} from '../lib/content-foundation.mjs';
import {practiceOutputs} from '../lib/practice-foundation.mjs';
import {loadPracticeRuntimeEvidence} from '../lib/practice-runtime-evidence.mjs';

test('three complete effects retain nine branches and only BuiltIn Terrain routes',async()=>{
  const c=await loadExamples(),r=await loadReceipts(c),packs=c.examples.filter(e=>e.validationStage==='w7');
  assert.equal(packs.length,3);
  for(const e of packs){
    assert.equal(e.variants.length,3);assert.ok(!e.manifest.customData&&!e.manifest.materials);
    const receipt=r.examples.find(x=>x.id===e.id),off=receipt.branches.find(b=>b.id==='grade-off');
    assert.ok(off.activeResources.every(x=>!x.includes(':post/')));
    assert.ok(off.activePrograms.every(x=>!x.endsWith('/grade')));
    assert.equal(off.activeCommands.filter(x=>x.includes('present-')).length,1);
  }
});

test('three rejected downloads contain the intended faults and are separate from valid releases',async()=>{
  const c=await loadExamples(),outputs=await practiceOutputs(c),spec=await readJson(path.join(ROOT,'examples/diagnostics/w7-cases.json')),r=await readJson(path.join(ROOT,'metadata/w7-diagnostics.json'));
  for(const fault of spec.cases){
    const receipt=r.cases.find(x=>x.id===fault.id),bytes=outputs.get('site/public'+receipt.downloadUrl);
    assert.equal(hash(bytes),receipt.archiveSha256);
    const manifest=JSON.parse(unzipEntries(bytes).find(f=>f.path==='shaderpack.json').bytes);
    for(const change of fault.changes){let value=manifest;for(const key of change.pointer.slice(1).split('/'))value=value[key];assert.deepEqual(value,change.value);}
    assert.ok(!c.examples.some(e=>e.archiveSha256===receipt.archiveSha256));
  }
});

async function fixture(t){
  const root=await fs.mkdtemp(path.join(ROOT,'.cache/practice-test-'));
  t.after(async()=>{assert.equal(path.dirname(root),path.join(ROOT,'.cache'));assert.ok(path.basename(root).startsWith('practice-test-'));await fs.rm(root,{recursive:true,force:true});});
  for(const name of ['examples','metadata','site/public/evidence/w7','site/public/media/w7'])await fs.cp(path.join(ROOT,name),path.join(root,name),{recursive:true});
  await fs.copyFile(path.join(ROOT,'upstream.lock.json'),path.join(root,'upstream.lock.json'));return root;
}

for(const [name,mutate]of [
  ['an invented archive identity',r=>r.cases[0].archiveSha256='0'.repeat(64)],
  ['a failed repair',r=>r.cases[0].repaired[0].exitCode=1]
])test('diagnostic downloads reject '+name,async t=>{
  const root=await fixture(t),p=path.join(root,'metadata/w7-diagnostics.json'),r=await readJson(p);mutate(r);await writeJson(p,r);
  await assert.rejects(practiceOutputs(await loadExamples(root)));
});

test('runtime covers nine branches without claiming failed-candidate rejection',async()=>{
  const c=await loadExamples(),r=await loadPracticeRuntimeEvidence(c,await loadReceipts(c));
  assert.equal(r.examples.reduce((n,e)=>n+e.branches,0),9);assert.equal(r.invalidCandidate.runtimeRejectionVerified,false);
});
for(const [name,mutate,expected]of [
  ['a stale option',life=>life.variants[0].header.options[0].value='false',/runtime option mismatch/],
  ['a missing linked Program',life=>life.variants[0].linkedPrograms.pop(),/linked closure mismatch/]
])test('W7 runtime rejects '+name+' even after asset rehashing',async t=>{
  const root=await fixture(t),p='evidence/w7/color-balance-lifecycle.json',life=await readJson(path.join(root,'site/public',p));mutate(life);
  const bytes=jsonBytes(life);await fs.writeFile(path.join(root,'site/public',p),bytes);
  const r=await readJson(path.join(root,'metadata/w7-runtime.json'));Object.assign(r.publicFiles.find(f=>f.path===p),{length:bytes.length,sha256:hash(bytes)});await writeJson(path.join(root,'metadata/w7-runtime.json'),r);
  const c=await loadExamples(root);await assert.rejects(loadPracticeRuntimeEvidence(c,await loadReceipts(c)),expected);
});
