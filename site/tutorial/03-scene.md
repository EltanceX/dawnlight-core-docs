---
title: 03 · 接入 opaque Terrain
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
      path: examples/course/03-scene/shaderpack.json
  example: course/03-scene
  verification:
    static: passed
    driverStatus: notProvided
    runtimeEvaluated: false
    liveWorldVerified: false
    visual: notRun
---

# 03 · 接入 opaque Terrain {#chapter}

<BaselineNote />

让 opaque Terrain 使用本包 Program，其余三类保留 BuiltIn。预期普通地形略带绿色，天空、水与 UI 不应被当成同一类地形替换。前置：02、顶点到片元的数据传递。

## 本章修改与完整包 {#changes}

增加 terrain.vsh / terrain.psh 与 course:scene/terrain；opaque sceneCategory 设为 override 并指向对应 Stage，engineDraw 指定 Program 与 sceneBindings。其余 fallback 声明不指定 Program。资源仍为 3 张，命令仍为 6 条。

[下载并核对全部文件](/examples/03-scene#download)

## 资源流 {#resource-flow}

<div class="course-flow">宿主 Terrain 顶点 / 纹理 → sceneBindings + pack Program → scene/color → grade → present</div>

采用 officialCompatible 编译与公开 Terrain 顶点布局：location 0–7、语义注释、标识符 uint。view 频率绑定 viewProjection 与 terrain origin；batch 绑定 lightTable；draw 绑定方块纹理。位置先减 XZ origin，再乘矩阵，并执行 OPENGL_POSITION_FIX。不要凭字段名猜单位或把整数标识符当插值浮点数。此 clean-room shader 只演示纹理、顶点色和基础光表，不具备完整 BuiltIn 雾、光照与视觉等价性。

## 完整着色器 {#shader-sources}

<<< @/../examples/course/03-scene/shaders/fullscreen.vsh{glsl}

<<< @/../examples/course/03-scene/shaders/terrain.vsh{glsl}

<<< @/../examples/course/03-scene/shaders/terrain.psh{glsl}

<<< @/../examples/course/03-scene/shaders/grade.psh{glsl}

<<< @/../examples/course/03-scene/shaders/present.psh{glsl}

## 完整 Manifest {#complete-manifest}

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/course/03-scene/shaderpack.json

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

<RuntimeNote example="course/03-scene" />

## 常见卡点 {#troubleshooting}

地形消失：核对 category、Stage ID 与 engineDraw provider 一致，再查矩阵和 origin。贴图异常：核对 sampler 符号、binding 和 block_texture 合同。Builtin 路由不是从本包 shaderRoot 加载；不要把其文件名重定向到本包来“补齐”它。

## 动手练习 {#exercise}

只改 terrain.psh 的绿色系数，确认影响的类别。用 scene explain 指出唯一 sourceOwner=pack 的 Terrain 路由，并解释 present 为什么也属于 pack，但不属于 Terrain 路由。

[运行方法与证据](/tutorial/runtime) · [下一章：04 · 写入并查看 MRT 数据](/tutorial/04-mrt)
