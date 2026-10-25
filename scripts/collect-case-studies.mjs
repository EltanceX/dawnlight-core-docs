import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {readJson,writeJson,hash} from './lib/locked-inputs.mjs';
const args=process.argv.slice(2),index=args.indexOf('--source-root');
assert.ok(index>=0&&args[index+1], 'Pass --source-root <public-upstream-checkout> [--verify-receipt]');
assert.ok(args.filter((_,i)=>i!==index&&i!==index+1).every(a=>a==='--verify-receipt'));
const lock=await readJson('upstream.lock.json'),repo=args[index+1];
assert.equal(execFileSync('git',['-C',repo,'rev-parse',lock.upstream.commit+'^{commit}'],{encoding:'utf8'}).trim(),lock.upstream.commit);
const specs=[
 {id:'dawnlight',root:'Survivalcraft/shaderpacks/Dawnlight_v3.1',files:['manifest/passes/composites.json','manifest/passes/output.json']},
 {id:'toonlab',root:'Survivalcraft/shaderpack-candidates/ToonLab_v0.1_v4',files:['manifest/passes/output.json','manifest/passes/toon-ambient-occlusion.json']},
 {id:'makeup',root:'Survivalcraft/shaderpack-candidates/MakeUpUltraFast_SC_v0.21',files:['manifest/passes/taa.json','manifest/passes/bloom.json','manifest/resources/taa.json']}
];
const cases=[];
for(const s of specs){
 const files=[];let root;
 for(const p of ['shaderpack.json',...s.files]){
  const sourcePath=s.root+'/'+p,bytes=execFileSync('git',['-C',repo,'show',lock.upstream.commit+':'+sourcePath]);
  const doc=JSON.parse(bytes);if(p==='shaderpack.json')root=doc;
  files.push({path:p,sourcePath,length:bytes.length,sha256:hash(bytes),sourceUrl:`${lock.upstream.publicRepositoryUrl}/src/commit/${lock.upstream.commit}/${sourcePath}`,passes:(doc.passes??[]).map(x=>({id:x.id,enabledWhen:x.enabledWhen??[],stage:x.stage,inputs:x.inputs??[],outputs:x.outputs??[],commands:(x.commands??[]).map(c=>({type:c.type,...c.program?{program:c.program}:{},...c.resource?{resource:c.resource}:{}}))})),resources:(doc.resources??[]).map(({id,kind,lifetime,format,size,history})=>({id,kind,lifetime,format,size,history}))});
 }
 cases.push({id:s.id,sourceRoot:s.root,manifestVersion:root.manifestVersion,sceneAbiVersion:root.sceneAbiVersion??null,status:'authored-slice-not-active-runtime-proof',files});
 console.log(s.id,JSON.stringify(files.map(f=>({path:f.path,passes:f.passes.map(p=>p.id),resources:f.resources.map(r=>r.id)}))));
}
const record={schemaVersion:1,baselineId:lock.baselineId,sourceCommit:lock.upstream.commit,projection:'selected-authored-pass-resource-relationships',cases};
if(args.includes('--verify-receipt'))assert.deepEqual(JSON.parse(JSON.stringify(record)),await readJson('metadata/w7-case-studies.json'),'Case projection changed');
else await writeJson('metadata/w7-case-studies.json',record);
