---
title: Schema 与编辑器
description: Schema 与编辑器：操作步骤、精确输入、预期结果与验证边界。
lang: zh-CN
dawnlight:
  publication: published
  baseline: candidate-f8aaa5c4
  manifestVersions:
    - 5
  sceneAbiVersions:
    - 2
  sourceRefs:
    - repository: upstream
      path: tools/ShaderPackAnalyzer/README.md
      commit: f8aaa5c4218f54536ccf994a2d512aed2e3678b7
    - repository: upstream
      path: docs/ShaderPackDiagnosticReference.md
      commit: f8aaa5c4218f54536ccf994a2d512aed2e3678b7
---

# Schema 与编辑器 {#overview}

<BaselineNote />



## 按文件关联，保留原始 Schema {#associate}

在包根目录创建 `.vscode/settings.json`。主课程使用 v5；兼容包选择对应 v3/v4 Schema。不要为了编辑器向 shaderpack.json 插入 `$schema`：Loader 的根字段白名单不接受该惯例。下面只匹配课程的五个 fragment；settings.json 是独立 UI 合同，不能套用 Manifest 根 Schema。

```json
{"json.schemas":[{"fileMatch":["/shaderpack.json"],"url":"https://core.eltancex.top/downloads/reference/schema-v5.json"},{"fileMatch":["/manifest/options.json","/manifest/resources.json","/manifest/programs.json","/manifest/passes.json","/manifest/data.json"],"url":"https://core.eltancex.top/downloads/reference/schema-v5.json#/$defs/fragment"}]}
```

## 离线副本与引用 {#offline}

从[参考下载](/reference/tool-contracts#sources)保存 schema-v5.json，核对 SHA-256 后将 url 改为本地相对路径。文件内 `$id` 是合同身份，下载地址是分发位置；保留 `$id` 和字节。v5 的内部 `$ref` 指向同一文档的定义，离线使用应保持完整文件；completion-v2.json 是补全元数据，不是 Manifest Schema。不要把 v3/v4 与 v5 bundle 混放到同一个工具输出目录。

## 导出、核验与错误分层 {#verify}

先导出到显式的新目录，再做只读逐字节核验。下面的路径须为新建或由此工具管理的目录，不能指向游戏包、文件系统根或混有其他文件的目录。日常核验不执行 approve。

```powershell
shaderpack-analyzer.exe schema export --manifest-version 5 --output ./schema-v5
shaderpack-analyzer.exe schema verify --manifest-version 5 --output ./schema-v5
```

DLSCHEMA1001～1003 检查请求/目录，DLSCHEMA2001～2002 表示缺失或字节不符。结构编辑提示不能证明 Catalog ID 存在、组合引用正确或驱动链接成功；继续运行 pack validate。见[真实修复实验](/troubleshooting/configuration-lab)。
