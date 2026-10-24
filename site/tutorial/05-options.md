---
title: 05 · 可选效果与设置
description: 制作、验证并分发完整独立琥珀光影包，包含同源代码、分支收据与明确的实机边界。
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
      path: examples/course/05-options/shaderpack.json
    - repository: website
      path: metadata/w6-examples-validation.json
    - repository: website
      path: metadata/w6-runtime.json
  example: course/05-options
  verification:
    static: passed
    driverStatus: notProvided
    runtimeEvaluated: false
    liveWorldVerified: false
    visual: notRun
---

# 05 · 可选效果与设置 {#chapter}

<BaselineNote />

让调色成为真正可关闭的效果，并用设置页控制强度。前置：04 的目标拓扑、02 的写者/读者与 03 的 Terrain 路由。完成后能解释一个开关如何改变 Program、资源和命令的活动闭包。

## 本章修改与完整包 {#changes}

从 03 的正常颜色管线继续；移除 04 仅用于学习的 RT1/RT2 调试附件，frameTarget 与 opaque 都回到 RT0 + depth。保留完整 Terrain 顶点声明。新增 settings.json、grade 开关、strength define 和两条互斥 present Pass。上一章 ZIP 可用于对照，本章 ZIP 已包含全部文件。

[上一章完整下载](/examples/04-mrt#download) · [本章完整 ZIP、源码清单与收据](/examples/05-options#download)

## 资源流 {#resource-flow}

<div class="course-flow">Terrain + world → scene/color + scene/depth → [grade=true: grade → post/color → present-grade] / [grade=false: present-raw] → screen</div>

course:grade 的 impact 为 pipeline/resources。grade 和 present-grade 都要求 grade=true；present-raw 要求 false。开关不能只禁用写者却留下读取 post/color 的 present：那会产生无写者资源。ordering 只放在对应活动链上，关闭分支不依赖 grade。

course:strength 是 0–1 的 number，impact=program，通过 defines.GRADE_STRENGTH 注入着色器。本例用 float(GRADE_STRENGTH) 接受 0 或 1 的编译字面量。编译时常量需要重新编译；若需要数据驱动的 uniform，下一章使用 customData。impact 表示失效范围，不是“绝不编译”的性能承诺。

按 **U** 打开菜单，选择 **Options**，进入包提供的 **Amber course** 页。设置 UI 只呈现 Manifest 选项：每项恰好一个 control，不能改类型、硬范围或默认值。strength 滑杆用 UI enabledWhen 在调色关闭时禁用；这不是渲染条件。切换设置后按应用，等待下一帧发布；失败时核对错误并保留上一有效 generation。

## 活动分支矩阵 {#branches}

<CourseBranchNote example="course/05-options" />

## 完整着色器 {#shader-sources}

<details>
<summary>shaders/fullscreen.vsh</summary>

<<< @/../examples/course/05-options/shaders/fullscreen.vsh{glsl}

</details>

<details>
<summary>shaders/grade.psh</summary>

<<< @/../examples/course/05-options/shaders/grade.psh{glsl}

</details>

<details>
<summary>shaders/present.psh</summary>

<<< @/../examples/course/05-options/shaders/present.psh{glsl}

</details>

<details>
<summary>shaders/terrain.psh</summary>

<<< @/../examples/course/05-options/shaders/terrain.psh{glsl}

</details>

<details>
<summary>shaders/terrain.vsh</summary>

<<< @/../examples/course/05-options/shaders/terrain.vsh{glsl}

</details>

## 完整 Manifest 与设置 {#complete-manifest}

<details>
<summary>settings.json</summary>

<<< @/../examples/course/05-options/settings.json

</details>

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/course/05-options/shaderpack.json

</details>

## 验证与画面 {#verification}

解压为 shaderpacks 的新直接子目录，在包根目录使用环境准备中安装的固定 Analyzer。预期退出码 0、无诊断；材质未提供世界快照时 deferred 是预期。进入创造世界应用设置，再重载、调整尺寸并切回 BuiltIn。

```powershell
$analyzer = "C:\Tools\Dawnlight\shaderpack-analyzer.exe"
& $analyzer pack validate . --format json
& $analyzer scene explain . --include-inactive --format json
& $analyzer graph dump . --contract 2 --include-inactive
& $analyzer program interface . --program course:scene/terrain --contract 2
& $analyzer program interface . --program course:post/grade --contract 2
& $analyzer program interface . --program course:post/present --contract 2
& $analyzer data explain . --format json
```

以上 graph CLI 命令只检查默认值。已提交分支收据使用显式 inputs.options 的 JSON-RPC，见上表和[维护流程](https://github.com/EltanceX/dawnlight-core-docs/blob/main/docs/maintenance/CoursePacks.zh-CN.md)。

<PackRuntimeNote example="course/05-options" />

## 常见卡点 {#troubleshooting}

关闭后黑屏：检查 present-raw 的 binding/inputs 是否都是 scene/color；同帧只能有一条活动 present。滑杆不变：先应用，再核对 define 的 option ID 与 impact。不要把 UI enabledWhen 写成 Pass 条件的替代。

## 动手练习 {#exercise}

分别应用 grade=false、true 和 strength=0.0、1.0。预测每次的资源数量，再核对本页分支表。把 present-raw 故意改为读取 post/color，在副本中验证错误后恢复；解释为什么“Pass 未执行”不等于“所有声明资源都分配”。

[options](/reference/options) · [settings-ui](/reference/settings-ui) · [programs](/reference/programs)

[下一章: 06 · 时间、天气与自定义数据](/tutorial/06-custom-data)
