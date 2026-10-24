---
title: 06 · 时间、天气与自定义数据
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
      path: examples/course/06-custom-data/shaderpack.json
    - repository: website
      path: metadata/w6-examples-validation.json
    - repository: website
      path: metadata/w6-runtime.json
  example: course/06-custom-data
  verification:
    static: passed
    driverStatus: notProvided
    runtimeEvaluated: false
    liveWorldVerified: false
    visual: notRun
---

# 06 · 时间、天气与自定义数据 {#chapter}

<BaselineNote />

让琥珀色调随公开昼夜与降水输入变化，并把曝光增益从 define 改为 typed uniform。前置：05、GLSL uniform、JSON 表达式树。完成后能区分 generation/frame/view 频率和“已规划”与“已求值”的证据。

## 本章修改与完整包 {#changes}

新增 customData.abiVersion=1、gain/day/rain 三个 float 变量，grade command 用 customBindings 连接 u_gain/u_day/u_rain。gain 选项为 uniform impact，strength 继续作为 define，便于比较两条数据路径。

[上一章完整下载](/examples/05-options#download) · [本章完整 ZIP、源码清单与收据](/examples/06-custom-data#download)

## 资源流 {#resource-flow}

<div class="course-flow">day_time@1 + weather_precipitation@1 + gain option → typed variables → customBindings → grade shader → post/color → present</div>

gain 在 generation 频率读取 option 并显式 as=float；day 在 frame 频率读取 dawnlight:data/day_time@1，单位 day_fraction；rain 在 frame 频率读取 weather_precipitation@1，用三个 float 参数的 clamp 限到 0–1，单位 dimensionless。默认值分别 1、0.5、0，onError=useDefault；不能用默认值掩盖非法类型或不存在的输入。

daylight=0.5+0.5*sin(2π*(day-0.25)) 只控制后处理的冷暖权重；雨量降低暖色红通道，gain 乘整体亮度。这里没有替换太阳光照、天空或实现物理曝光。关闭 grade 后这三个变量没有活动消费者；声明仍参与 AST、类型与预算检查。

frame 输入不能放进 generation 变量；view 矩阵需要 view 频率与匹配坐标空间，本章不使用。uniform 必须是同名、精确 float 的标量，不能声明 float[1]。本包不申请私有 C# hook 或用自定义 semantic 重定义宿主数据；公共输入及当前 23 项目录见参考页。

## 活动分支矩阵 {#branches}

<CourseBranchNote example="course/06-custom-data" />

## 完整着色器 {#shader-sources}

<details>
<summary>shaders/fullscreen.vsh</summary>

<<< @/../examples/course/06-custom-data/shaders/fullscreen.vsh{glsl}

</details>

<details>
<summary>shaders/grade.psh</summary>

<<< @/../examples/course/06-custom-data/shaders/grade.psh{glsl}

</details>

<details>
<summary>shaders/present.psh</summary>

<<< @/../examples/course/06-custom-data/shaders/present.psh{glsl}

</details>

<details>
<summary>shaders/terrain.psh</summary>

<<< @/../examples/course/06-custom-data/shaders/terrain.psh{glsl}

</details>

<details>
<summary>shaders/terrain.vsh</summary>

<<< @/../examples/course/06-custom-data/shaders/terrain.vsh{glsl}

</details>

## 完整 Manifest 与设置 {#complete-manifest}

<details>
<summary>settings.json</summary>

<<< @/../examples/course/06-custom-data/settings.json

</details>

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/course/06-custom-data/shaderpack.json

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

<PackRuntimeNote example="course/06-custom-data" />

## 常见卡点 {#troubleshooting}

DLDATA 诊断：先看输入 ID/version/type/unit，再看频率和 consumer 可用性。画面像没变：gain 设为 1.2，确认 grade 打开并应用；昼夜或降水没有变化时不要据此断言 Provider 失效。data explain 的 runtimeEvaluated=false 只证明离线计划，export-data-driver-report 只证明接口准备，均不等于 uniform 数值读回。

## 动手练习 {#exercise}

在副本把 rain 的 clamp 上限改为 0.5，保持 literal.type=float；观察雨天变化。再将 day.frequency 改成 generation，确认工具拒绝后恢复。记录同一世界的时间/天气条件，不用两张不同时间的截图宣称性能或精确数值。

[custom-data](/reference/custom-data) · [bindings](/reference/bindings) · [catalog](/reference/catalog)

[下一章: 07 · 稳定内容与材质表](/tutorial/07-materials)
