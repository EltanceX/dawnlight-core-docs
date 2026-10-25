import { stringify } from 'yaml';
import { jsonBytes, hash } from './locked-inputs.mjs';

function pageHeader(record, title, description, language, context, example) {
  return '---\n' + stringify({
    title, description, lang: language, editLink: false,
    dawnlight: {
      publication: record.publication, baseline: context.lock.baselineId,
      manifestVersions: [5], sceneAbiVersions: [2], sourceRefs: record.sourceRefs,
      ...(example ? { example: example.id, verification: { static: 'passed', ...example.runtimeEvidence } } : {})
    }
  }, { lineWidth: 0 }) + '---\n\n';
}
const fence = snippet => '```' + snippet.language + ' [' + snippet.file + ']\n' + snippet.code + '```\n';

function detailPage(example, entry, language, context, record) {
  if (example.id !== 'course/00-starter') return courseDetailPage(example, entry, language, context, record);
  const en = language === 'en-US';
  const title = example.titles[language];
  const prefix = en ? '/en' : '';
  const selected = id => example.snippets.find(snippet => snippet.id === id);
  const sourceUrl = `${context.lock.website.repositoryUrl}/blob/${context.lock.website.defaultBranch}/${example.root}`;
  const prose = en ? {
    description: 'Download the complete v5 external starter, inspect its source and check exactly which static tests passed.',
    intro: 'This independent external pack is the starting source for the course. It declares four Terrain fallback routes, two persistent textures, a frame target and one pack-owned present Program. It has no optional effect or configuration branch.',
    warning: 'Static checks passed. Runtime observations are recorded separately in the course, tied to the tested host and exact source identity. Follow chapter 00 for loading instructions.',
    download: 'Download and identity', zip: 'Download starter ZIP', inventory: 'Source inventory and snippet map', validation: 'Static validation receipt',
    extract: 'Extract into a new directory. The archive root contains `shaderpack.json`, `README.md` and `shaders/`; another course chapter is not required. This is an external pack with two textures, so it does not have the zero-extension resource footprint of BuiltIn Minimal.',
    files: 'Source files', source: 'Website source', file: 'File', bytes: 'Bytes', frame: 'Own the frame target',
    frameText: 'This is the value of `/frameTarget`, extracted from the complete manifest. The frame begins with a cleared color/depth topology. The opaque Terrain command also clears depth as required by this Scene ABI; Terrain colors load the existing frame color. This configuration describes ownership; it does not establish that all world renderers behave correctly in-game.',
    routes: 'Explicit Terrain routes', routeText: 'Every category uses `builtin`. Each also has one declaration-only `engineDraw` command in the full manifest. Dawnlight materializes its category-specific fallback Program; the pack does not copy the built-in shader sources.',
    shaders: 'Pack-owned shaders', shaderText: 'The vertex shader generates a fullscreen quad from `gl_VertexID`. The fragment shader samples scene color without an extra color transform. These files belong to the pack source owner.',
    full: 'Complete manifest', verify: 'What was checked', verifyText: 'The pinned Analyzer ran the following commands on both the source directory and a freshly extracted ZIP. File hashes, canonical manifest hashes and normalized Analyzer outputs match. The receipt binds the source fingerprint, archive SHA-256 and tool inventory SHA-256.',
    boundary: 'Runtime checks still required', boundaryText: 'The static receipt below supplies no runtime evidence. Chapter 00 and the runtime record add dated driver reports, screenshots and lifecycle observations. Complete category coverage, device reset and other platforms remain unverified. A resolved route alone is not evidence of a rendered image.',
    next: 'Read the Analyzer evidence boundaries', hash: 'Archive SHA-256', fingerprint: 'Source fingerprint', identity: 'The source fingerprint covers the baseline, example ID and exact file bytes. It is distinct from the Loader canonical manifest hash and the ZIP hash.'
  } : {
    description: '下载完整 v5 外置起步包，查看同源代码，并核对静态验证与实机证据的边界。',
    intro: '这是课程的独立外置起步包：显式声明四类 Terrain fallback 路由、两张 persistent 纹理、整帧目标和一个包自有 present Program。当前没有可选效果或配置分支。',
    warning: '静态检查已通过。课程另行记录绑定测试宿主与精确源码身份的运行观察；加载步骤从第 00 章开始。',
    download: '下载与身份', zip: '下载起步包 ZIP', inventory: '源码清单与片段映射', validation: '静态验证收据',
    extract: '解压到新目录，根目录直接包含 `shaderpack.json`、`README.md` 和 `shaders/`，不依赖上一章文件。本包是分配两张纹理的外置包，不能当作零扩展资源的 BuiltIn Minimal。',
    files: '源码文件', source: '网站源码', file: '文件', bytes: '字节', frame: '明确整帧目标',
    frameText: '以下是从完整 Manifest 提取的 `/frameTarget` 值。帧开始时清理颜色与深度附件；Terrain opaque 命令按当前 Scene ABI 再清理深度，Terrain 颜色加载已有帧颜色。这里描述目标归属，不代表已经证明所有世界渲染器在实机中表现正确。',
    routes: '显式 Terrain 路由', routeText: '四类路由都使用 `builtin`，完整 Manifest 中还为每一类声明一条不指定 Program 的 `engineDraw` 命令。Dawnlight 为其生成对应 fallback Program；本包不复制内置着色器源码。',
    shaders: '本包自有着色器', shaderText: '顶点着色器从 `gl_VertexID` 生成全屏四边形；片元着色器采样场景颜色，不额外改变颜色空间。这两个文件的 source owner 属于本包。',
    full: '完整 Manifest', verify: '已经检查什么', verifyText: '固定 Analyzer 对源码目录和新解压 ZIP 分别运行以下命令。文件哈希、canonical manifest hash 和归一化 Analyzer 输出一致。收据绑定源码指纹、ZIP SHA-256 与工具清单 SHA-256。',
    boundary: '仍需完成的实机检查', boundaryText: '下述静态收据不提供运行证据。第 00 章与实机记录另行增加按日期记录的驱动报告、画面和生命周期观察；完整类别覆盖、device reset 与其他平台仍未验证。单纯路由解析成功不能替代画面证据。',
    next: '阅读 Analyzer 的证据边界', hash: '压缩包 SHA-256', fingerprint: '源码指纹', identity: '源码指纹覆盖基线、示例 ID 与精确文件字节；它和 Loader canonical manifest hash、ZIP 哈希分别表示不同身份。'
  };
  const commandBlock = '```powershell\nshaderpack-analyzer.exe pack validate . --format json\nshaderpack-analyzer.exe scene explain . --include-inactive --format json\nshaderpack-analyzer.exe graph dump . --contract 2 --include-inactive\nshaderpack-analyzer.exe program interface . --program course:post/present --contract 2\n```\n';
  return pageHeader(record, title, prose.description, language, context, example) +
    `<!-- Generated from ${example.root}; edit the example or generator, not this file. -->\n\n# ${title} {#external-starter}\n\n<BaselineNote />\n\n${prose.intro}\n\n::: warning ${en ? 'Static evidence only' : '当前仅有静态证据'}\n${prose.warning}\n:::\n\n` +
    `[${en ? 'Open chapter 00: load the pack' : '进入第 00 章：加载起步包'}](${prefix}/tutorial/00-starter)\n\n` +
    `## ${prose.download} {#download}\n\n<a href="${entry.downloadUrl}" download="starter.zip">${prose.zip}</a> · <a href="${entry.inventoryUrl}" download>${prose.inventory}</a> · <a href="${entry.validationUrl}" download>${prose.validation}</a>\n\n${prose.extract}\n\n${prose.hash}:\n\n<div class="download-hash"><code>${entry.archiveSha256}</code></div>\n\n${prose.fingerprint}:\n\n<div class="download-hash"><code>${entry.sourceFingerprint}</code></div>\n\n${prose.identity}\n\n` +
    `## ${prose.files} {#source-files}\n\n[${prose.source}](${sourceUrl}) · Manifest v5 / Scene ABI v2 · <code>${context.lock.tool.distribution.id}</code>\n\n| ${prose.file} | ${prose.bytes} | SHA-256 |\n| --- | ---: | --- |\n` +
    example.inventory.map(file => `| <a href="${entry.sourceBaseUrl}/${file.path}" download>${file.path}</a> | ${file.length} | <code>${file.sha256.slice(0, 12)}…</code> |`).join('\n') + '\n\n' +
    `## ${prose.frame} {#frame-target}\n\n${prose.frameText}\n\n` + fence(selected('frame-target')) + '\n' +
    `## ${prose.routes} {#terrain-routes}\n\n${prose.routeText}\n\n` + fence(selected('routes')) + '\n' +
    `## ${prose.shaders} {#shader-sources}\n\n${prose.shaderText}\n\n::: code-group\n\n` + fence(selected('fullscreen')) + '\n' + fence(selected('present')) + '\n:::\n\n' +
    `## ${prose.full} {#complete-manifest}\n\n<details>\n<summary>shaderpack.json</summary>\n\n` + fence(selected('manifest')) + '\n</details>\n\n' +
    `## ${prose.verify} {#static-validation}\n\n${prose.verifyText}\n\n` + commandBlock + '\n' +
    `## ${prose.boundary} {#runtime-boundaries}\n\n${prose.boundaryText}\n\n<code>driverStatus=notProvided</code> · <code>runtimeEvaluated=false</code> · <code>liveWorldVerified=false</code> · <code>visual=notRun</code>\n\n[${prose.next}](${prefix}/tools/analyzer)\n`;
}

function courseDetailPage(example, entry, language, context, record) {
  const en = language === 'en-US', prefix = en ? '/en' : '';
  const title = example.titles[language];
  const chapter = example.id.split('/')[1];
  const readingPath = example.validationStage === 'w7' ? '/recipes/' + chapter : '/tutorial/' + chapter;
  return pageHeader(record, title, en ? 'Complete independent course source, immutable download and static validation receipt.' : '完整独立章节源码、不可变下载和静态验证收据。', language, context, example) +
    `<!-- Generated from ${example.root}; edit the example or generator, not this file. -->\n\n# ${title} {#course-snapshot}\n\n<BaselineNote />\n\n` +
    `[${en ? 'Read this chapter' : '阅读对应章节'}](${prefix}${readingPath})\n\n` +
    (en ? 'This ZIP contains every required file; no earlier chapter is needed. Extract it as a direct child of the game’s `shaderpacks` directory. Static receipts and actual game observations have separate evidence scopes.\n\n' : '本 ZIP 包含全部所需文件，不依赖前一章。解压为游戏 `shaderpacks` 目录的直接子目录。静态收据与实机观察分别记录。\n\n') +
    `## ${en ? 'Download and identity' : '下载与身份'} {#download}\n\n<a href="${entry.downloadUrl}" download="${chapter}.zip">${en ? 'Download chapter ZIP' : '下载本章 ZIP'}</a> · <a href="${entry.inventoryUrl}" download>${en ? 'Source inventory' : '源码清单'}</a> · <a href="${entry.validationUrl}" download>${en ? 'Static receipt' : '静态收据'}</a>\n\nZIP SHA-256:\n\n<div class="download-hash"><code>${entry.archiveSha256}</code></div>\n\n${en ? 'Source fingerprint' : '源码指纹'}:\n\n<div class="download-hash"><code>${entry.sourceFingerprint}</code></div>\n\n` +
    `## ${en ? 'Complete source' : '完整源码'} {#source-files}\n\n` +
    example.entries.map(file => `<details>\n<summary>${file.path}</summary>\n\n<a href="${entry.sourceBaseUrl}/${file.path}" download>${en ? 'Download file' : '下载文件'}</a>\n\n` + fence({ file: file.path, language: file.path.endsWith('.json') ? 'json' : file.path.endsWith('.md') ? 'md' : 'glsl', code: file.bytes.toString('utf8') }) + '\n</details>\n').join('\n') +
    `\n## ${en ? 'Validation scope' : '验证范围'} {#static-validation}\n\n` +
    (en ? 'Pinned Analyzer checks passed for the source and a newly extracted archive: pack, scene, graph and every declared Program interface. Their normalized output hashes agree. This receipt supplies no driver report or live-world claim. See the linked chapter for dated runtime observations and limitations.\n' : '固定 Analyzer 对源码和新解压 ZIP 执行 pack、scene、graph 和全部 Program interface 检查，归一化输出哈希一致。此静态收据不提供驱动或真实世界结论；日期明确的运行观察与限制见对应章节。\n');
}

export function exampleOutputs(context, report, pageRegistry) {
  const outputs = new Map(), index = [];
  const put = (name, value) => outputs.set(name, Buffer.isBuffer(value) ? value : Buffer.from(value));
  for (const example of context.examples) {
    const base = `/downloads/examples/${context.lock.baselineId}/${example.id}/${example.sourceFingerprint}`;
    const entry = { id: example.id, page: example.page, titles: example.titles, sourceFingerprint: example.sourceFingerprint, archiveSha256: example.archiveSha256, archiveLength: example.archiveLength, downloadUrl: base + '/starter.zip', inventoryUrl: base + '/source-inventory.json', validationUrl: base + '/validation.json', sourceBaseUrl: base + '/files', runtimeEvidence: example.runtimeEvidence };
    index.push(entry);
    put('site/public' + entry.downloadUrl, example.archiveBytes);
    put('site/public' + entry.inventoryUrl, jsonBytes({ schemaVersion: 1, baselineId: context.lock.baselineId, sourceCommit: context.lock.upstream.commit, ...entry, files: example.inventory, snippets: example.snippets.map(({ code, ...mapping }) => mapping) }));
    put('site/public' + entry.validationUrl, jsonBytes({ schemaVersion: report.schemaVersion, baselineId: report.baselineId, sourceCommit: report.sourceCommit, toolInventorySha256: report.toolInventorySha256, ...report.examples.find(item => item.id === example.id) }));
    for (const file of example.entries) put('site/public' + entry.sourceBaseUrl + '/' + file.path, file.bytes);
    for (const language of ['zh-CN', 'en-US']) {
      const prefix = language === 'en-US' ? 'en/' : '';
      put('site/' + prefix + example.page, detailPage(example, entry, language, context, pageRegistry.pages.find(page => page.path === example.page)));
    }
  }
  put('site/public/downloads/examples/index.json', jsonBytes({ schemaVersion: 1, baselineId: context.lock.baselineId, sourceCommit: context.lock.upstream.commit, examples: index }));
  for (const language of ['zh-CN', 'en-US']) {
    const en = language === 'en-US', prefix = en ? 'en/' : '';
    const title = en ? 'Examples and downloads' : '示例与下载';
    const record = pageRegistry.pages.find(page => page.path === 'examples/index.md');
    put('site/' + prefix + 'examples/index.md', pageHeader(record, title, en ? 'Complete source snapshots, reproducible downloads and explicit validation boundaries.' : '获取完整示例源码、可复现下载包，并核对其验证范围。', language, context) +
      `<!-- Generated from examples/registry.json. -->\n\n# ${title} {#examples}\n\n<BaselineNote />\n\n` +
      (en ? 'Every download is generated from the same source files displayed on its page. Immutable URLs include the host baseline and full source fingerprint. Static validation is recorded separately from game and driver evidence.\n\n' : '下载包和网页代码都来自同一份登记源码。下载地址包含宿主基线与完整源码指纹；静态验证和游戏、驱动证据分别记录。\n\n') +
      `## ${en ? 'Course examples' : '课程示例'} {#course-examples}\n\n| ${en ? 'Example' : '示例'} | Manifest / Scene ABI | ${en ? 'Evidence' : '证据'} |\n| --- | --- | --- |\n` +
      index.map(item => `| [${item.titles[language]}](/${prefix}${item.page.replace(/\.md$/, '')}) | v5 / v2 | ${en ? 'Static checks passed' : '静态检查通过'} · [${en ? 'Runtime scope' : '实机范围'}](/${prefix}${item.id.startsWith('features/') ? 'recipes/runtime' : item.id.match(/course\/0[0-4]-/) ? 'tutorial/runtime' : 'tutorial/pack-runtime'}) |`).join('\n') + '\n\n' +
      `## ${en ? 'Check your download' : '核对下载'} {#verify-download}\n\n` +
      (en ? 'Compare the ZIP SHA-256 shown on the example page, extract it into a fresh directory and check the adjacent source inventory. The validation receipt identifies the exact tool and input files.\n\n' : '核对示例页列出的 ZIP SHA-256，解压到新目录后比较同目录提供的源码清单。验证收据记录对应的工具身份和输入文件。\n\n') +
      '[examples/index.json](/downloads/examples/index.json)\n');
  }
  put('site/.vitepress/generated/output-manifest.json', jsonBytes({ schemaVersion: 1, files: [...outputs].map(([name, bytes]) => ({ path: name, length: bytes.length, sha256: hash(bytes) })).sort((a, b) => a.path.localeCompare(b.path, 'en')) }));
  return outputs;
}
