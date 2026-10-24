---
title: 02 · Add a separate post-process resource
description: From a complete pack to a reproducible effect, with source, resource flow, troubleshooting and bounded evidence.
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
      path: examples/course/02-resources/shaderpack.json
  example: course/02-resources
  verification:
    static: passed
    driverStatus: notProvided
    runtimeEvaluated: false
    liveWorldVerified: false
    visual: notRun
---

# 02 · Add a separate post-process resource {#chapter}

<BaselineNote />

Move grading into a separate fullscreen command and identify a resource’s writer, readers and execution order. Prerequisites: 01 and [resources, targets and drawBuffers](../concepts/resources-targets).

## Changes and complete snapshot {#changes}

Add course:post/color (viewport / persistent / rgba8), grade.psh, a grade Program and Pass. Present now reads post/color. The complete pack has 3 textures, 6 commands and 2 pack-owned Programs.

[Download and inspect all files](/en/examples/02-resources#download)

## Resource flow {#resource-flow}

<div class="course-flow">World → scene/color → fullscreen grade → post/color → present → screen</div>

Grade reads scene/color and targets the distinct post/color image. Inputs/outputs describe access, bindings connect resources to samplers, and targets name write attachments. Do not sample and write the same image in one draw. Grade runs at afterDraw/afterDraw; present runs at afterDraw/screenOutput and explicitly orders after course:grade. Use dontCare only for fully overwritten output; store preserves it for the next step. The host rebuilds viewport-sized resources when the window changes.

## Complete shaders {#shader-sources}

<<< @/../examples/course/02-resources/shaders/fullscreen.vsh{glsl}

<<< @/../examples/course/02-resources/shaders/grade.psh{glsl}

<<< @/../examples/course/02-resources/shaders/present.psh{glsl}

## Complete manifest {#complete-manifest}

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/course/02-resources/shaderpack.json

</details>

## Checks and images {#verification}

Extract to a fresh directory, open PowerShell in that pack root and use the pinned Analyzer installed in environment setup. Expected: exit code 0 with no diagnostics; scene shows four active Terrain routes. Static checks do not compile against a real driver.

```powershell
$analyzer = "C:\Tools\Dawnlight\shaderpack-analyzer.exe"
& $analyzer pack validate . --format json
& $analyzer scene explain . --include-inactive --format json
& $analyzer graph dump . --contract 2 --include-inactive
& $analyzer program interface . --program course:post/present --contract 2
& $analyzer program interface . --program course:post/grade --contract 2
```

<RuntimeNote example="course/02-resources" />

## Troubleshooting {#troubleshooting}

Unchanged output: present may still sample scene/color. Undefined/flickering pixels: check write-before-read access and ordering instead of only rearranging JSON files. Resize problems: keep related target dimensions at viewport and retain viewport/scissor synchronization and restoration.

## Exercise {#exercise}

Trace the scene/color writers, grade input/output and present input in the full manifest. Change grade to a cool tint and reload. Explain why this step needs no additional depth texture.

[Runtime method and evidence](/en/tutorial/runtime) · [Next: 03 · Override opaque Terrain](/en/tutorial/03-scene)
