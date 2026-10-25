---
title: 全黑、全白、天空或透明物体缺失
description: 全黑、全白、天空或透明物体缺失：操作步骤、精确输入、预期结果与验证边界。
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

# 全黑、全白、天空或透明物体缺失 {#overview}

<BaselineNote />

统一顺序：加载与版本 → 路由/活动闭包 → 资源与绑定 → 静态接口 → 对应运行时报告 → 画面和生命周期。每次只改变一个因素。

## 先定位到哪一层 {#locate}

先把效果关闭，确认 present-raw 是否仍黑/白。核对四条 Terrain 路由的 mode、Provider、目标和 drawBuffers。DLABI2/DLSCENE 负责路由所有权；DLABI2005 是 disabled 路由可能使内容不可见的警告。不要把某条 opaque override 当成天空、模型与手部的完整接入。

## 检查与修复 {#inspect}

沿 scene color → 中间纹理 → present 逐级改为直接显示，检查 clear/load/store、纹理格式、尺寸、采样输入与 fragment 输出位置。全白可能是编码/范围或曝光叠加；全黑也可能是空目标、错误 sampler、未写资源或驱动失败。用一次受控的纯色输出区分 shader 是否执行，不要同时更改颜色空间与绑定。

## 重新验证与恢复 {#verify}

透明物体检查 alpha-tested、transparent、sorted-translucent 各自顺序和深度/混合状态。恢复 BuiltIn 对照后查看对应 Scene report。本文不为所有画面症状指定单一稳定代码。
