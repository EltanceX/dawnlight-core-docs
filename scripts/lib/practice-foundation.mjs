import assert from 'node:assert/strict';
import path from 'node:path';
import {readJson,hash,jsonBytes,zipEntries} from './locked-inputs.mjs';

export function diagnosticEntries(example, fault) {
  const entries=example.entries.map(e=>({...e}));
  const manifest=JSON.parse(entries.find(e=>e.path==='shaderpack.json').bytes);
  for(const change of fault.changes){
    assert.match(change.pointer,/^\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+$/);
    const keys=change.pointer.slice(1).split('/');let target=manifest;
    for(const key of keys.slice(0,-1)){assert.ok(Object.hasOwn(target,key),'Missing diagnostic patch parent');target=target[key];}
    target[keys.at(-1)]=structuredClone(change.value);
  }
  entries.find(e=>e.path==='shaderpack.json').bytes=jsonBytes(manifest);
  return entries;
}
export async function practiceOutputs(context){
  const receipts=await readJson(path.join(context.root,'metadata/w7-diagnostics.json'));
  const spec=await readJson(path.join(context.root,'examples/diagnostics/w7-cases.json'));
  const base=context.examples.find(e=>e.id===spec.baseExample);assert.ok(base);
  assert.equal(receipts.baseSourceFingerprint,base.sourceFingerprint);
  assert.equal(receipts.sourceCommit,context.lock.upstream.commit);
  assert.deepEqual(receipts.cases.map(e=>e.id),spec.cases.map(e=>e.id));
  const outputs=new Map();
  for(const fault of spec.cases){
    const receipt=receipts.cases.find(e=>e.id===fault.id),bytes=zipEntries(diagnosticEntries(base,fault));
    assert.deepEqual(receipt.changes,fault.changes);assert.equal(receipt.archiveSha256,hash(bytes));
    assert.equal(receipt.expectedCode,fault.expectedCode);
    assert.equal(receipt.checks.length,3);
    for(const c of receipt.checks){
      assert.equal(c.exitCode,1);assert.equal(c.archiveExitCode,1);
      assert.equal(c.outputSha256,c.archiveOutputSha256);
      assert.ok(c.diagnostics.some(d=>d.code===fault.expectedCode&&d.file==='shaderpack.json'&&d.pointer.startsWith('/')));
    }
    assert.equal(receipt.repaired.every(c=>c.exitCode===0&&c.diagnostics.length===0),true);
    outputs.set('site/public'+receipt.downloadUrl,bytes);
  }
  outputs.set('site/public/downloads/examples/w7-diagnostics/recipes.json',jsonBytes(spec));
  outputs.set('site/public/downloads/examples/w7-diagnostics/validation.json',jsonBytes(receipts));
  const cases=await readJson(path.join(context.root,'metadata/w7-case-studies.json'));
  assert.equal(cases.sourceCommit,context.lock.upstream.commit);
  assert.deepEqual(cases.cases.map(c=>c.id),['dawnlight','toonlab','makeup']);
  for(const c of cases.cases){assert.equal(c.status,'authored-slice-not-active-runtime-proof');for(const f of c.files)assert.match(f.sha256,/^[a-f0-9]{64}$/);}
  outputs.set('site/public/downloads/examples/w7-case-studies.json',jsonBytes(cases));
  return outputs;
}
