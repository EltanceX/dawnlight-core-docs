import fs from 'node:fs/promises';
import { stringify } from 'yaml';
import { inside, jsonBytes } from './locked-inputs.mjs';

const json = value => '```json\n'+JSON.stringify(value,null,2)+'\n```\n';
const cell = text => String(text??'—').replaceAll('|','&#124;').replaceAll('<','&lt;').replaceAll('\n',' ');
const code = value => '`'+cell(typeof value==='string'?value:JSON.stringify(value)).replaceAll('`','&#96;')+'`';
function table(headers,rows){return '| '+headers.join(' | ')+' |\n| '+headers.map(()=> '---').join(' | ')+' |\n'+rows.map(row=>'| '+row.map(cell).join(' | ')+' |').join('\n')+'\n\n';}
function facts(field){
  const result=[];
  for(const key of ['$ref','type','const','enum','default','minimum','maximum','minLength','maxLength','pattern','minItems','maxItems','uniqueItems'])if(Object.hasOwn(field,key))result.push(`${key}=${JSON.stringify(field[key])}`);
  for(const key of ['oneOf','anyOf','allOf'])if(field[key])result.push(`${key}: ${field[key].length}`);
  if(field.items?.$ref)result.push(`items=${field.items.$ref}`);
  if(field.additionalProperties!==undefined)result.push(`additionalProperties=${JSON.stringify(field.additionalProperties)}`);
  return result.length?code(result.join('; ')):'—';
}
function shapeRows(node,prefix='',rows=[]){
  if(!node||typeof node!=='object')return rows;
  for(const[name,field]of Object.entries(node.properties??{})){
    const label=prefix+name;
    rows.push([code(label),(node.required??[]).includes(name)?'required':'optional here',facts(field)]);
    if(field.properties)shapeRows(field,label+'.',rows);
    if(field.items)shapeRows(field.items,label+'[].',rows);
  }
  for(const keyword of ['oneOf','anyOf'])for(const[branch,child]of(node[keyword]??[]).entries())shapeRows(child,`${prefix}${keyword}[${branch}].`,rows);
  return rows;
}
function definitions(ref,ids,version,en){
  const defs=ref.inputs.get(`schema-v${version}`).value.$defs;
  return ids.filter(id=>defs[id]).map(id=>{
    const value=defs[id],rows=shapeRows(value);
    return `### ${id} · v${version} {#v${version}-${id.toLowerCase()}}\n\n`+
      (rows.length?table(en?['Field / branch','Presence in this object','Structural constraints']:['字段 / 分支','本对象必需性','结构约束'],rows):facts(value)+'\n\n')+
      `<details>\n<summary>${en?'Full structural rule':'完整结构规则'}: #/$defs/${id}</summary>\n\n`+json(value)+'\n</details>\n\n';
  }).join('');
}
function catalog(ref,en){
  const c=ref.inputs.get('catalog').value,d=ref.inputs.get('completion-v2').value.dataAbiCatalog;
  const collections=['stageTemplates','services','semantics','engineDrawProviders','capabilities','resourceFormats','sceneCategories','sceneDrawProviders','sceneVertexAbis','sceneSystemBindings','sceneFallbacks'];
  let out='### Catalog identity {#catalog-identity}\n\n'+table(['Field','Value'],['contractVersion','host','supportedFormats','hash','sceneAbiHash','limits'].map(key=>[code(key),code(c[key])]));
  for(const key of collections){
    out+=`### ${key} {#catalog-${key.toLowerCase()}}\n\n`;
    out+=table(en?['ID / version','Published metadata']:['ID / 版本','发布的元数据'],c[key].map(entry=>[code((entry.id??entry.category?.id)+'@'+(entry.version??entry.category?.version)),code(Object.fromEntries(Object.entries(entry).filter(([key])=>!['id','version'].includes(key))))]));
  }
  out+=`### Data ABI inputs {#data-inputs}\n\n`+table(en?['Input','Type / frequency','Unit / space','Availability / missing policy']:['输入','类型 / 频率','单位 / 空间','可用性 / 缺失策略'],d.inputs.map(input=>[code(input.id+'@'+input.version),code(input.type+' / '+input.frequency),code([input.unit,input.space,input.sourceSpace&&input.sourceSpace+' → '+input.targetSpace].filter(Boolean).join('; ')),code(input.availability+' / '+input.missingPolicy)]));
  out+='### Data ABI functions {#data-functions}\n\n'+table(['Function','arity'],d.functions.map(fn=>[code(fn.name),fn.arity]));
  out+='### Data ABI limits {#data-limits}\n\n'+table(['Limit','Value'],Object.entries(d.limits));
  out+='### Closed tokens {#closed-tokens}\n\n'+table(['Token set','Values'],Object.entries(ref.inputs.get('completion-v2').value.closedTokens).map(([key,value])=>[code(key),code(value)]));
  return out;
}
export async function referenceOutputs(context,ref,pageRegistry){
  const outputs=new Map(),put=(name,value)=>outputs.set(name,Buffer.isBuffer(value)?value:Buffer.from(value));
  for(const input of ref.inputs.values())put('site/public/downloads/reference/'+input.path.split('/').pop(),input.bytes);
  put('site/public/downloads/reference/coverage.json',jsonBytes({schemaVersion:1,baselineId:context.lock.baselineId,sourceCommit:context.lock.upstream.commit,definitionOwners:Object.fromEntries(ref.owners),entries:ref.coverage,featureCoverage:ref.featureCoverage,coverageHash:ref.coverageHash}));
  const publicExamples=ref.examples.map(({entries,archiveBytes,...record})=>record);
  put('site/public/downloads/reference/examples.json',jsonBytes({schemaVersion:1,sourceCommit:context.lock.upstream.commit,examples:publicExamples}));
  for(const example of ref.examples.filter(example=>example.sourceType==='website-authored')) {
    const base='site/public/downloads/reference/'+example.id+'/'+example.sourceFingerprint;
    put(base+'/uniform-buffer.zip',example.archiveBytes);
    for(const file of example.entries)put(base+'/files/'+file.path,file.bytes);
  }
  for(const page of ref.pages)for(const language of ['zh-CN','en-US']){
    const en=language==='en-US',prefix=en?'/en':'',locale=en?'en':'zh';
    const record=pageRegistry.pages.find(record=>record.path===`reference/${page.id==='index'?'index':page.id}.md`);
    const title=page.titles[language];
    const fm={title,description:page.descriptions[language],lang:language,editLink:false,dawnlight:{publication:'published',baseline:context.lock.baselineId,manifestVersions:record.manifestVersions,sceneAbiVersions:record.sceneAbiVersions,sourceRefs:record.sourceRefs}};
    let content='---\n'+stringify(fm,{lineWidth:0})+'---\n\n<!-- Generated from reference/; edit reference/prose and the generator. -->\n\n<div class="reference-content">\n\n'+`# ${title} {#reference}\n\n<BaselineNote />\n\n`;
    content+=await fs.readFile(inside(ref.root,`reference/prose/${locale}/${page.id}.md`),'utf8');
    content+='\n\n';
    if(ref.groups[page.id]){
      content+=`## ${en?'Generated v5 structure':'自动生成的 v5 结构'} {#structure}\n\n`;
      content+=en?'Required applies to the displayed object/branch. Absence of a Schema default does not establish a runtime default. Conditional rules remain in the complete definition below; Loader validation also resolves IDs, ownership, budgets and device limits.\n\n':'必需性只针对所展示的对象/分支。Schema 没写 default 不表示运行时没有默认值。完整定义保留条件规则；Loader 另行解析 ID、所有权、预算及设备约束。\n\n';
      content+=definitions(ref,ref.groups[page.id],5,en);
    }
    if(page.id==='manifest-versions')for(const version of [3,4])content+=`## Manifest v${version} {#version-${version}}\n\n`+definitions(ref,[...ref.owners.keys()],version,en);
    if(page.id==='settings-ui')for(const[object,names]of Object.entries(ref.ui.objects))content+=`### ${object} {#ui-${object.toLowerCase()}}\n\n`+table(en?['Field','Ownership']:['字段','归属'],names.map(name=>[code(name),en?'Reviewed Loader whitelist; behavior above':'已复核 Loader 白名单；行为见上文']));
    if(page.id==='catalog')content+=catalog(ref,en);
    if(page.id==='diagnostics')content+=`## ${en?'Generated diagnostic catalog':'自动生成的诊断目录'} {#diagnostic-catalog}\n\n`+ref.inputs.get('diagnostics').value.replaceAll('(#structured-diagnostic-shape)',`(${prefix}/reference/diagnostics#structured-diagnostic-shape)`);
    if(page.id==='examples') {
      content+=`## ${en?'Feature-to-example index':'功能与完整示例对应'} {#feature-examples}\n\n`;
      for(const [kind,values]of Object.entries(ref.featureCoverage))content+=`### ${kind} {#feature-${kind.toLowerCase()}}\n\n`+table(en?['Value','Registered examples and evidence']:['值','登记示例与证据'],Object.entries(values).map(([value,entries])=>[code(value),entries.map(entry=>`[${entry.id}](#${entry.id.split('/')[1]}) (${entry.status})`).join('; ')]));
    }
    if(page.id==='examples')for(const example of ref.examples){
      const local=example.sourceType==='website-authored',base='/downloads/reference/'+example.id+'/'+example.sourceFingerprint;
      content+=`## ${example.directory} {#${example.id.split('/')[1]}}\n\n[${local?(en?'Website-owned negative fixture':'网站自有完整反例'):(en?'Complete upstream source':'完整上游源码')}](${example.sourceUrl}) · Manifest v${example.manifestVersion} · ${local?(en?'Expected rejection; not a working preset':'预期拒绝；不是可用预设'):(en?'Static checks passed; game behavior not observed here':'静态检查通过；本记录未实机观察')}\n\n`;
      if(local) {
        content+=`[${en?'Download complete negative fixture':'下载完整反例 ZIP'}](${base}/uniform-buffer.zip) · <a href="${base}/files/README.md" download>README.md</a>\n\n`+code(example.archiveSha256)+'\n\n';
        content+=en?'pack validate accepts the structure; scene/graph/interface reject materialTable as UBO with DLMAT1002. Every table consumer must be a readOnly storageBuffer. An additional valid SSBO binding does not legalize the UBO. Source and fresh-ZIP checks retain the same rejection. This supplies no positive UBO runtime example.\n\n':'pack validate 接受结构；scene/graph/interface 以 DLMAT1002 拒绝将 materialTable 作为 UBO。表的每个消费者都必须是 readOnly storageBuffer；额外合法 SSBO 不会使 UBO 合法。源码和全新 ZIP 核对同一拒绝，本记录不提供 UBO 正向运行示例。\n\n';
        for(const file of example.entries.filter(file=>!file.path.endsWith('.md')))content+=`<details>\n<summary>${file.path}</summary>\n\n<a href="${base}/files/${file.path}" download>${en?'Download file':'下载文件'}</a>\n\n`+'```'+(file.path.endsWith('.json')?'json':'glsl')+'\n'+file.bytes.toString('utf8')+'```\n\n</details>\n\n';
      }
      content+=table(['Feature','Values'],Object.entries(example.features).map(([key,value])=>[code(key),code(value)]));
      const diagnostics=example.checks.flatMap(check=>check.diagnostics??[]);
      if(diagnostics.length)content+='\n'+json({diagnostics})+'\n';
      content+=`<details>\n<summary>${en?'Complete source file inventory':'完整源文件清单'} (${example.files.length})</summary>\n\n`+table(['File','Bytes','SHA-256'],example.files.map(file=>[local?code(file.path):`[${file.path}](${context.lock.upstream.publicRepositoryUrl}/src/commit/${context.lock.upstream.commit}/${file.sourcePath})`,file.length,code(file.sha256)]))+'</details>\n\n';
    }
    content+=`## ${en?'Complete examples':'完整示例'} {#examples}\n\n`;
    for(const id of page.examples){
      const course=context.examples.find(example=>example.id===id);
      content+=course?`- [${course.titles[language]}](${prefix}/${course.page.replace(/\.md$/,'')})\n`:`- [${id}](${prefix}/reference/examples#${id.split('/')[1]})\n`;
    }
    content+=`\n## ${en?'Sources and machine records':'来源与机器记录'} {#sources}\n\n[${en?'Coverage inventory':'字段归属清单'}](/downloads/reference/coverage.json) · [Schema v5](/downloads/reference/schema-v5.json) · [Catalog v2](/downloads/reference/catalog.json) · [Completion v2](/downloads/reference/completion-v2.json)\n\n`;
    for(const input of ref.inputs.values())if(input.url)content+=`[${input.id}](${input.url}) · `;
    const loaderRoot='Survivalcraft/Dawnlight/PipeLine/Shaders/Configuration/Loading/';
    const loader=page.id==='settings-ui'?'ShaderPackSettingsUiLoader.cs':['materials','custom-data'].includes(page.id)?'ShaderPackManifestDataLoader.cs':'ShaderPackManifestLoader.cs';
    content+=`\n\n[${loader}](${context.lock.upstream.publicRepositoryUrl}/src/commit/${context.lock.upstream.commit}/${loaderRoot}${loader})`;
    if(page.id==='manifest')content+=` · [ShaderPackManifestComposer.cs](${context.lock.upstream.publicRepositoryUrl}/src/commit/${context.lock.upstream.commit}/${loaderRoot}ShaderPackManifestComposer.cs)`;
    if(page.id==='materials'||page.id==='bindings')content+=` · [MaterialTableShaderContract.cs](${context.lock.upstream.publicRepositoryUrl}/src/commit/${context.lock.upstream.commit}/Survivalcraft/Dawnlight/PipeLine/Shaders/Configuration/Runtime/Data/MaterialTableShaderContract.cs)`;
    content+='\n\n</div>\n';
    put(`site/${en?'en/':''}reference/${page.id}.md`,content);
  }
  return outputs;
}
