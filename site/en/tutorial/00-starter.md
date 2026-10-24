---
title: 00 · Load the external starter
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
      path: examples/course/00-starter/shaderpack.json
  example: course/00-starter
  verification:
    static: passed
    driverStatus: notProvided
    runtimeEvaluated: false
    liveWorldVerified: false
    visual: notRun
---

# 00 · Load the external starter {#chapter}

<BaselineNote />

Install a complete pack into an empty directory, identify the active source and display scene color without an added grade. Complete [environment setup](../start/environment) first; no C# editing is required.

## Changes and complete snapshot {#changes}

This is the baseline snapshot with no earlier dependency. Four files form the complete pack. Two persistent viewport textures hold color and depth; one present Program samples color. All four Terrain categories explicitly select BuiltIn fallback.

[Download and inspect all files](/en/examples/course-starter#download)

## Resource flow {#resource-flow}

<div class="course-flow">Host sky / models / Terrain → scene/color + depth → present → screen → UI</div>

`frameTarget` owns the frame color/depth destination; four Terrain declarations alone do not establish whole-frame routing. The frame starts with cleared attachments. The opaque command clears depth under this ABI but loads color to retain the already drawn sky. Fallback Programs belong to the host source owner, while present belongs to the pack shaderRoot. No built-in shader copy is needed. This starter allocates textures and is distinct from BuiltIn Minimal.

## Complete shaders {#shader-sources}

<<< @/../examples/course/00-starter/shaders/fullscreen.vsh{glsl}

<<< @/../examples/course/00-starter/shaders/present.psh{glsl}

## Complete manifest {#complete-manifest}

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/course/00-starter/shaderpack.json

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

<RuntimeNote example="course/00-starter" />

## Troubleshooting {#troubleshooting}

Missing entry: check for an extra wrapper directory; discovery does not load ZIP files directly. Selection without a visual change: apply it and inspect active source and diagnostics. Black output: ensure present samples the frameTarget color ID; return to BuiltIn and inspect logs. Missing sky: retain the opaque color load instead of clearing it.

## Exercise {#exercise}

Without editing source, load, force-reload the same pack, resize the window and return to BuiltIn. Check errors and retain logs at each step. Identify who writes color and where present reads it.

[Runtime method and evidence](/en/tutorial/runtime) · [Next: 01 · Write your first post-process](/en/tutorial/01-first-post)
