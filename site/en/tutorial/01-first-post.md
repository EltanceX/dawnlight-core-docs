---
title: 01 · Write your first post-process
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
      path: examples/course/01-first-post/shaderpack.json
  example: course/01-first-post
  verification:
    static: passed
    driverStatus: notProvided
    runtimeEvaluated: false
    liveWorldVerified: false
    visual: notRun
---

# 01 · Write your first post-process {#chapter}

<BaselineNote />

Add a mild warm tint and contrast while keeping UI readable. Prerequisites: chapter 00 and texture sampling/mix in [GLSL essentials](../start/glsl).

## Changes and complete snapshot {#changes}

Relative to 00, only present.psh changes effect logic. The manifest has a new example identity; resource/route/command counts remain 2 / 4 / 5. The download still contains all four files.

[Download and inspect all files](/en/examples/01-first-post#download)

## Resource flow {#resource-flow}

<div class="course-flow">scene/color → sample → contrast and warm tint → mix → present → screen</div>

Sample source, apply 1.08 contrast around 0.5, multiply tint and blend with strength=0.65. Clamp limits the output to [0,1]. This is an RGBA8/LDR teaching transform, with no claim of linear-light processing, HDR or color-correct tone mapping. The fullscreen vertex shader generates a quad from gl_VertexID; the fragment shader runs for output pixels.

## Complete shaders {#shader-sources}

<<< @/../examples/course/01-first-post/shaders/fullscreen.vsh{glsl}

<<< @/../examples/course/01-first-post/shaders/present.psh{glsl}

## Complete manifest {#complete-manifest}

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/course/01-first-post/shaderpack.json

</details>

## Checks and images {#verification}

Extract to a fresh directory, open PowerShell in that pack root and use the pinned Analyzer installed in environment setup. Expected: exit code 0 with no diagnostics; scene shows four active Terrain routes. Static checks do not compile against a real driver.

```powershell
$analyzer = "C:\Tools\Dawnlight\shaderpack-analyzer.exe"
& $analyzer pack validate . --format json
& $analyzer scene explain . --include-inactive --format json
& $analyzer graph dump . --contract 2 --include-inactive
& $analyzer program interface . --program course:post/present --contract 2
```

<RuntimeNote example="course/01-first-post" />

## Troubleshooting {#troubleshooting}

No change: edit shaders/present.psh in the active child directory, save and force-reload; refreshing discovery does not recompile. White/black output: set strength to 0 to isolate sampling, then check for an accidental tint of 104. On compilation failure, check semicolons, types and the file/line diagnostics.

## Exercise {#exercise}

In a working copy set strength to 0, reload, then set it to 1. Explain both mix endpoints. Modified bytes have a different identity: record the edit rather than reusing the original ZIP receipt as evidence for changed source.

[Runtime method and evidence](/en/tutorial/runtime) · [Next: 02 · Add a separate post-process resource](/en/tutorial/02-resources)
