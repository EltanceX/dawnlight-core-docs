---
title: 独立光影包实机记录
description: W6 代理复现的精确源码身份、分支运行观察与限制。
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
      path: metadata/w6-runtime.json
    - repository: website
      path: metadata/w6-examples-validation.json
---

# 独立光影包实机记录 {#runtime}

<BaselineNote />

代理在固定 Windows 宿主的隔离副本中检查六个独立 ZIP，使用一个创造世界和单主 view。本地维护桥在帧边界请求切换和导出报告，computer-use 技能用于检查界面和画面。这是代理复现，独立人类试读仍待另行完成。

## 宿主与证据边界 {#scope}

宿主 f8aaa5c4218f54536ccf994a2d512aed2e3678b7；Windows x64、.NET 10、OpenGL ES 3.2、RTX 4050 Laptop GPU、NVIDIA 566.07。静态源码/ZIP 检查、Scene 驱动链接与帧缓冲观察、Data 接口准备比对和截图分开登记。未声明性能门、uniform/SSBO 数值读回、完整类别覆盖、Android、VR、多 view、设备丢失或其他 GPU 验收。

## 各章观察 {#chapters}

<PackRuntimeNote example="course/05-options" />

<PackRuntimeNote example="course/06-custom-data" />

<PackRuntimeNote example="course/07-materials" />

<PackRuntimeNote example="course/08-post-chain" />

<PackRuntimeNote example="course/09-complete-pack" />

<PackRuntimeNote example="course/10-distribution" />

## 新 ZIP 复现 {#reader-reproduction}

<PackRuntimeNote reader />

另一位作者可下载最终 ZIP、核对哈希，解压到 shaderpacks 新子目录，应用 balanced/economy/neutral，重载、调整尺寸并切回 BuiltIn。独立人类试读需单独登记。完整本地 WorldFinal 与 Data driver 报告不公开，公开摘要仅保留哈希与范围明确的结果。

## 包自有设置界面 {#settings}

按 U → Options → Amber course。代理关闭柔光后点击 Apply，generation 从 77 增至 78，course:glow=false，驱动闭包中移除了 glow Program。下图分别记录默认设置及应用后的实际界面。

![默认设置](/media/w6/settings.jpg)

![关闭柔光并应用](/media/w6/settings-applied.jpg)

[UI 应用记录](/evidence/w6/settings-observation.json)
