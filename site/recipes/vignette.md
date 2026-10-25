---
title: 暗角：尺寸与宽高比
description: 暗角：尺寸与宽高比：操作步骤、精确输入、预期结果与验证边界。
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
      path: examples/features/vignette/shaderpack.json
    - repository: website
      path: metadata/w7-examples-validation.json
    - repository: website
      path: metadata/w7-runtime.json
  example: features/vignette
  verification:
    static: passed
    driverStatus: notProvided
    runtimeEvaluated: false
    liveWorldVerified: false
    visual: notRun
---

# 暗角：尺寸与宽高比 {#overview}

<BaselineNote />

一个可以单独下载、开关、验证和修改的基础效果。课程代码只依赖固定公共合同。

## 算法与可见结果 {#algorithm}

以 UV 中心为原点，将 X 乘纹理宽高比，用 length 得到径向距离，smoothstep(0.22,0.82) 形成遮罩。最终亮度乘 (1−0.65×strength×mask)。尺寸来自实际输入纹理，窗口改变后无需硬编码分辨率。横向更宽的画面会自然增加左右衰减；这不是摄影镜头模拟。

## 资源流与开关 {#flow}

<div class="course-flow">scene/color → [grade on: effect → post/color] → one present → screen</div>

三个包互相独立；都使用四条 BuiltIn Terrain 路由，不复制宿主着色器。practice:grade 选择完整效果闭包，practice:strength 是 Program define，修改需要重编译。前置：[独立包课程](/tutorial/05-options)。

<CourseBranchNote example="features/vignette" />

## 名义成本与禁用行为 {#cost}

一次纹理采样加径向 ALU；中间纹理 4WH，present 另一次采样。没有额外半分辨率链或 history。关闭效果会移除独立中间资源；strength=0 仍保留该分支和绘制，不能把参数归零当成释放资源。

WH 为渲染像素数，1920×1080 的 4WH 约 7.91 MiB，不含基础 color/depth、对齐和驱动开销。这些是逻辑容量/采样估算，不是显存或毫秒实测。

## 完整下载与源码 {#download}

[完整 ZIP、inventory 和收据](/examples/practice-vignette#download)。解压到 shaderpacks/w7-vignette/，在创造世界执行 /switchshader w7-vignette。按 U → Options → Effect practice 应用设置。所有源码如下，无需另一示例目录。

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/features/vignette/shaderpack.json

</details>

<details>
<summary>settings.json</summary>

<<< @/../examples/features/vignette/settings.json

</details>

<details>
<summary>shaders/fullscreen.vsh</summary>

<<< @/../examples/features/vignette/shaders/fullscreen.vsh{glsl}

</details>

<details>
<summary>shaders/grade.psh</summary>

<<< @/../examples/features/vignette/shaders/grade.psh{glsl}

</details>

<details>
<summary>shaders/present.psh</summary>

<<< @/../examples/features/vignette/shaders/present.psh{glsl}

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

<PracticeRuntimeNote example="features/vignette" />

## 练习与排错 {#exercise}

修改本章算法中的一个常量，保存并同包重载，记录新的源码身份。先观察开关，再观察 strength=0 与关闭的成本差异。出现黑屏先关闭效果，按[症状排错](/troubleshooting/)定位；始终保留 /switchshader builtin 作为恢复入口。
