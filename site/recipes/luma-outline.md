---
title: 亮度描边：局部对比的边界
description: 亮度描边：局部对比的边界：操作步骤、精确输入、预期结果与验证边界。
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
      path: examples/features/luma-outline/shaderpack.json
    - repository: website
      path: metadata/w7-examples-validation.json
    - repository: website
      path: metadata/w7-runtime.json
  example: features/luma-outline
  verification:
    static: passed
    driverStatus: notProvided
    runtimeEvaluated: false
    liveWorldVerified: false
    visual: notRun
---

# 亮度描边：局部对比的边界 {#overview}

<BaselineNote />

一个可以单独下载、开关、验证和修改的基础效果。课程代码只依赖固定公共合同。

## 算法与可见结果 {#algorithm}

用 (0.2126,0.7152,0.0722) 计算当前 RGB 数值的亮度近似，比较中心与上下左右一个输入像素。最大差值经 smoothstep(0.08,0.20) 后混入深色墨线。它可能描绘纹理细节，也可能漏掉亮度相同的轮廓；没有深度/法线、对象 ID 或时序稳定性，不能称为几何轮廓。

## 资源流与开关 {#flow}

<div class="course-flow">scene/color → [grade on: effect → post/color] → one present → screen</div>

三个包互相独立；都使用四条 BuiltIn Terrain 路由，不复制宿主着色器。practice:grade 选择完整效果闭包，practice:strength 是 Program define，修改需要重编译。前置：[独立包课程](/tutorial/05-options)。

<CourseBranchNote example="features/luma-outline" />

## 名义成本与禁用行为 {#cost}

每个效果像素五次采样，加 present 一次；独立 RGBA8 中间容量 4WH。邻域半径固定为一个输入像素，分辨率增加会令屏幕上的线更细，运动中可能闪烁。若需要几何轮廓，先完成 MRT 编解码和类别有效标记，再参考 ToonLab 案例，不猜测宿主固定 G-buffer。

WH 为渲染像素数，1920×1080 的 4WH 约 7.91 MiB，不含基础 color/depth、对齐和驱动开销。这些是逻辑容量/采样估算，不是显存或毫秒实测。

## 完整下载与源码 {#download}

[完整 ZIP、inventory 和收据](/examples/practice-luma-outline#download)。解压到 shaderpacks/w7-luma-outline/，在创造世界执行 /switchshader w7-luma-outline。按 U → Options → Effect practice 应用设置。所有源码如下，无需另一示例目录。

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/features/luma-outline/shaderpack.json

</details>

<details>
<summary>settings.json</summary>

<<< @/../examples/features/luma-outline/settings.json

</details>

<details>
<summary>shaders/fullscreen.vsh</summary>

<<< @/../examples/features/luma-outline/shaders/fullscreen.vsh{glsl}

</details>

<details>
<summary>shaders/grade.psh</summary>

<<< @/../examples/features/luma-outline/shaders/grade.psh{glsl}

</details>

<details>
<summary>shaders/present.psh</summary>

<<< @/../examples/features/luma-outline/shaders/present.psh{glsl}

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

<PracticeRuntimeNote example="features/luma-outline" />

## 练习与排错 {#exercise}

修改本章算法中的一个常量，保存并同包重载，记录新的源码身份。先观察开关，再观察 strength=0 与关闭的成本差异。出现黑屏先关闭效果，按[症状排错](/troubleshooting/)定位；始终保留 /switchshader builtin 作为恢复入口。
