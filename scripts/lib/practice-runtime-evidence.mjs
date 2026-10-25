import assert from 'node:assert/strict';
import path from 'node:path';
import {readJson,inside,files,assertFingerprint} from './locked-inputs.mjs';

export async function loadPracticeRuntimeEvidence(context, receipts) {
  const record=await readJson(path.join(context.root,'metadata/w7-runtime.json'));
  assert.equal(record.schemaVersion,1);assert.equal(record.status,'observed-with-limits');
  assert.equal(record.baselineId,context.lock.baselineId);assert.equal(record.sourceCommit,context.lock.upstream.commit);
  assert.equal(record.host.sourceHead,record.sourceCommit);assert.equal(record.host.originalRuntimeModified,false);
  assert.equal(record.method.independentHumanReader,false);assert.equal(record.method.numericValueReadback,false);assert.equal(record.method.performanceGatePassed,null);
  assert.equal(record.invalidCandidate.status,'inconclusive');assert.equal(record.invalidCandidate.runtimeRejectionVerified,false);
  const root=path.join(context.root,'site/public'),inventory=new Map();
  for(const f of record.publicFiles){
    assert.match(f.path,/^(?:evidence\/w7\/[a-z0-9-]+\.json|media\/w7\/[a-z0-9-]+\.jpg)$/);
    assert.ok(!inventory.has(f.path));await assertFingerprint(inside(root,f.path),f);inventory.set(f.path,f);
  }
  for(const scope of ['evidence/w7','media/w7'])assert.deepEqual((await files(inside(root,scope))).map(f=>scope+'/'+f),[...inventory.keys()].filter(f=>f.startsWith(scope+'/')).sort());
  const asset=url=>{assert.ok(url?.startsWith('/')&&inventory.has(url.slice(1)),'Unregistered W7 asset');return inside(root,url.slice(1));};
  const examples=context.examples.filter(e=>e.validationStage==='w7');
  assert.deepEqual(record.examples.map(e=>e.id),examples.map(e=>e.id));
  for(const item of record.examples){
    const example=examples.find(e=>e.id===item.id),receipt=receipts.examples.find(e=>e.id===item.id);
    for(const key of ['sourceFingerprint','archiveSha256'])assert.equal(item[key],example[key],'W7 stale runtime '+key);
    assert.equal(item.manifestHash,receipt.manifestHash);asset(item.image);
    const life=await readJson(asset(item.lifecycle)),active='External:w7-'+example.id.split('/')[1];
    assert.equal(life.status,'passed');assert.equal(life.sourceFingerprint,item.sourceFingerprint);assert.equal(life.archiveSha256,item.archiveSha256);
    for(const phase of ['loaded','reloaded','resized','builtIn']){
      assert.equal(life[phase].active,phase==='builtIn'?'BuiltIn':active);assert.equal(life[phase].error,null);assert.equal(life[phase].pending,0);
    }
    assert.ok(life.reloaded.published>life.loaded.published);assert.notDeepEqual(life.resized.size,life.loaded.size);assert.deepEqual(life.builtIn.size,life.loaded.size);
    assert.equal(item.branches,example.variants.length);assert.deepEqual(life.variants.map(v=>v.id),example.variants.map(v=>v.id));
    let generation=life.reloaded.published;
    for(const v of life.variants){
      const declared=example.variants.find(d=>d.id===v.id),branch=receipt.branches.find(b=>b.id===v.id);
      assert.deepEqual(v.options,declared.options);assert.equal(v.status.active,active);assert.equal(v.status.error,null);assert.equal(v.status.pending,0);
      assert.ok(v.status.published>=generation);generation=v.status.published;
      assert.equal(v.header.generationId,generation);assert.equal(v.header.manifestHash,item.manifestHash);
      for(const o of example.manifest.options)assert.equal(v.header.options.find(x=>x.id===o.id)?.value,String(v.options[o.id]??o.default),'W7 runtime option mismatch');
      assert.deepEqual(v.linkedPrograms.slice().sort(),branch.activePrograms.map(p=>p.replace(/^program:/,'')).sort(),'W7 linked closure mismatch');
      assert.equal(v.driver.published,true);assert.equal(v.driver.linked,true);assert.equal(v.driver.framebuffersComplete,true);
      for(const sha of [v.driver.sha256,v.driver.reportHash,v.header.generationSourceFingerprint])assert.match(sha,/^[a-f0-9]{64}$/);
    }
    assert.ok(life.builtIn.published>generation);assert.equal(life.capture.sourceFingerprint,item.sourceFingerprint);assert.equal(life.capture.status.active,active);assert.equal(life.capture.status.error,null);
    assert.deepEqual(life.capture.options,Object.fromEntries(example.manifest.options.map(o=>[o.id,o.default])));
  }
  return record;
}
