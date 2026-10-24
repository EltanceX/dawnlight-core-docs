import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {invoke,settled,statusCode} from './runtime-course-check.mjs';
import {loadExamples} from './lib/content-foundation.mjs';
import {unzipEntries,writeJson} from './lib/locked-inputs.mjs';
const context=await loadExamples();
const out=path.resolve('artifacts/w6/runtime');await fs.mkdir(out,{recursive:true});
for(const e of context.examples.filter(e=>e.validationStage==='w6')){
 const id=e.id.split('/')[1],root=path.resolve('.cache/w4-runtime-pinned/shaderpacks/'+id);
 for(const f of unzipEntries(e.archiveBytes)){await fs.mkdir(path.dirname(path.join(root,f.path)),{recursive:true});await fs.writeFile(path.join(root,f.path),f.bytes);}
 const switchTo=async()=>invoke(`return String(Dawnlight.ShaderPackSwitchCoordinator.RequestSwitchDetailed(Dawnlight.DawnlightShaderSourceSelection.External(${JSON.stringify(id)}),null).RequestId);`);
 const before=await invoke(statusCode);await switchTo();let loaded=await settled('External:'+id,before.published);
 // Saved options survive extraction; reset them before recording the default load.
 for(const o of e.manifest.options){
  const b=await invoke(statusCode);
  const changed=await invoke(`return Dawnlight.ShaderPackSwitchCoordinator.RequestActiveOptionChange(Dawnlight.ShaderPackOptionId.Parse(${JSON.stringify(o.id)}),Dawnlight.ShaderPackOptionValue.${o.type==='boolean'?'Boolean':'Number'}(${JSON.stringify(o.default)}));`);
  if(changed)loaded=await settled('External:'+id,b.published);
 }
 await switchTo();const reloaded=await settled('External:'+id,loaded.published);
 const size=before.size.x===1024?{x:1280,y:720}:{x:1024,y:640};
 await invoke(`Engine.Window.Size=new Engine.Point2(${size.x},${size.y});return true;`);await new Promise(r=>setTimeout(r,800));const resized=await invoke(statusCode);assert.deepEqual(resized.size,size);assert.equal(resized.error,null);
 await invoke(`Engine.Window.Size=new Engine.Point2(${before.size.x},${before.size.y});return true;`);await new Promise(r=>setTimeout(r,500));
 const variants=[];
 for(const v of e.variants){
  for(const o of e.manifest.options){
   const val=v.options[o.id]??o.default,b=await invoke(statusCode);
   const changed=await invoke(`return Dawnlight.ShaderPackSwitchCoordinator.RequestActiveOptionChange(Dawnlight.ShaderPackOptionId.Parse(${JSON.stringify(o.id)}),Dawnlight.ShaderPackOptionValue.${o.type==='boolean'?'Boolean':'Number'}(${JSON.stringify(val)}));`);
   if(changed)await settled('External:'+id,b.published);
  }
  const status=await invoke(statusCode);assert.equal(status.error,null);
  const filename=path.join(out,id+'-'+v.id+'-driver.json');
  await invoke(`return Dawnlight.ShaderPackSwitchCoordinator.ExportActiveDriverReport(${JSON.stringify(filename.replaceAll('\\','/'))});`);
  const driver=JSON.parse(await fs.readFile(filename));assert.ok(driver.programs.every(p=>p.linked));assert.ok(driver.framebuffers.every(f=>f.complete));
  let dataFile=null;if(e.manifest.customData){const p=await invoke('return Dawnlight.ShaderPackSwitchCoordinator.ExportActiveDataDriverReport();');dataFile=path.join(out,id+'-'+v.id+'-data-driver.json');await fs.copyFile(p,dataFile);}
  variants.push({id:v.id,options:v.options,status,driverFile:path.basename(filename),dataFile:dataFile&&path.basename(dataFile),header:driver.header,linkedPrograms:driver.programs.map(p=>p.programId),framebuffersComplete:true});
 }
 await invoke('return String(Dawnlight.ShaderPackSwitchCoordinator.RequestSwitchDetailed(Dawnlight.DawnlightShaderSourceSelection.BuiltIn,null).RequestId);');
 const builtIn=await settled('BuiltIn',variants.at(-1).status.published);
 const result={id:e.id,sourceFingerprint:e.sourceFingerprint,archiveSha256:e.archiveSha256,status:'passed',loaded,reloaded,resized,builtIn,variants,checkedAt:new Date().toISOString()};await writeJson(path.join(out,id+'-lifecycle.json'),result);console.log(id+' runtime passed');
}
