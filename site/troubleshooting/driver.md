---
title: 静态通过但 compile/link 或 FBO 失败
description: 静态通过但 compile/link 或 FBO 失败：操作步骤、精确输入、预期结果与验证边界。
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

# 静态通过但 compile/link 或 FBO 失败 {#overview}

<BaselineNote />

统一顺序：加载与版本 → 路由/活动闭包 → 资源与绑定 → 静态接口 → 对应运行时报告 → 画面和生命周期。每次只改变一个因素。

## 先定位到哪一层 {#locate}

保存第一个候选错误、Program ID、source owner、include/define 变体、GL API/驱动及 native 编译日志。确认使用了正确语言方言、precision、版本与真实设备支持范围。GL-free staticReflection 的 compileContextAvailable=false 明确表示没有驱动上下文。

## 检查与修复 {#inspect}

DLSHADER0301～0302 定位预处理，DLABI4006 定位公开 shader 接口；原生编译文本仍需结合设备日志，不从消息猜一个稳定诊断码。FBO 则逐附件核对格式/尺寸/location、采样数、drawBuffers 与 complete 行，先恢复最小 RGBA8 + depth24 拓扑。

## 重新验证与恢复 {#verify}

按[报告指南](/tools/driver-reports)重新导出。没有成功发布的候选不能生成“成功报告”；保留旧 active generation 作恢复基线。报告 matched 只覆盖记录的 Program/FBO，不证明所有场景或性能。[W7 实机记录](/recipes/runtime)展示实际检查范围。
