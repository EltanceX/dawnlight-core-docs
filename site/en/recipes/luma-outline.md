---
title: "Luminance outline: limits of local contrast"
description: "Luminance outline: limits of local contrast: steps, exact inputs, expected results and evidence limits."
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
      path: examples/features/luma-outline/shaderpack.json
    - repository: website
      path: metadata/w7-examples-validation.json
    - repository: website
      path: metadata/w7-runtime.json
  example: features/luma-outline
  verification:
    static: passed
    driverStatus: notProvided
    runtimeEvaluated: false
    liveWorldVerified: false
    visual: notRun
---

# Luminance outline: limits of local contrast {#overview}

<BaselineNote />

A basic effect you can independently download, toggle, validate and modify using pinned public contracts.

## Algorithm and visible result {#algorithm}

Use (0.2126,0.7152,0.0722) as a luminance approximation of the current RGB values and compare the center with four neighbors one input pixel away. Pass the maximum difference through smoothstep(0.08,0.20) and mix dark ink. Texture detail may become edges, while equal-luminance silhouettes may disappear. This has no depth/normal/object IDs or temporal stabilization and is not a geometry outline.

## Resource flow and switch {#flow}

<div class="course-flow">scene/color → [grade on: effect → post/color] → one present → screen</div>

The three packs are independent. Each uses four BuiltIn Terrain routes and copies no host shader. practice:grade selects the full effect closure; practice:strength is a Program define and recompiles. Prerequisite: [independent pack course](/en/tutorial/05-options).

<CourseBranchNote example="features/luma-outline" />

## Nominal cost and disabled behavior {#cost}

Five effect samples per pixel plus one present sample, with a separate 4WH-byte RGBA8 intermediate. Radius is one input pixel, so higher resolution makes the line thinner on screen and motion may shimmer. For geometry outlines first implement MRT encoding/decoding and category validity, then study ToonLab without assuming a fixed host G-buffer.

WH is render pixel count. At 1920×1080, 4WH is about 7.91 MiB, excluding base color/depth, alignment and driver overhead. These are logical capacity/sample estimates, not measured VRAM or milliseconds.

## Complete download and source {#download}

[Complete ZIP, inventory and receipt](/en/examples/practice-luma-outline#download). Extract into shaderpacks/w7-luma-outline/ and run /switchshader w7-luma-outline in a creative world. Apply settings at U → Options → Effect practice. All source is included below; no other example directory is required.

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/features/luma-outline/shaderpack.json

</details>

<details>
<summary>settings.json</summary>

<<< @/../examples/features/luma-outline/settings.json

</details>

<details>
<summary>shaders/fullscreen.vsh</summary>

<<< @/../examples/features/luma-outline/shaders/fullscreen.vsh{glsl}

</details>

<details>
<summary>shaders/grade.psh</summary>

<<< @/../examples/features/luma-outline/shaders/grade.psh{glsl}

</details>

<details>
<summary>shaders/present.psh</summary>

<<< @/../examples/features/luma-outline/shaders/present.psh{glsl}

</details>

## Static checks and runtime scope {#verification}

```powershell
shaderpack-analyzer.exe pack validate . --format json
shaderpack-analyzer.exe scene explain . --include-inactive --format json
shaderpack-analyzer.exe graph dump . --contract 2 --include-inactive
shaderpack-analyzer.exe program interface . --program practice:post/grade --contract 2
shaderpack-analyzer.exe program interface . --program practice:post/present --contract 2
```

Default, grade-off and strength-max were checked on source and fresh ZIP. The CLI graph command above checks defaults only; branch graphs use explicit JSON-RPC inputs.options.

<PracticeRuntimeNote example="features/luma-outline" />

## Exercise and troubleshooting {#exercise}

Change one algorithm constant, save and reload the same pack, recording the new source identity. Compare the toggle with strength=0. If output turns black, disable the effect and follow [symptom diagnosis](/en/troubleshooting/). Retain /switchshader builtin as the recovery path.
