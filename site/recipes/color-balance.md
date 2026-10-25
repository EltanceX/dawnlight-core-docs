---
title: 色彩平衡：一次采样的 LDR 调整
description: 色彩平衡：一次采样的 LDR 调整：操作步骤、精确输入、预期结果与验证边界。
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
      path: examples/features/color-balance/shaderpack.json
    - repository: website
      path: metadata/w7-examples-validation.json
    - repository: website
      path: metadata/w7-runtime.json
  example: features/color-balance
  verification:
    static: passed
    driverStatus: notProvided
    runtimeEvaluated: false
    liveWorldVerified: false
    visual: notRun
---

# 色彩平衡：一次采样的 LDR 调整 {#overview}

<BaselineNote />

一个可以单独下载、开关、验证和修改的基础效果。课程代码只依赖固定公共合同。

## 算法与可见结果 {#algorithm}

把场景颜色围绕 0.5 增加 12% 对比，再乘 (1.05,1.0,0.94)，用 strength 在原图与结果之间混合并限制到 [0,1]。这是明确的艺术调色约定，不自动引入 sRGB 解码或 HDR 曝光。先确认你接入的 scene color 编码；在本例链外再做一次 gamma 会重复转换。

## 资源流与开关 {#flow}

<div class="course-flow">scene/color → [grade on: effect → post/color] → one present → screen</div>

三个包互相独立；都使用四条 BuiltIn Terrain 路由，不复制宿主着色器。practice:grade 选择完整效果闭包，practice:strength 是 Program define，修改需要重编译。前置：[独立包课程](/tutorial/05-options)。

<CourseBranchNote example="features/color-balance" />

## 名义成本与禁用行为 {#cost}

每个效果像素读取一次场景颜色；再加 present 的一次采样。独立中间 RGBA8 纹理名义容量 4WH 字节，关闭 grade 后该纹理、Program 与 command 全部不活动。场景 color/depth 及四条 BuiltIn 路由仍保留。

WH 为渲染像素数，1920×1080 的 4WH 约 7.91 MiB，不含基础 color/depth、对齐和驱动开销。这些是逻辑容量/采样估算，不是显存或毫秒实测。

## 完整下载与源码 {#download}

[完整 ZIP、inventory 和收据](/examples/practice-color-balance#download)。解压到 shaderpacks/w7-color-balance/，在创造世界执行 /switchshader w7-color-balance。按 U → Options → Effect practice 应用设置。所有源码如下，无需另一示例目录。

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/features/color-balance/shaderpack.json

</details>

<details>
<summary>settings.json</summary>

<<< @/../examples/features/color-balance/settings.json

</details>

<details>
<summary>shaders/fullscreen.vsh</summary>

<<< @/../examples/features/color-balance/shaders/fullscreen.vsh{glsl}

</details>

<details>
<summary>shaders/grade.psh</summary>

<<< @/../examples/features/color-balance/shaders/grade.psh{glsl}

</details>

<details>
<summary>shaders/present.psh</summary>

<<< @/../examples/features/color-balance/shaders/present.psh{glsl}

</details>

## 静态验证与实机范围 {#verification}

```powershell
shaderpack-analyzer.exe pack validate . --format json
shaderpack-analyzer.exe scene explain . --include-inactive --format json
shaderpack-analyzer.exe graph dump . --contract 2 --include-inactive
shaderpack-analyzer.exe program interface . --program practice:post/grade --contract 2
shaderpack-analyzer.exe program interface . --program practice:post/present --contract 2
```

默认、grade-off、strength-max 均对源码与新 ZIP 检查。上面的 CLI graph 只检查默认配置，选项分支由显式 inputs.options 的 JSON-RPC 检查。

<PracticeRuntimeNote example="features/color-balance" />

## 练习与排错 {#exercise}

修改本章算法中的一个常量，保存并同包重载，记录新的源码身份。先观察开关，再观察 strength=0 与关闭的成本差异。出现黑屏先关闭效果，按[症状排错](/troubleshooting/)定位；始终保留 /switchshader builtin 作为恢复入口。
