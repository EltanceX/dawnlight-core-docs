---
title: "Color balance: one-sample LDR adjustment"
description: "Color balance: one-sample LDR adjustment: steps, exact inputs, expected results and evidence limits."
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
      path: examples/features/color-balance/shaderpack.json
    - repository: website
      path: metadata/w7-examples-validation.json
    - repository: website
      path: metadata/w7-runtime.json
  example: features/color-balance
  verification:
    static: passed
    driverStatus: notProvided
    runtimeEvaluated: false
    liveWorldVerified: false
    visual: notRun
---

# Color balance: one-sample LDR adjustment {#overview}

<BaselineNote />

A basic effect you can independently download, toggle, validate and modify using pinned public contracts.

## Algorithm and visible result {#algorithm}

Increase contrast by 12% around 0.5, multiply by (1.05,1.0,0.94), mix with the original using strength and clamp to [0,1]. This is an explicit artistic convention, not automatic sRGB decoding or HDR exposure. Confirm the scene color encoding before reuse; another gamma operation outside this chain can double-convert it.

## Resource flow and switch {#flow}

<div class="course-flow">scene/color → [grade on: effect → post/color] → one present → screen</div>

The three packs are independent. Each uses four BuiltIn Terrain routes and copies no host shader. practice:grade selects the full effect closure; practice:strength is a Program define and recompiles. Prerequisite: [independent pack course](/en/tutorial/05-options).

<CourseBranchNote example="features/color-balance" />

## Nominal cost and disabled behavior {#cost}

The effect reads scene color once per pixel, followed by one present sample. The separate RGBA8 intermediate has nominal capacity 4WH bytes. Disabling grade removes that texture, Program and command from the active closure. Scene color/depth and four BuiltIn routes remain.

WH is render pixel count. At 1920×1080, 4WH is about 7.91 MiB, excluding base color/depth, alignment and driver overhead. These are logical capacity/sample estimates, not measured VRAM or milliseconds.

## Complete download and source {#download}

[Complete ZIP, inventory and receipt](/en/examples/practice-color-balance#download). Extract into shaderpacks/w7-color-balance/ and run /switchshader w7-color-balance in a creative world. Apply settings at U → Options → Effect practice. All source is included below; no other example directory is required.

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/features/color-balance/shaderpack.json

</details>

<details>
<summary>settings.json</summary>

<<< @/../examples/features/color-balance/settings.json

</details>

<details>
<summary>shaders/fullscreen.vsh</summary>

<<< @/../examples/features/color-balance/shaders/fullscreen.vsh{glsl}

</details>

<details>
<summary>shaders/grade.psh</summary>

<<< @/../examples/features/color-balance/shaders/grade.psh{glsl}

</details>

<details>
<summary>shaders/present.psh</summary>

<<< @/../examples/features/color-balance/shaders/present.psh{glsl}

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

<PracticeRuntimeNote example="features/color-balance" />

## Exercise and troubleshooting {#exercise}

Change one algorithm constant, save and reload the same pack, recording the new source identity. Compare the toggle with strength=0. If output turns black, disable the effect and follow [symptom diagnosis](/en/troubleshooting/). Retain /switchshader builtin as the recovery path.
