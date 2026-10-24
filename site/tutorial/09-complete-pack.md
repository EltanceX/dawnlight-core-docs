---
title: 09 · 组合独立光影包
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
      path: examples/course/09-complete-pack/shaderpack.json
    - repository: website
      path: metadata/w6-examples-validation.json
    - repository: website
      path: metadata/w6-runtime.json
  example: course/09-complete-pack
  verification:
    static: passed
    driverStatus: notProvided
    runtimeEvaluated: false
    liveWorldVerified: false
    visual: notRun
---

# 09 · 组合独立光影包 {#chapter}

<BaselineNote />

把前四章的功能收敛为 Amber 独立光影包：轻微暖对比、昼夜/降水权重、石沙材质响应和可选柔光。前置：08。完成后能维护 fragment 边界、复现预设，并为缺失 Mod 内容提供 fallback。

## 本章修改与完整包 {#changes}

根 shaderpack.json 保留身份、shaderRoot、settings、frameTarget、sourceFormatVersion=1 与 fragments 顺序列表。options/resources/programs/passes 分别放进 manifest/，sceneCategories 跟随 passes；materials/customData 放在 data.json。新增三个完整选项预设和可选 Mod selector。

[上一章完整下载](/examples/08-post-chain#download) · [本章完整 ZIP、源码清单与收据](/examples/09-complete-pack#download)

## 资源流 {#resource-flow}

<div class="course-flow">shaderpack.json → manifest/{options,resources,programs,passes,data}.json → one immutable descriptor → selected active chain → Amber</div>

fragment 是声明组合，不是补丁：数组按根列出的顺序拼接，重复 ID 仍失败。settings 与 frameTarget 只属于根；当前组合式 v5 根不接受 sceneCategories，需放在 fragment。shader 文件相对根 shaderRoot，不随 fragment 所在目录改变。把所有 fragment、设置和 shader 一起打包，缺一个都不能用另一章补齐。

balanced 使用默认值；economy 保留 grade、关闭 glow、strength=0.4；neutral 关闭 grade/glow。presets/*.json 是 Analyzer 的选项覆盖文件和设置配方，当前宿主不会自动识别为预设菜单。按表在光影设置中应用相同值；number 选项即使数值为整数，也在覆盖 JSON 中保留 1.0，避免 Integer/Number 不匹配警告。

amberdemo:MarbleBlock 是虚构的 Mod 接入点，priority=20、onMissing=skip；不要求安装任何 Mod。缺失时跳过 mapping，其他未匹配内容进入 course:neutral。若要接真实 Mod，应先从本世界 WorldFinal 快照取得 logical/effective ID 与 owner，再修改 selector；不得按相似类名猜测内容身份。economy 只裁剪后处理，opaque 的材质表仍存在；完全恢复宿主画面用 BuiltIn。

## 活动分支矩阵 {#branches}

<CourseBranchNote example="course/09-complete-pack" />

## 预设配方 {#presets}

| 配方 | grade | glow | strength | gain |
| --- | --- | --- | --- | --- |
| balanced | true | true | 0.65 | 1.0 |
| economy | true | false | 0.4 | 1.0 |
| neutral | false | false | 0.65 | 1.0 |

## 完整着色器 {#shader-sources}

<details>
<summary>shaders/fullscreen.vsh</summary>

<<< @/../examples/course/09-complete-pack/shaders/fullscreen.vsh{glsl}

</details>

<details>
<summary>shaders/glow.psh</summary>

<<< @/../examples/course/09-complete-pack/shaders/glow.psh{glsl}

</details>

<details>
<summary>shaders/grade.psh</summary>

<<< @/../examples/course/09-complete-pack/shaders/grade.psh{glsl}

</details>

<details>
<summary>shaders/present.psh</summary>

<<< @/../examples/course/09-complete-pack/shaders/present.psh{glsl}

</details>

<details>
<summary>shaders/terrain.psh</summary>

<<< @/../examples/course/09-complete-pack/shaders/terrain.psh{glsl}

</details>

<details>
<summary>shaders/terrain.vsh</summary>

<<< @/../examples/course/09-complete-pack/shaders/terrain.vsh{glsl}

</details>

## 完整 Manifest 与设置 {#complete-manifest}

<details>
<summary>manifest/data.json</summary>

<<< @/../examples/course/09-complete-pack/manifest/data.json

</details>

<details>
<summary>manifest/options.json</summary>

<<< @/../examples/course/09-complete-pack/manifest/options.json

</details>

<details>
<summary>manifest/passes.json</summary>

<<< @/../examples/course/09-complete-pack/manifest/passes.json

</details>

<details>
<summary>manifest/programs.json</summary>

<<< @/../examples/course/09-complete-pack/manifest/programs.json

</details>

<details>
<summary>manifest/resources.json</summary>

<<< @/../examples/course/09-complete-pack/manifest/resources.json

</details>

<details>
<summary>presets/balanced.json</summary>

<<< @/../examples/course/09-complete-pack/presets/balanced.json

</details>

<details>
<summary>presets/economy.json</summary>

<<< @/../examples/course/09-complete-pack/presets/economy.json

</details>

<details>
<summary>presets/neutral.json</summary>

<<< @/../examples/course/09-complete-pack/presets/neutral.json

</details>

<details>
<summary>settings.json</summary>

<<< @/../examples/course/09-complete-pack/settings.json

</details>

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/course/09-complete-pack/shaderpack.json

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
& $analyzer program interface . --program course:post/glow --contract 2
& $analyzer data explain . --format json
& $analyzer materials explain . --format json
& $analyzer scene explain . --options presets/economy.json --include-inactive --format json
& $analyzer data explain . --options presets/economy.json --format json
```

以上 graph CLI 命令只检查默认值。已提交分支收据使用显式 inputs.options 的 JSON-RPC，见上表和[维护流程](https://github.com/EltanceX/dawnlight-core-docs/blob/main/docs/maintenance/CoursePacks.zh-CN.md)。

实际映射需加载世界后运行 `/switchshader content-export`，将该文件以 `--content-snapshot world-final.json` 传给 materials explain。用 `/switchshader export-data-driver-report` 导出 Data 接口证据；世界快照保留在本地。

<PackRuntimeNote example="course/09-complete-pack" />

## 常见卡点 {#troubleshooting}

重复 ID：fragment 不覆盖已有定义，定位重复来源并保留一个。找不到 shader：仍以 shaderRoot 为根检查路径。UI 候选失败：所有 option 必须恰好被 control/hiddenOptions 覆盖。找不到 Mod：本例 skip 是预期；若你需要强依赖，改成 error 并在分发说明中写明。

## 动手练习 {#exercise}

从新 ZIP 按 economy 配方加载，核对只剩一个全尺寸后处理目标。把 fictional selector 换成自己 WorldFinal 中真实存在的稳定 ID，观察匹配后还原。拆出另一 fragment 时，确认源码与 ZIP 两套检查都通过，且没有给 root 增加不支持的字段。

[manifest](/reference/manifest) · [materials](/reference/materials) · [settings-ui](/reference/settings-ui)

[下一章: 10 · 验证与分发](/tutorial/10-distribution)
