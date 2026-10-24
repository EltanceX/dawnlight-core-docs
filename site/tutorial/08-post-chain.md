---
title: 08 · 多级后处理与成本
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
      path: examples/course/08-post-chain/shaderpack.json
    - repository: website
      path: metadata/w6-examples-validation.json
    - repository: website
      path: metadata/w6-runtime.json
  example: course/08-post-chain
  verification:
    static: passed
    driverStatus: notProvided
    runtimeEvaluated: false
    liveWorldVerified: false
    visual: notRun
---

# 08 · 多级后处理与成本 {#chapter}

<BaselineNote />

在调色之后增加独立半分辨率柔光，并正确验证三种输出路径。前置：07、02 的独立读写资源、viewport 尺寸。完成后能计算标称容量并解释“低分辨率”对质量和开销的影响。

## 本章修改与完整包 {#changes}

新增 course:post/glow RGBA8、size.scale=[0.5,0.5]、glow Program/Pass 和 present-glow。grade=true 且 glow=true 才活动；grade=false 一律走 present-raw，即使 glow 开关仍为 true。grade=true/glow=false 走 present-grade。

[上一章完整下载](/examples/07-materials#download) · [本章完整 ZIP、源码清单与收据](/examples/08-post-chain#download)

## 资源流 {#resource-flow}

<div class="course-flow">scene/color → grade → post/color (W×H) → [glow on: 5 taps → post/glow (W/2×H/2)] → one present → screen</div>

grade 写 post/color，glow 采样 post/color 并写另一张 post/glow，present 再读取后者。不可让 glow 采样它正在写入的同一子资源，否则会形成 framebuffer feedback。glow 的 ordering.after=grade，present-glow.after=glow；资源 inputs/outputs 与 binding、targets 一起变化。

shader 使用 textureSize 得到输入像素步长，中心与上下左右共五次采样，提取 blur>0.55 的部分并以 0.16 加到中心。输出在半尺寸目标执行，再放大到屏幕，因此关闭 glow 会更锐利。这是 LDR 教学柔光，RGBA8 已截断高动态范围；它不等于 HDR bloom、物理曝光或真正的分离模糊。

忽略取整时，额外全尺寸 post/color 为 4WH 字节，半尺寸 post/glow 为 WH 字节；场景颜色另有 4WH，depth24 的实际驱动存储/对齐另计。柔光约做 5×WH/4 次纹理采样，再加 present 放大；这些是理论计数，不是毫秒测量。关闭 grade 同时删除两张 post 纹理与对应 Program/commands；materialTable 仍被 opaque 使用。

## 活动分支矩阵 {#branches}

<CourseBranchNote example="course/08-post-chain" />

## 完整着色器 {#shader-sources}

<details>
<summary>shaders/fullscreen.vsh</summary>

<<< @/../examples/course/08-post-chain/shaders/fullscreen.vsh{glsl}

</details>

<details>
<summary>shaders/glow.psh</summary>

<<< @/../examples/course/08-post-chain/shaders/glow.psh{glsl}

</details>

<details>
<summary>shaders/grade.psh</summary>

<<< @/../examples/course/08-post-chain/shaders/grade.psh{glsl}

</details>

<details>
<summary>shaders/present.psh</summary>

<<< @/../examples/course/08-post-chain/shaders/present.psh{glsl}

</details>

<details>
<summary>shaders/terrain.psh</summary>

<<< @/../examples/course/08-post-chain/shaders/terrain.psh{glsl}

</details>

<details>
<summary>shaders/terrain.vsh</summary>

<<< @/../examples/course/08-post-chain/shaders/terrain.vsh{glsl}

</details>

## 完整 Manifest 与设置 {#complete-manifest}

<details>
<summary>settings.json</summary>

<<< @/../examples/course/08-post-chain/settings.json

</details>

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/course/08-post-chain/shaderpack.json

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
```

以上 graph CLI 命令只检查默认值。已提交分支收据使用显式 inputs.options 的 JSON-RPC，见上表和[维护流程](https://github.com/EltanceX/dawnlight-core-docs/blob/main/docs/maintenance/CoursePacks.zh-CN.md)。

实际映射需加载世界后运行 `/switchshader content-export`，将该文件以 `--content-snapshot world-final.json` 传给 materials explain。用 `/switchshader export-data-driver-report` 导出 Data 接口证据；世界快照保留在本地。

<PackRuntimeNote example="course/08-post-chain" />

## 常见卡点 {#troubleshooting}

关闭 glow 后仍模糊：核对 present-grade 是否读取 post/color。调整窗口后黑屏或拉伸：检查 size.mode=viewport、scale 二元组与 viewport.source=target，并确认目标随实际视图重建。不要用绝对大小纹理碰巧匹配一次窗口。重叠或缺少输出：检查三个 present 条件是否互斥且穷尽。

## 动手练习 {#exercise}

预测四个 grade/glow 布尔组合，再验证默认、glow-off、grade-off、all-off 分支。将 scale 改为 [1,1] 比较清晰度并计算额外容量；保留截图与窗口尺寸，单独进行性能测量后才讨论帧时间。

[resources](/reference/resources) · [passes](/reference/passes) · [commands](/reference/commands)

[下一章: 09 · 组合独立光影包](/tutorial/09-complete-pack)
