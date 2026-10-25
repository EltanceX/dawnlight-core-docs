---
title: 基础效果实践
description: 基础效果实践：操作步骤、精确输入、预期结果与验证边界。
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
      path: examples/registry.json
    - repository: website
      path: metadata/w7-examples-validation.json
---

# 基础效果实践 {#overview}

<BaselineNote />



## 从一个独立效果开始 {#choose}

- [色彩平衡：一次采样的 LDR 调整](/recipes/color-balance)
- [暗角：尺寸与宽高比](/recipes/vignette)
- [亮度描边：局部对比的边界](/recipes/luma-outline)

另见[半分辨率柔光](/tutorial/08-post-chain)、[昼夜/天气数据](/tutorial/06-custom-data)和[材质风格](/tutorial/07-materials)。这三项复用已冻结课程包，不建立同名可编辑副本。

## 先估算再测量 {#costs}

对比相同分辨率、世界、选项与源码版本。独立中间纹理、采样次数、分支闭包可静态说明；GPU 时间、内存驻留和完整帧率需专项测量。关闭效果检查实际 active 资源，不把“所有功能可选”当作无需基础资源。

[实机范围](/recipes/runtime) · [高级能力边界](/recipes/advanced-boundaries) · [大型包案例](/cases/)
