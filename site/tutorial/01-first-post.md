---
title: 01 · 写出第一个后处理
description: 从完整包到可复现效果，包含同源代码、资源流、排错与明确的验证范围。
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
      path: examples/course/01-first-post/shaderpack.json
  example: course/01-first-post
  verification:
    static: passed
    driverStatus: notProvided
    runtimeEvaluated: false
    liveWorldVerified: false
    visual: notRun
---

# 01 · 写出第一个后处理 {#chapter}

<BaselineNote />

给场景增加轻微暖色与对比度，保持 UI 可读。前置：完成 00，理解[最少 GLSL 知识](../start/glsl)的采样与 mix。

## 本章修改与完整包 {#changes}

相对 00，仅改变 present.psh 的效果逻辑；Manifest 的示例身份不同，资源、路由与命令数量保持 2 / 4 / 5。下载仍包含完整四个文件。

[下载并核对全部文件](/examples/01-first-post#download)

## 资源流 {#resource-flow}

<div class="course-flow">scene/color → 采样 → 对比与暖色 → mix → present → 屏幕</div>

先采样 source，再围绕 0.5 做 1.08 倍对比，乘 tint，最后用 strength=0.65 混合。clamp 把结果限制到 [0,1]。这是 RGBA8 / LDR 的教学变换，没有线性化、HDR 或正确色调映射的承诺。全屏顶点通过 gl_VertexID 生成四边形；片元 shader 对每个输出像素运行。

## 完整着色器 {#shader-sources}

<<< @/../examples/course/01-first-post/shaders/fullscreen.vsh{glsl}

<<< @/../examples/course/01-first-post/shaders/present.psh{glsl}

## 完整 Manifest {#complete-manifest}

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/course/01-first-post/shaderpack.json

</details>

## 验证与画面 {#verification}

解压到新目录，在该包根目录打开 PowerShell，使用环境准备中安装的固定 Analyzer。预期退出码 0、无诊断，scene 显示四条活动 Terrain 路由；静态检查不等于驱动编译。

```powershell
$analyzer = "C:\Tools\Dawnlight\shaderpack-analyzer.exe"
& $analyzer pack validate . --format json
& $analyzer scene explain . --include-inactive --format json
& $analyzer graph dump . --contract 2 --include-inactive
& $analyzer program interface . --program course:post/present --contract 2
```

<RuntimeNote example="course/01-first-post" />

## 常见卡点 {#troubleshooting}

修改无效：确认编辑的是当前子目录的 shaders/present.psh，保存后使用同包强制重载；仅刷新目录不会重编译。全白或全黑：先将 strength 改为 0 比较采样，再检查 tint 是否误写成 104。编译失败时核对分号、类型与日志中的文件/行。

## 动手练习 {#exercise}

在本地副本把 strength 改成 0，重载观察，再设成 1。说明 mix 的两个端点。此修改副本已不同于下载指纹，记录修改，不把原始 ZIP 的静态收据套用到修改后源码。

[运行方法与证据](/tutorial/runtime) · [下一章：02 · 建立独立后处理资源](/tutorial/02-resources)
