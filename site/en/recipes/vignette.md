---
title: "Vignette: dimensions and aspect ratio"
description: "Vignette: dimensions and aspect ratio: steps, exact inputs, expected results and evidence limits."
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
      path: examples/features/vignette/shaderpack.json
    - repository: website
      path: metadata/w7-examples-validation.json
    - repository: website
      path: metadata/w7-runtime.json
  example: features/vignette
  verification:
    static: passed
    driverStatus: notProvided
    runtimeEvaluated: false
    liveWorldVerified: false
    visual: notRun
---

# Vignette: dimensions and aspect ratio {#overview}

<BaselineNote />

A basic effect you can independently download, toggle, validate and modify using pinned public contracts.

## Algorithm and visible result {#algorithm}

Center UV, multiply X by texture aspect ratio, measure radial length and form a smoothstep(0.22,0.82) mask. Multiply brightness by (1−0.65×strength×mask). Extent comes from the actual input texture, so resize needs no hardcoded resolution. Wider images naturally darken more at the sides. This is not a photographic lens simulation.

## Resource flow and switch {#flow}

<div class="course-flow">scene/color → [grade on: effect → post/color] → one present → screen</div>

The three packs are independent. Each uses four BuiltIn Terrain routes and copies no host shader. practice:grade selects the full effect closure; practice:strength is a Program define and recompiles. Prerequisite: [independent pack course](/en/tutorial/05-options).

<CourseBranchNote example="features/vignette" />

## Nominal cost and disabled behavior {#cost}

One texture read plus radial ALU, a 4WH-byte intermediate and another present sample. There is no half-resolution chain or history. Disabling the effect removes its intermediate. strength=0 keeps the enabled branch and draw; a zero parameter is not resource release.

WH is render pixel count. At 1920×1080, 4WH is about 7.91 MiB, excluding base color/depth, alignment and driver overhead. These are logical capacity/sample estimates, not measured VRAM or milliseconds.

## Complete download and source {#download}

[Complete ZIP, inventory and receipt](/en/examples/practice-vignette#download). Extract into shaderpacks/w7-vignette/ and run /switchshader w7-vignette in a creative world. Apply settings at U → Options → Effect practice. All source is included below; no other example directory is required.

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/features/vignette/shaderpack.json

</details>

<details>
<summary>settings.json</summary>

<<< @/../examples/features/vignette/settings.json

</details>

<details>
<summary>shaders/fullscreen.vsh</summary>

<<< @/../examples/features/vignette/shaders/fullscreen.vsh{glsl}

</details>

<details>
<summary>shaders/grade.psh</summary>

<<< @/../examples/features/vignette/shaders/grade.psh{glsl}

</details>

<details>
<summary>shaders/present.psh</summary>

<<< @/../examples/features/vignette/shaders/present.psh{glsl}

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

<PracticeRuntimeNote example="features/vignette" />

## Exercise and troubleshooting {#exercise}

Change one algorithm constant, save and reload the same pack, recording the new source identity. Compare the toggle with strength=0. If output turns black, disable the effect and follow [symptom diagnosis](/en/troubleshooting/). Retain /switchshader builtin as the recovery path.
