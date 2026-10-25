import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {loadExamples} from './lib/content-foundation.mjs';
import {diagnosticEntries} from './lib/practice-foundation.mjs';
import {ROOT,readJson,writeJson,hash,jsonBytes,zipEntries,defaultToolRoot,verifyTool,run,extractLocked} from './lib/locked-inputs.mjs';
const verify=process.argv.includes('--verify-receipt');assert.ok(process.argv.slice(2).every(a=>a==='--verify-receipt'));
const context=await loadExamples(),spec=await readJson('examples/diagnostics/w7-cases.json'),base=context.examples.find(e=>e.id===spec.baseExample);
const toolRoot=defaultToolRoot(context.lock),tool=await verifyTool(toolRoot,context.lock),exe=path.join(toolRoot,tool.entrypoint);
const temp=await fs.mkdtemp(path.join(os.tmpdir(),'dawnlight-w7-lab-'));
const commands=[['pack',root=>['pack','validate',root,'--format','json']],['graph',root=>['graph','dump',root,'--contract','2','--include-inactive']],['interface',root=>['program','interface',root,'--program','practice:post/grade','--contract','2']]];
async function check(id,args,root,expected){
 const result=run(exe,args,{allowFailure:true}),value=JSON.parse(result.stdout);
 await fs.mkdir('artifacts/w7/diagnostics',{recursive:true});await fs.writeFile('artifacts/w7/diagnostics/'+id+'.json',result.stdout);
 assert.equal(result.status,expected,id);
 const normalized=JSON.parse(JSON.stringify(value).replaceAll(root,'<pack>').replaceAll(root.replaceAll('\\','/'),'<pack>'));
 return {exitCode:result.status,outputSha256:hash(jsonBytes(normalized)),diagnostics:(value.diagnostics??[]).map(d=>({code:d.code,file:d.file??d.provenance?.file,pointer:d.pointer??d.jsonPointer??d.provenance?.pointer,message:d.message}))};
}
try{
 const cases=[];
 for(const fault of spec.cases){
  const entries=diagnosticEntries(base,fault),bytes=zipEntries(entries),archive=path.join(temp,fault.id+'.zip'),root=path.join(temp,fault.id),unpacked=path.join(temp,fault.id+'-zip');
  for(const e of entries){await fs.mkdir(path.dirname(path.join(root,e.path)),{recursive:true});await fs.writeFile(path.join(root,e.path),e.bytes);}
  await fs.writeFile(archive,bytes);await extractLocked(archive,unpacked);
  const checks=[];
  for(const [id,args]of commands){const a=await check(fault.id+'-'+id,args(root),root,1),b=await check(fault.id+'-'+id+'-zip',args(unpacked),unpacked,1);assert.equal(a.outputSha256,b.outputSha256);assert.ok(a.diagnostics.some(d=>d.code===fault.expectedCode));checks.push({id,...a,archiveExitCode:b.exitCode,archiveOutputSha256:b.outputSha256});}
  await fs.writeFile(path.join(root,'shaderpack.json'),base.entries.find(e=>e.path==='shaderpack.json').bytes);
  const repaired=[];for(const [id,args]of commands)repaired.push({id,...await check(fault.id+'-'+id+'-repaired',args(root),root,0)});
  cases.push({...fault,status:'expected-rejected',archiveSha256:hash(bytes),archiveLength:bytes.length,downloadUrl:`/downloads/examples/w7-diagnostics/${fault.id}/${hash(bytes)}/expected-rejected.zip`,checks,repaired});
  console.log(fault.id+' source/ZIP rejected and repaired pack/graph/interface passed');
 }
 const report={schemaVersion:1,baselineId:context.lock.baselineId,sourceCommit:context.lock.upstream.commit,toolInventorySha256:context.lock.tool.distribution.inventory.sha256,baseExample:base.id,baseSourceFingerprint:base.sourceFingerprint,cases};
 if(verify)assert.deepEqual(await readJson('metadata/w7-diagnostics.json'),report);else await writeJson('metadata/w7-diagnostics.json',report);
 await writeJson('artifacts/w7/diagnostics/summary.json',report);
}finally{assert.equal(path.dirname(temp),path.resolve(os.tmpdir()));assert.ok(path.basename(temp).startsWith('dawnlight-w7-lab-'));await fs.rm(temp,{recursive:true,force:true});}
