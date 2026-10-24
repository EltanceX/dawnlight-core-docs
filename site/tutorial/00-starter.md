---
title: 00 · 加载外置起步包
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
      path: examples/course/00-starter/shaderpack.json
  example: course/00-starter
  verification:
    static: passed
    driverStatus: notProvided
    runtimeEvaluated: false
    liveWorldVerified: false
    visual: notRun
---

# 00 · 加载外置起步包 {#chapter}

<BaselineNote />

从空目录放入完整包，识别当前活动来源，得到未经额外调色的场景输出。先完成[环境准备](../start/environment)；本章不要求编写 C#。

## 本章修改与完整包 {#changes}

本章是基线，没有上一章依赖。四个文件组成完整包。两张 persistent viewport 纹理分别承载颜色和深度；一个 present Program 采样颜色。四类 Terrain 都显式选择 BuiltIn fallback。

[下载并核对全部文件](/examples/course-starter#download)

## 资源流 {#resource-flow}

<div class="course-flow">宿主天空 / 模型 / Terrain → scene/color + depth → present → 屏幕 → UI</div>

`frameTarget` 接管整帧颜色与深度的去向，不等同于只声明四类 Terrain。帧开始时清理附件；opaque 命令按当前 ABI 清理深度，但颜色使用 load，以保留已绘制的天空。fallback Program 的 source owner 属于宿主，本包的 present 属于 shaderRoot；无需复制内置 shader。起步包不是 BuiltIn Minimal，存在额外纹理分配。

## 完整着色器 {#shader-sources}

<<< @/../examples/course/00-starter/shaders/fullscreen.vsh{glsl}

<<< @/../examples/course/00-starter/shaders/present.psh{glsl}

## 完整 Manifest {#complete-manifest}

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/course/00-starter/shaderpack.json

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

<RuntimeNote example="course/00-starter" />

## 常见卡点 {#troubleshooting}

包不出现：检查是否多套了一层目录，ZIP 不会被目录扫描直接加载。仅选中行但画面不变：执行应用，确认活动来源与错误详情。黑屏：核对 present 采样的资源 ID 与 frameTarget 颜色相同；先切回 BuiltIn，再查看日志。天空丢失：不要把 opaque 的颜色 load 改成 clear。

## 动手练习 {#exercise}

不改源码，完成“加载 → 同包强制重载 → 改变窗口大小 → 切回 BuiltIn”。逐项确认没有错误并保存日志；能指出颜色由谁写入、present 从哪里读取。

[运行方法与证据](/tutorial/runtime) · [下一章：01 · 写出第一个后处理](/tutorial/01-first-post)
