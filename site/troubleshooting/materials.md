---
title: Mod 材质未匹配与 mapping deferred
description: Mod 材质未匹配与 mapping deferred：操作步骤、精确输入、预期结果与验证边界。
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

# Mod 材质未匹配与 mapping deferred {#overview}

<BaselineNote />

统一顺序：加载与版本 → 路由/活动闭包 → 资源与绑定 → 静态接口 → 对应运行时报告 → 画面和生命周期。每次只改变一个因素。

## 先定位到哪一层 {#locate}

先确认包声明的 materials ABI、唯一 materialTable、properties/tags/definitions/fallback，再查看当前世界是否包含 selector 对应的内容 owner 与最终 ID。文件路径、显示名、翻译名不等于稳定内容身份。用同世界 WorldFinal 解析，先保留 deferred 再补上下文。

## 检查与修复 {#inspect}

按 priority 与选择器逐条核对命中，区分 required 缺失与 onMissing=skip。W6 的 amberdemo:MarbleBlock 是虚构可选入口，未安装该 Mod 时 skip 是预期；未命中内容使用 neutral。DLMAT1001～1003 处理声明/消费者冲突，1005～1006 区分源码 ABI 与链接布局。

## 重新验证与恢复 {#verify}

若映射正确但画面不变，检查 readonly std430、SSBO slot、shaderId 边界、flat uint 传递和属性读取。Data matched 不提供数值读回，不能代替真实 shader 消费检查。[导出与解析步骤](/tools/content-snapshots) · [Data report](/tools/driver-reports)。
