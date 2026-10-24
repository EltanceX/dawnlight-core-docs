---
title: 08 · A post chain and its cost
description: Build, validate and distribute the complete independent Amber shader pack, with authoritative source and bounded runtime evidence.
lang: en-US
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

# 08 · A post chain and its cost {#chapter}

<BaselineNote />

Add a separate half-resolution glow after grading and validate three output paths. Prerequisites: chapter 07, separate read/write resources from chapter 02 and viewport sizing. Estimate nominal capacity and explain the quality/cost tradeoff.

## Changes and complete download {#changes}

Add a course:post/glow RGBA8 texture with size.scale=[0.5,0.5], a glow Program/Pass and present-glow. Glow is active only with grade=true and glow=true. grade=false always selects present-raw even if glow remains true. grade=true/glow=false selects present-grade.

[Previous chapter download](/en/examples/07-materials#download) · [This complete ZIP, source inventory and receipt](/en/examples/08-post-chain#download)

## Resource flow {#resource-flow}

<div class="course-flow">scene/color → grade → post/color (W×H) → [glow on: 5 taps → post/glow (W/2×H/2)] → one present → screen</div>

grade writes post/color. glow samples it into a distinct post/glow, which present reads. Sampling the same subresource being written would create framebuffer feedback. glow orders after grade and present-glow after glow. Pass inputs/outputs must agree with bindings and targets.

The shader uses textureSize for input pixel spacing and samples the center plus four neighbors. It adds the part of blur above 0.55 at strength 0.16. Execution occurs in the half-size target before screen upsampling, so disabling glow preserves more sharpness. This is LDR teaching glow: RGBA8 has already clipped HDR range. It is not HDR bloom, physical exposure or a separable blur chain.

Ignoring rounding, the full-size post/color adds 4WH bytes and half-size post/glow adds WH. Scene color uses another 4WH; actual depth24 storage and driver alignment are separate. Glow performs about 5×WH/4 texture samples plus present upsampling. These are theoretical counts, not measured milliseconds. Disabling grade removes both post textures and their Programs/commands, while opaque still consumes materialTable.

## Active branch matrix {#branches}

<CourseBranchNote example="course/08-post-chain" />

## Complete shader sources {#shader-sources}

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

## Complete Manifest and settings {#complete-manifest}

<details>
<summary>settings.json</summary>

<<< @/../examples/course/08-post-chain/settings.json

</details>

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/course/08-post-chain/shaderpack.json

</details>

## Validation and game observations {#verification}

Extract into a new direct child of shaderpacks. From that pack root, use the pinned Analyzer installed in environment setup. Zero diagnostics and exit code 0 are expected. With materials but no world snapshot, deferred mapping is expected. Apply the settings inside a creative world, reload, resize and restore BuiltIn.

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

These graph CLI commands check defaults. The committed branch receipt uses JSON-RPC with explicit inputs.options; see the branch table and [maintenance procedure](https://github.com/EltanceX/dawnlight-core-docs/blob/main/docs/maintenance/CoursePacks.zh-CN.md).

For actual mapping, load the world, run `/switchshader content-export`, and pass that file as `--content-snapshot world-final.json` to materials explain. Export `/switchshader export-data-driver-report` for Data interface comparison. Keep the world snapshot private.

<PackRuntimeNote example="course/08-post-chain" />

## Troubleshooting {#troubleshooting}

Persistent blur with glow disabled calls for checking that present-grade reads post/color. Black or stretched output after resizing calls for viewport sizing, the two-component scale and viewport.source=target. Ensure targets rebuild with the view instead of relying on an absolute size that happens to match once. Missing or duplicate output means the three present conditions may overlap or leave a gap.

## Exercise {#exercise}

Predict all four grade/glow combinations and validate default, glow-off, grade-off and all-off. Change scale to [1,1], compare sharpness and compute extra capacity. Keep screenshots and dimensions; collect a separate performance measurement before discussing frame time.

[resources](/en/reference/resources) · [passes](/en/reference/passes) · [commands](/en/reference/commands)

[Next chapter: 09 · Compose an independent pack](/en/tutorial/09-complete-pack)
