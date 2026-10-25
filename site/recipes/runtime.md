---
title: 基础效果实机记录
description: 基础效果实机记录：操作步骤、精确输入、预期结果与验证边界。
lang: zh-CN
dawnlight:
  publication: published
  baseline: candidate-f8aaa5c4
  manifestVersions:
    - 5
  sceneAbiVersions:
    - 2
  sourceRefs:
    - repository: website
      path: metadata/w7-runtime.json
    - repository: website
      path: metadata/w7-examples-validation.json
---

# 基础效果实机记录 {#overview}

<BaselineNote />



## 宿主、方法与边界 {#scope}

固定 f8aaa5c4 宿主的隔离 Windows 副本，一个创造世界、单主 view。Scene report 的链接/FBO 观察与实际截图分开记录；原始报告、世界和维护桥留在本地。未声明数值读回、RenderDoc、正式性能门、其他 GPU/平台、设备丢失、VR 或多 view 验收。

## 各独立包的实际观察 {#effects}

<PracticeRuntimeNote example="features/color-balance" />

<PracticeRuntimeNote example="features/vignette" />

<PracticeRuntimeNote example="features/luma-outline" />

## 非法候选与恢复 {#rollback}

受控 unknown-provider 请求在帧桥中超时。恢复 Manifest 精确字节后活动包仍可使用，但这不足以证明运行时拒绝或回滚。三份源码/ZIP 反例及修复已在[配置实验](/troubleshooting/configuration-lab)完成离线验证；运行时失败保留仍未验证。代理观察不等于独立真人试用。
