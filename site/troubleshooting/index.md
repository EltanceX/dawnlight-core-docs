---
title: 按症状排查光影包
description: 按症状排查光影包：操作步骤、精确输入、预期结果与验证边界。
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

# 按症状排查光影包 {#overview}

<BaselineNote />



## 从症状进入 {#symptoms}

- [包未显示、加载失败或仍是旧效果](/troubleshooting/loading)
- [全黑、全白、天空或透明物体缺失](/troubleshooting/image-scene)
- [MRT、输出位置与绑定冲突](/troubleshooting/targets-bindings)
- [同纹理读写、writer、顺序与 barrier](/troubleshooting/graph-hazards)
- [resize、切包残留与 history 拖影](/troubleshooting/lifecycle-history)
- [Mod 材质未匹配与 mapping deferred](/troubleshooting/materials)
- [静态通过但 compile/link 或 FBO 失败](/troubleshooting/driver)

## 先记录，再缩小范围 {#sequence}

记录宿主 commit、包/ZIP 指纹、选项、active selection、published generation、实际尺寸、世界/Mod、GPU/驱动及第一条错误。先做 pack validate，再做 scene/graph/interface，最后比较对应 report 与实际画面。不要在一个步骤中同时更换宿主、世界、源码与参数。

[从错误到修复的完整实验](/troubleshooting/configuration-lab)包含三份明确标为反例的完整 ZIP，源码和新解压 ZIP 均实际拒绝，恢复后重新通过。

## 以 code 与来源定位 {#codes}

以稳定 code/family 和 file/pointer 定位；英文 message 是上下文。相同症状可能来自不同层，同一 family 也可能有多个来源。[诊断参考](/reference/diagnostics)说明稳定 family，[Analyzer](/tools/analyzer)说明退出码与合同。
