---
title: 02 · 建立独立后处理资源
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
      path: examples/course/02-resources/shaderpack.json
  example: course/02-resources
  verification:
    static: passed
    driverStatus: notProvided
    runtimeEvaluated: false
    liveWorldVerified: false
    visual: notRun
---

# 02 · 建立独立后处理资源 {#chapter}

<BaselineNote />

把调色移入独立 fullscreen 命令，理解一张资源的写者、读者与执行顺序。前置：01 与[资源、目标和 drawBuffers](../concepts/resources-targets)。

## 本章修改与完整包 {#changes}

新增 course:post/color（viewport / persistent / rgba8）、grade.psh、grade Program 与 Pass；present 改为读取 post/color。完整包现在为 3 张纹理、6 条命令、2 个包自有 Program。

[下载并核对全部文件](/examples/02-resources#download)

## 资源流 {#resource-flow}

<div class="course-flow">世界 → scene/color → fullscreen grade → post/color → present → 屏幕</div>

grade 的输入是 scene/color，目标是独立 post/color；inputs/outputs 描述访问关系，bindings 把资源绑定到 sampler，targets 指定写入附件。不要在同一绘制里同时采样和写入同一纹理。grade 位于 afterDraw/afterDraw；present 位于 afterDraw/screenOutput，并显式 ordering.after 指向 course:grade。dontCare 只适用于会完全覆盖的输出；store 保留给下一步。viewport 资源由宿主在窗口变化时重建。

## 完整着色器 {#shader-sources}

<<< @/../examples/course/02-resources/shaders/fullscreen.vsh{glsl}

<<< @/../examples/course/02-resources/shaders/grade.psh{glsl}

<<< @/../examples/course/02-resources/shaders/present.psh{glsl}

## 完整 Manifest {#complete-manifest}

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/course/02-resources/shaderpack.json

</details>

## 验证与画面 {#verification}

解压到新目录，在该包根目录打开 PowerShell，使用环境准备中安装的固定 Analyzer。预期退出码 0、无诊断，scene 显示四条活动 Terrain 路由；静态检查不等于驱动编译。

```powershell
$analyzer = "C:\Tools\Dawnlight\shaderpack-analyzer.exe"
& $analyzer pack validate . --format json
& $analyzer scene explain . --include-inactive --format json
& $analyzer graph dump . --contract 2 --include-inactive
& $analyzer program interface . --program course:post/present --contract 2
& $analyzer program interface . --program course:post/grade --contract 2
```

<RuntimeNote example="course/02-resources" />

## 常见卡点 {#troubleshooting}

画面仍原样：present 可能还在采样 scene/color。未定义/闪烁：检查写后读关系与排序，勿只改文件顺序。resize 后异常：核对所有相关目标尺寸同为 viewport，并保留 viewport/scissor 的同步与恢复配置。

## 动手练习 {#exercise}

沿完整 Manifest 标出 scene/color 的写者、grade 的输入输出和 present 的输入。把 grade 的 tint 修改为冷色并重载；解释为什么无需增加另一张深度纹理。

[运行方法与证据](/tutorial/runtime) · [下一章：03 · 接入 opaque Terrain](/tutorial/03-scene)
