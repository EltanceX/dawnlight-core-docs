---
title: resize、切包残留与 history 拖影
description: resize、切包残留与 history 拖影：操作步骤、精确输入、预期结果与验证边界。
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

# resize、切包残留与 history 拖影 {#overview}

<BaselineNote />

统一顺序：加载与版本 → 路由/活动闭包 → 资源与绑定 → 静态接口 → 对应运行时报告 → 画面和生命周期。每次只改变一个因素。

## 先定位到哪一层 {#locate}

记录变更前后 generation、实际窗口/渲染 extent、资源尺寸与 active selection。viewport 尺寸资源随生命周期重建，绝对尺寸 probe 不应被误判为全屏目标。截图相同不能证明 resize 已发生。先在无 history 的[独立效果](/recipes/)复现，再逐项加入历史资源。

## 检查与修复 {#inspect}

History 需真实 writer、有效 current/previous view、fallback 与每帧最多一次且位于所有 writer 之后的 historyCommit。非 history 资源不能 commit，见本轮真实反例。跳过 producer 不应凭空推进历史；重载、world/device/owner/camera/extent 变化与相机 cut 需按合同失效。GPU history 有效性与 view_history_valid 是不同条件。

## 重新验证与恢复 {#verify}

用旧报告解释新 generation 会触发 DLREPORT1001～1010；时序输入/AST 错误按 DLAST、DLDATA family 查。设备丢失、多 view、其他驱动与 TAA 质量不能由静态通过推出。进阶边界见[history、时序与阴影](/recipes/advanced-boundaries)。
