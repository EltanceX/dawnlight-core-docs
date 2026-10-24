import { stringify } from 'yaml';
import { jsonBytes, hash } from './locked-inputs.mjs';

function pageHeader(record, title, description, language, context, example) {
  return '---\n' + stringify({
    title, description, lang: language,
    dawnlight: {
      publication: record.publication, baseline: context.lock.baselineId,
      manifestVersions: [5], sceneAbiVersions: [2], sourceRefs: record.sourceRefs,
      ...(example ? { example: example.id, verification: { static: 'passed', ...example.runtimeEvidence } } : {})
    }
  }, { lineWidth: 0 }) + '---\n\n';
}
const fence = snippet => '```' + snippet.language + ' [' + snippet.file + ']\n' + snippet.code + '```\n';

function detailPage(example, entry, language, context, record) {
  const en = language === 'en-US';
  const title = example.titles[language];
  const prefix = en ? '/en' : '';
  const selected = id => example.snippets.find(snippet => snippet.id === id);
  const sourceUrl = `${context.lock.website.repositoryUrl}/blob/${context.lock.website.defaultBranch}/${example.root}`;
  const prose = en ? {
    description: 'Download the complete v5 external starter, inspect its source and check exactly which static tests passed.',
    intro: 'This independent external pack is the starting source for the course. It declares four Terrain fallback routes, two persistent textures, a frame target and one pack-owned present Program. It has no optional effect or configuration branch.',
    warning: 'Static checks passed. This pack has not been tested in the actual game; driver compilation, images and lifecycle behavior remain unverified. The loading and editing course follows in W4.',
    download: 'Download and identity', zip: 'Download starter ZIP', inventory: 'Source inventory and snippet map', validation: 'Static validation receipt',
    extract: 'Extract into a new directory. The archive root contains `shaderpack.json`, `README.md` and `shaders/`; another course chapter is not required. This is an external pack with two textures, so it does not have the zero-extension resource footprint of BuiltIn Minimal.',
    files: 'Source files', source: 'Website source', file: 'File', bytes: 'Bytes', frame: 'Own the frame target',
    frameText: 'This is the value of `/frameTarget`, extracted from the complete manifest. The frame begins with a cleared color/depth topology. The opaque Terrain command also clears depth as required by this Scene ABI; Terrain colors load the existing frame color. This configuration describes ownership; it does not establish that all world renderers behave correctly in-game.',
    routes: 'Explicit Terrain routes', routeText: 'Every category uses `builtin`. Each also has one declaration-only `engineDraw` command in the full manifest. Dawnlight materializes its category-specific fallback Program; the pack does not copy the built-in shader sources.',
    shaders: 'Pack-owned shaders', shaderText: 'The vertex shader generates a fullscreen quad from `gl_VertexID`. The fragment shader samples scene color without an extra color transform. These files belong to the pack source owner.',
    full: 'Complete manifest', verify: 'What was checked', verifyText: 'The pinned Analyzer ran the following commands on both the source directory and a freshly extracted ZIP. File hashes, canonical manifest hashes and normalized Analyzer outputs match. The receipt binds the source fingerprint, archive SHA-256 and tool inventory SHA-256.',
    boundary: 'Runtime checks still required', boundaryText: 'No driver report, game screenshot or runtime test is supplied. In W4, verify sky, models, all Terrain categories, particles, color output, UI, reload, resize, device reset and return to BuiltIn. A resolved route is not evidence of a rendered image.',
    next: 'Read the Analyzer evidence boundaries', hash: 'Archive SHA-256', fingerprint: 'Source fingerprint', identity: 'The source fingerprint covers the baseline, example ID and exact file bytes. It is distinct from the Loader canonical manifest hash and the ZIP hash.'
  } : {
    description: '下载完整 v5 外置起步包，查看同源代码，并核对静态验证与实机证据的边界。',
    intro: '这是课程的独立外置起步包：显式声明四类 Terrain fallback 路由、两张 persistent 纹理、整帧目标和一个包自有 present Program。当前没有可选效果或配置分支。',
    warning: '静态检查已通过，但本包尚未在真实游戏中验证；驱动编译、画面和生命周期仍待实测。完整加载与修改课程在 W4 补齐。',
    download: '下载与身份', zip: '下载起步包 ZIP', inventory: '源码清单与片段映射', validation: '静态验证收据',
    extract: '解压到新目录，根目录直接包含 `shaderpack.json`、`README.md` 和 `shaders/`，不依赖上一章文件。本包是分配两张纹理的外置包，不能当作零扩展资源的 BuiltIn Minimal。',
    files: '源码文件', source: '网站源码', file: '文件', bytes: '字节', frame: '明确整帧目标',
    frameText: '以下是从完整 Manifest 提取的 `/frameTarget` 值。帧开始时清理颜色与深度附件；Terrain opaque 命令按当前 Scene ABI 再清理深度，Terrain 颜色加载已有帧颜色。这里描述目标归属，不代表已经证明所有世界渲染器在实机中表现正确。',
    routes: '显式 Terrain 路由', routeText: '四类路由都使用 `builtin`，完整 Manifest 中还为每一类声明一条不指定 Program 的 `engineDraw` 命令。Dawnlight 为其生成对应 fallback Program；本包不复制内置着色器源码。',
    shaders: '本包自有着色器', shaderText: '顶点着色器从 `gl_VertexID` 生成全屏四边形；片元着色器采样场景颜色，不额外改变颜色空间。这两个文件的 source owner 属于本包。',
    full: '完整 Manifest', verify: '已经检查什么', verifyText: '固定 Analyzer 对源码目录和新解压 ZIP 分别运行以下命令。文件哈希、canonical manifest hash 和归一化 Analyzer 输出一致。收据绑定源码指纹、ZIP SHA-256 与工具清单 SHA-256。',
    boundary: '仍需完成的实机检查', boundaryText: '目前没有驱动报告、游戏截图或运行时测试。W4 需验证天空、模型、四类 Terrain、粒子、色彩输出、UI、重载、resize、device reset 与切回 BuiltIn。路由解析成功不能替代实际画面证据。',
    next: '阅读 Analyzer 的证据边界', hash: '压缩包 SHA-256', fingerprint: '源码指纹', identity: '源码指纹覆盖基线、示例 ID 与精确文件字节；它和 Loader canonical manifest hash、ZIP 哈希分别表示不同身份。'
  };
  const commandBlock = '```powershell\nshaderpack-analyzer.exe pack validate . --format json\nshaderpack-analyzer.exe scene explain . --include-inactive --format json\nshaderpack-analyzer.exe graph dump . --contract 2 --include-inactive\nshaderpack-analyzer.exe program interface . --program course:post/present --contract 2\n```\n';
  return pageHeader(record, title, prose.description, language, context, example) +
    `<!-- Generated from ${example.root}; edit the example or generator, not this file. -->\n\n# ${title} {#external-starter}\n\n<BaselineNote />\n\n${prose.intro}\n\n::: warning ${en ? 'Static evidence only' : '当前仅有静态证据'}\n${prose.warning}\n:::\n\n` +
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
      index.map(item => `| [${item.titles[language]}](/${prefix}${item.page.replace(/\.md$/, '')}) | v5 / v2 | ${en ? 'Static checks passed; game not tested' : '静态检查通过；实机未验证'} |`).join('\n') + '\n\n' +
      `## ${en ? 'Check your download' : '核对下载'} {#verify-download}\n\n` +
      (en ? 'Compare the ZIP SHA-256 shown on the example page, extract it into a fresh directory and check the adjacent source inventory. The validation receipt identifies the exact tool and input files.\n\n' : '核对示例页列出的 ZIP SHA-256，解压到新目录后比较同目录提供的源码清单。验证收据记录对应的工具身份和输入文件。\n\n') +
      '[examples/index.json](/downloads/examples/index.json)\n');
  }
  put('site/.vitepress/generated/output-manifest.json', jsonBytes({ schemaVersion: 1, files: [...outputs].map(([name, bytes]) => ({ path: name, length: bytes.length, sha256: hash(bytes) })).sort((a, b) => a.path.localeCompare(b.path, 'en')) }));
  return outputs;
}
