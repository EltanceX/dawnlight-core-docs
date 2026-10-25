---
title: MRT、输出位置与绑定冲突
description: MRT、输出位置与绑定冲突：操作步骤、精确输入、预期结果与验证边界。
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
    - repository: website
      path: examples/diagnostics/w7-cases.json
    - repository: website
      path: metadata/w7-diagnostics.json
---

# MRT、输出位置与绑定冲突 {#overview}

<BaselineNote />

统一顺序：加载与版本 → 路由/活动闭包 → 资源与绑定 → 静态接口 → 对应运行时报告 → 画面和生命周期。每次只改变一个因素。

## 先定位到哪一层 {#locate}

先区分 named targets、active draw buffers 与 shader location。一个输出 location 必须对应实际活动颜色附件；额外附件存在不代表本次 draw 会写它。核对格式、尺寸、load/store 和 clear 编码。DLABI3 定位目标布局与 drawBuffers，DLABI4003～4006 定位类型、频率、slot 与 shader 接口。

## 检查与修复 {#inspect}

按每个 Program invocation 列出 symbol、kind、binding、resource、access、频率及 source owner。sampler、image、UBO、SSBO 有各自命名空间，不能只因两个数字相同就判冲突；同一命名空间内再查占用与 ABI 保留项。materialTable 必须只读 storageBuffer；W5 的[UBO 反例](/reference/examples)保留 DLMAT1002。

## 重新验证与恢复 {#verify}

运行 program interface --contract 2 后再与同 generation report 对照。通用后处理的两种可疑 target/feedback 修改在本轮 GL-free 查询中没有诊断；这不能证明输出映射、FBO 或像素正确。需检查驱动 report 与实际输出。
