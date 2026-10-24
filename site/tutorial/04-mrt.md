---
title: 04 · 写入并查看 MRT 数据
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
      path: examples/course/04-mrt/shaderpack.json
  example: course/04-mrt
  verification:
    static: passed
    driverStatus: notProvided
    runtimeEvaluated: false
    liveWorldVerified: false
    visual: notRun
---

# 04 · 写入并查看 MRT 数据 {#chapter}

<BaselineNote />

一次 opaque 绘制输出颜色、法线与教学材质数据，后处理显示法线调试图。前置：03、附件 location、uint 与位运算。

## 本章修改与完整包 {#changes}

增加 normal / material 两张 RGBA8 纹理；Terrain 的 named target topology 包含 RT0/RT1/RT2 与相同深度。opaque 显式 drawBuffers=[0,1,2]，fragment 输出三路，grade 读取辅助纹理。frameTarget 保持 RT0 + depth，以承接普通世界渲染。总计 5 张纹理、6 条命令。

[下载并核对全部文件](/examples/04-mrt#download)

## 资源流 {#resource-flow}

<div class="course-flow">opaque → RT0 颜色 / RT1 法线 / RT2 数据 → grade 调试视图 → post/color → present</div>

目标拓扑说明挂了哪些附件，drawBuffers 说明本次绘制启用哪些输出。其余三类 BuiltIn fallback 保留三附件 named topology，但解析 recipe 只启用 RT0；不能在 fallback 声明上直接填写 drawBuffers（会触发 DLMAN0001）。opaque 清零辅助目标并加载已有颜色，深度按 ABI 清理。宿主法线是 oct 编码的 RG 字节及符号字节，经 /255 原样写入 RGB；A=1 表示本课程 opaque 写入。本章直接显示编码，不能把 RGB 当作 XYZ 做 rgb*2-1 后归一化，方向解码留待后续。material 的 R/G 保存顶点 identifier 低 16 位的低/高字节，B 保存示范亮度，A 标记有效。这是课程约定，不是宿主 G-buffer 或稳定内容/材质 ID ABI。用 texelFetch 和整数坐标读取，避免过滤混合标识符字节。

## 完整着色器 {#shader-sources}

<<< @/../examples/course/04-mrt/shaders/fullscreen.vsh{glsl}

<<< @/../examples/course/04-mrt/shaders/terrain.vsh{glsl}

<<< @/../examples/course/04-mrt/shaders/terrain.psh{glsl}

<<< @/../examples/course/04-mrt/shaders/grade.psh{glsl}

<<< @/../examples/course/04-mrt/shaders/present.psh{glsl}

## 完整 Manifest {#complete-manifest}

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/course/04-mrt/shaderpack.json

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
& $analyzer program interface . --program course:scene/terrain --contract 2
```

<RuntimeNote example="course/04-mrt" />

## 常见卡点 {#troubleshooting}

只见灰色：先确认 opaque 写入 A=1，再核对 grade 绑定。颜色有了但 RT1/2 没数据：检查输出 location 和 drawBuffers。水面/天空不含法线是覆盖边界；辅助纹理只记录 opaque Terrain，甚至可能保留被后续透明物体遮住的表面，不能用于完整可见表面的延迟渲染。额外两张 RGBA8 的标称容量为 8×W×H 字节，不含驱动分配开销。

## 动手练习 {#exercise}

在副本将 DEBUG_VIEW 从 1 改为 2，看低位标识符可视化，再改为 0 恢复颜色。为改动副本重跑接口检查和驱动验证；说明为什么“存在三个附件”不等于“每个场景类别都写三个附件”。

[运行方法与证据](/tutorial/runtime) · [回顾资源模型](/concepts/resources-targets)

[下一章：可选效果与设置](/tutorial/05-options)
