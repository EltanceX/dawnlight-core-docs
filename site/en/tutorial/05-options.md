---
title: 05 · Options and settings
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

# 05 · Options and settings {#chapter}

<BaselineNote />

Make grading genuinely optional and expose its strength in settings. Prerequisites: chapter 04 target topology, chapter 02 producers/readers and chapter 03 Terrain routes. Explain how one switch changes the active Program, resource and command closure.

## Changes and complete download {#changes}

Continue from the chapter 03 color pipeline. Remove chapter 04’s RT1/RT2 teaching attachments: frameTarget and opaque return to RT0 + depth. Keep the complete Terrain vertex declaration. Add settings.json, a grade switch, a strength define and two mutually exclusive present Passes. The previous ZIP is useful for comparison; this ZIP is self-contained.

[Previous chapter download](/en/examples/04-mrt#download) · [This complete ZIP, source inventory and receipt](/en/examples/05-options#download)

## Resource flow {#resource-flow}

<div class="course-flow">Terrain + world → scene/color + scene/depth → [grade=true: grade → post/color → present-grade] / [grade=false: present-raw] → screen</div>

course:grade declares pipeline/resources impact. grade and present-grade require grade=true; present-raw requires false. Disabling only the producer while keeping present reading post/color would leave an unwritten resource. Ordering belongs to the matching chain; the disabled branch has no dependency on grade.

course:strength is a number in 0–1 with program impact, injected through defines.GRADE_STRENGTH. float(GRADE_STRENGTH) accepts the endpoint compilation literals. A compile-time constant requires recompilation; the next chapter supplies a data-driven uniform. Impact describes invalidation, without promising a particular update cost.

Press **U**, choose **Options**, and edit the authored **Amber course** page. Settings UI presents Manifest options: exactly one control per option, without changing its type, hard bounds or default. The strength slider uses UI enabledWhen to disable editing while grading is off. This is separate from rendering conditions. Apply the settings and wait for frame-boundary publication; check failures while retaining the previous valid generation.

## Active branch matrix {#branches}

<CourseBranchNote example="course/05-options" />

## Complete shader sources {#shader-sources}

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

## Complete Manifest and settings {#complete-manifest}

<details>
<summary>settings.json</summary>

<<< @/../examples/course/05-options/settings.json

</details>

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/course/05-options/shaderpack.json

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

<PackRuntimeNote example="course/05-options" />

## Troubleshooting {#troubleshooting}

Black output after disabling: check that present-raw binds and declares scene/color. Exactly one present must be active. An unchanged slider result calls for Apply and a check of the define option ID and impact. UI enabledWhen cannot replace a Pass condition.

## Exercise {#exercise}

Apply grade=false/true and strength=0.0/1.0. Predict the resource count before checking the branch table. In a copy, deliberately point present-raw at post/color, observe validation failure and restore it. Explain why a declared resource is different from an active allocation.

[options](/en/reference/options) · [settings-ui](/en/reference/settings-ui) · [programs](/en/reference/programs)

[Next chapter: 06 · Time, weather and custom data](/en/tutorial/06-custom-data)
