---
title: 06 · Time, weather and custom data
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

# 06 · Time, weather and custom data {#chapter}

<BaselineNote />

Respond to public day and precipitation inputs and add exposure gain as a typed uniform. Prerequisites: chapter 05, GLSL uniforms and JSON expression trees. Distinguish generation/frame/view frequency and planned data from evaluated data.

## Changes and complete download {#changes}

Add customData.abiVersion=1 and three float variables: gain/day/rain. The grade command connects them to u_gain/u_day/u_rain through customBindings. gain has uniform impact, while strength remains a define so the two paths can be compared.

[Previous chapter download](/en/examples/05-options#download) · [This complete ZIP, source inventory and receipt](/en/examples/06-custom-data#download)

## Resource flow {#resource-flow}

<div class="course-flow">day_time@1 + weather_precipitation@1 + gain option → typed variables → customBindings → grade shader → post/color → present</div>

gain reads an option at generation frequency with explicit as=float. day reads dawnlight:data/day_time@1 each frame with day_fraction units. rain reads weather_precipitation@1 each frame and clamps three float arguments to 0–1 with dimensionless units. Defaults are 1, 0.5 and 0, with onError=useDefault. Defaults do not legalize unknown inputs or invalid types.

daylight=0.5+0.5*sin(2π*(day-0.25)) controls the grade’s cool/warm weight. Precipitation reduces the warm red channel and gain scales brightness. This does not replace sunlight or sky rendering and is not physical exposure. Disabling grade removes active consumers of these three variables; declarations still participate in AST, type and budget validation.

A frame input cannot be placed in a generation variable. View matrices require view frequency and matching spaces; this chapter does not use them. Each uniform must be a scalar float with the exact bound symbol, not float[1]. The pack uses public inputs without private C# hooks or redefining host semantics. See the reference for all 23 current inputs.

## Active branch matrix {#branches}

<CourseBranchNote example="course/06-custom-data" />

## Complete shader sources {#shader-sources}

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

## Complete Manifest and settings {#complete-manifest}

<details>
<summary>settings.json</summary>

<<< @/../examples/course/06-custom-data/settings.json

</details>

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/course/06-custom-data/shaderpack.json

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
& $analyzer data explain . --format json
```

These graph CLI commands check defaults. The committed branch receipt uses JSON-RPC with explicit inputs.options; see the branch table and [maintenance procedure](https://github.com/EltanceX/dawnlight-core-docs/blob/main/docs/maintenance/CoursePacks.zh-CN.md).

<PackRuntimeNote example="course/06-custom-data" />

## Troubleshooting {#troubleshooting}

For DLDATA diagnostics, check input ID/version/type/unit, then frequency and consumer availability. If the image looks unchanged, apply gain=1.2 with grade enabled. Unchanging weather or time does not demonstrate Provider failure. data explain with runtimeEvaluated=false describes a plan. export-data-driver-report records prepared interfaces; neither is a numeric uniform readback.

## Exercise {#exercise}

In a copy, lower rain’s clamp upper bound to 0.5, retaining literal.type=float, and observe rainy conditions. Change day.frequency to generation, confirm rejection and restore it. Record time/weather conditions in the same world; screenshots at different times cannot establish exact numeric behavior or performance.

[custom-data](/en/reference/custom-data) · [bindings](/en/reference/bindings) · [catalog](/en/reference/catalog)

[Next chapter: 07 · Stable content and materials](/en/tutorial/07-materials)
