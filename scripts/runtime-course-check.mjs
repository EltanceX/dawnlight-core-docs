// Local-only bridge to the isolated game's existing init.js frame hook.
// The bridge and copied game binaries stay in ignored .cache; no user runtime is edited.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const runtime = path.resolve('.cache/w4-runtime-pinned');
const output = path.resolve('artifacts/w4/lifecycle');
await fs.mkdir(output, { recursive: true });
let sequence = 0;
async function invoke(code) {
  const tag = `${Date.now()}-${sequence++}`;
  const command = `var Dawnlight=importNamespace('Dawnlight');\nvar value=(function(){${code}})();\nJSON.stringify({tag:${JSON.stringify(tag)},value:value});\n`;
  for (let retry=0;;retry++) {
    try { await fs.writeFile(path.join(runtime, 'w4-command.js'), command); break; }
    catch(error) { if(error.code!=='EBUSY'||retry>=20)throw error; await new Promise(resolve=>setTimeout(resolve,50)); }
  }
  const until = Date.now()+15000;
  while (Date.now()<until) {
    await new Promise(resolve=>setTimeout(resolve,250));
    let text; try { text=await fs.readFile(path.join(runtime,'w4-result.txt'),'utf8'); } catch { continue; }
    if (text.includes(tag)) return JSON.parse(text.replace(/^\uFEFF/, '')).value;
    if (text.startsWith('Error:')||text.startsWith('TypeError:')||text.startsWith('ReferenceError:')) throw Error(text);
  }
  throw Error('Game frame hook did not answer');
}
const statusCode=`return {active:String(Dawnlight.ShaderPackSwitchCoordinator.ActiveDescriptor.SourceSelection),published:Dawnlight.ShaderPackSwitchCoordinator.PublishedGenerationCount,pending:Dawnlight.ShaderPackSwitchCoordinator.PendingCount,error:Dawnlight.ShaderPackSwitchCoordinator.LastError?String(Dawnlight.ShaderPackSwitchCoordinator.LastError):null,size:{x:Engine.Window.Size.X,y:Engine.Window.Size.Y}};`;
async function settled(active,before) {
  const until=Date.now()+15000;
  while(Date.now()<until){
    const value=await invoke(statusCode);
    assert.equal(value.error,null);
    if(value.pending===0&&value.active===active&&value.published>before)return value;
    await new Promise(r=>setTimeout(r,300));
  }
  throw Error(`No published generation for ${active}`);
}
export { invoke, settled, statusCode };
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve('scripts/runtime-course-check.mjs')) {
const ids=process.argv.slice(2);
assert.ok(ids.length&&ids.every(id=>/^(?:00-starter|01-first-post|02-resources|03-scene|04-mrt)$/.test(id)),'Pass one or more registered chapter directory IDs');
for(const id of ids){
  const before=await invoke(statusCode);
  await invoke(`return String(Dawnlight.ShaderPackSwitchCoordinator.RequestSwitchDetailed(Dawnlight.DawnlightShaderSourceSelection.External(${JSON.stringify(id)}),null).RequestId);`);
  const loaded=await settled('External:'+id,before.published);
  await invoke(`return String(Dawnlight.ShaderPackSwitchCoordinator.RequestSwitchDetailed(Dawnlight.DawnlightShaderSourceSelection.External(${JSON.stringify(id)}),null).RequestId);`);
  const reloaded=await settled('External:'+id,loaded.published);
  const targetSize=before.size.x===1024?{x:1280,y:720}:{x:1024,y:640};
  await invoke(`Engine.Window.Size=new Engine.Point2(${targetSize.x},${targetSize.y}); return "requested";`);
  await new Promise(r=>setTimeout(r,1000));
  const resized=await invoke(statusCode);
  assert.deepEqual(resized.size,targetSize);
  assert.equal(resized.error,null);
  assert.equal(resized.active,'External:'+id);
  await invoke(`Engine.Window.Size=new Engine.Point2(${before.size.x},${before.size.y}); return "restored";`);
  await new Promise(r=>setTimeout(r,500));
  const reportPath=path.resolve(`artifacts/w4/${id}-driver.json`).replaceAll('\\','/');
  await invoke(`return Dawnlight.ShaderPackSwitchCoordinator.ExportActiveDriverReport(${JSON.stringify(reportPath)});`);
  const driver=JSON.parse(await fs.readFile(reportPath));
  assert.equal(driver.published,true);
  assert.equal(driver.evidence,'driverObserved');
  assert.ok(driver.programs.length&&driver.programs.every(program=>program.linked));
  await invoke('return String(Dawnlight.ShaderPackSwitchCoordinator.RequestSwitchDetailed(Dawnlight.DawnlightShaderSourceSelection.BuiltIn,null).RequestId);');
  const builtIn=await settled('BuiltIn',reloaded.published);
  const result={id,status:'passed',loaded,reloaded,resized,builtIn,driver:{manifestHash:driver.header.manifestHash,generationId:driver.header.generationId,programs:driver.programs.length,linked:true},checkedAt:new Date().toISOString()};
  await fs.writeFile(path.join(output,id+'.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result));
}
}
