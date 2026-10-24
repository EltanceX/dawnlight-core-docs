---
title: 10 · 验证与分发
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
      path: examples/course/10-distribution/shaderpack.json
    - repository: website
      path: metadata/w6-examples-validation.json
    - repository: website
      path: metadata/w6-runtime.json
  example: course/10-distribution
  verification:
    static: passed
    driverStatus: notProvided
    runtimeEvaluated: false
    liveWorldVerified: false
    visual: notRun
---

# 10 · 验证与分发 {#chapter}

<BaselineNote />

将完整 Amber 包交给另一个作者，并能从零解压、验证、加载与退回 BuiltIn。前置：09。完成后形成带文件清单、哈希、运行范围和已知限制的分发包。

## 本章修改与完整包 {#changes}

保留 09 的运行功能与 fragment 结构，建立独立 10-distribution 身份和完整 README。ZIP 包含全部源文件及三个预设，不附带宿主二进制、工具、Mod、存档、WorldFinal 或原始驱动日志。下载页提供独立 inventory 与静态收据。

[上一章完整下载](/examples/09-complete-pack#download) · [本章完整 ZIP、源码清单与收据](/examples/10-distribution#download)

## 资源流 {#resource-flow}

<div class="course-flow">registered source bytes → deterministic ZIP + inventory → fresh extraction → static branch checks → actual game lifecycle → documented distribution</div>

第一步：下载完整 ZIP 和 inventory，在 PowerShell 用 Get-FileHash -Algorithm SHA256 核对下载页哈希。解压到一个新目录，确认 shaderpack.json 直接在根。按 inventory 核对每个文件的路径、长度和 SHA-256；不要只检查根 JSON。这里的 source fingerprint、ZIP hash 与 Loader manifestHash 分别描述源码字节、压缩包与解析后合同。

第二步：运行 pack、scene、各 Program interface、data/materials 与带选项的 graph 分支验证。至少覆盖默认、grade-off、glow-off、all-off、strength-max 与 economy。CLI graph dump 只验证默认配置；本网站脚本通过 JSON-RPC dawnlight/dumpGraph 的 inputs.options 逐分支解析。打开 includeInactive 时，图保留非活动声明，统计必须过滤 active=true。

第三步：在兼容宿主的创造测试世界加载，应用各预设，改一次 gain/strength，重载同名包，改变真实窗口尺寸，导出 driver/data report，再切回 BuiltIn。对同一世界 content-export 后执行材料解析；driverStatus=matched 只证明报告身份/接口匹配，仍需观察实际画面。保存测试版本、GPU、API、尺寸、条件与失败回退结果。

本轮复现由代理在隔离游戏副本中执行，不等于独立人类新手测试。下方运行记录绑定本章最终 ZIP 及源码指纹，并列明实际完成项；Android、VR、多 view、设备丢失恢复、其他驱动和性能门仍需专项验收。分发教学包不代表满足上游 release publish 的 P11 acceptance matrix。

## 活动分支矩阵 {#branches}

<CourseBranchNote example="course/10-distribution" />

## 预设配方 {#presets}

| 配方 | grade | glow | strength | gain |
| --- | --- | --- | --- | --- |
| balanced | true | true | 0.65 | 1.0 |
| economy | true | false | 0.4 | 1.0 |
| neutral | false | false | 0.65 | 1.0 |

## 完整着色器 {#shader-sources}

<details>
<summary>shaders/fullscreen.vsh</summary>

<<< @/../examples/course/10-distribution/shaders/fullscreen.vsh{glsl}

</details>

<details>
<summary>shaders/glow.psh</summary>

<<< @/../examples/course/10-distribution/shaders/glow.psh{glsl}

</details>

<details>
<summary>shaders/grade.psh</summary>

<<< @/../examples/course/10-distribution/shaders/grade.psh{glsl}

</details>

<details>
<summary>shaders/present.psh</summary>

<<< @/../examples/course/10-distribution/shaders/present.psh{glsl}

</details>

<details>
<summary>shaders/terrain.psh</summary>

<<< @/../examples/course/10-distribution/shaders/terrain.psh{glsl}

</details>

<details>
<summary>shaders/terrain.vsh</summary>

<<< @/../examples/course/10-distribution/shaders/terrain.vsh{glsl}

</details>

## 完整 Manifest 与设置 {#complete-manifest}

<details>
<summary>manifest/data.json</summary>

<<< @/../examples/course/10-distribution/manifest/data.json

</details>

<details>
<summary>manifest/options.json</summary>

<<< @/../examples/course/10-distribution/manifest/options.json

</details>

<details>
<summary>manifest/passes.json</summary>

<<< @/../examples/course/10-distribution/manifest/passes.json

</details>

<details>
<summary>manifest/programs.json</summary>

<<< @/../examples/course/10-distribution/manifest/programs.json

</details>

<details>
<summary>manifest/resources.json</summary>

<<< @/../examples/course/10-distribution/manifest/resources.json

</details>

<details>
<summary>presets/balanced.json</summary>

<<< @/../examples/course/10-distribution/presets/balanced.json

</details>

<details>
<summary>presets/economy.json</summary>

<<< @/../examples/course/10-distribution/presets/economy.json

</details>

<details>
<summary>presets/neutral.json</summary>

<<< @/../examples/course/10-distribution/presets/neutral.json

</details>

<details>
<summary>settings.json</summary>

<<< @/../examples/course/10-distribution/settings.json

</details>

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/course/10-distribution/shaderpack.json

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

<PackRuntimeNote example="course/10-distribution" />

## 常见卡点 {#troubleshooting}

能加载但画面不对：检查当前选择是否真是 External、是否回退了 BuiltIn，比较 manifest/source/generation identity。ZIP 新增了文件却哈希不变：你可能下载或运行了旧 URL。材质 driver 报告过期：重新从同世界、同 generation 导出；不能拿 Scene contract v1 报告冒充 Data contract v2。

## 动手练习 {#exercise}

让另一位作者仅凭本章 ZIP 与 README 完成流程，记录卡住的步骤；与本次代理复现分开登记。发布你自己的改版时使用新的 ID/version 和新指纹下载 URL，保留旧课程包身份；补充你的宿主与硬件验收范围。

## README {#readme}

<details>
<summary>README.md</summary>

<<< @/../examples/course/10-distribution/README.md

</details>

[tool-contracts](/reference/tool-contracts) · [materials](/reference/materials) · [programs](/reference/programs)

[完整运行记录与限制](/tutorial/pack-runtime)
