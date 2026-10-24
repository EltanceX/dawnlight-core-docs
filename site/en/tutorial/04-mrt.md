---
title: 04 · Write and inspect MRT data
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
      path: examples/course/04-mrt/shaderpack.json
  example: course/04-mrt
  verification:
    static: passed
    driverStatus: notProvided
    runtimeEvaluated: false
    liveWorldVerified: false
    visual: notRun
---

# 04 · Write and inspect MRT data {#chapter}

<BaselineNote />

Write color, normal and teaching material data in one opaque draw, then display a normal debug view. Prerequisites: 03, attachment locations, uint and bit operations.

## Changes and complete snapshot {#changes}

Add RGBA8 normal/material textures. Named Terrain target topology contains RT0/RT1/RT2 and the shared depth. Opaque explicitly uses drawBuffers=[0,1,2], its fragment shader writes three outputs, and grade reads the auxiliary textures. Keep frameTarget at RT0 + depth for ordinary world drawing. Totals: 5 textures and 6 commands.

[Download and inspect all files](/en/examples/04-mrt#download)

## Resource flow {#resource-flow}

<div class="course-flow">opaque → RT0 color / RT1 normal / RT2 data → grade debug view → post/color → present</div>

Target topology names attached images; drawBuffers selects active outputs for this draw. The three BuiltIn fallbacks retain the named three-color topology, while their resolved recipe enables RT0 only. Authoring drawBuffers directly on a fallback is rejected with DLMAN0001. Opaque clears auxiliary targets, loads existing color and clears depth under this ABI. Host normal data contains oct-encoded RG bytes and a sign byte, stored unchanged as RGB divided by 255; A=1 marks a course opaque write. This chapter displays the encoding directly. RGB is not XYZ and must not be decoded with rgb*2-1 followed by normalization; direction decoding is deferred. Material R/G hold low/high bytes of the vertex identifier’s lower 16 bits, B stores demonstration luminance, and A marks validity. This is a course convention, not a host G-buffer or stable content/material-ID ABI. Read with texelFetch and integer coordinates to avoid filtering identifier bytes.

## Complete shaders {#shader-sources}

<<< @/../examples/course/04-mrt/shaders/fullscreen.vsh{glsl}

<<< @/../examples/course/04-mrt/shaders/terrain.vsh{glsl}

<<< @/../examples/course/04-mrt/shaders/terrain.psh{glsl}

<<< @/../examples/course/04-mrt/shaders/grade.psh{glsl}

<<< @/../examples/course/04-mrt/shaders/present.psh{glsl}

## Complete manifest {#complete-manifest}

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/course/04-mrt/shaderpack.json

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
& $analyzer program interface . --program course:scene/terrain --contract 2
```

<RuntimeNote example="course/04-mrt" />

## Troubleshooting {#troubleshooting}

Gray output: verify opaque writes A=1, then inspect grade bindings. Color without RT1/2 data: check output locations and drawBuffers. Missing sky/water normals reflect the coverage boundary. Auxiliary images describe opaque Terrain only and may retain surfaces obscured by later transparent drawing; they are insufficient for complete visible-surface deferred rendering. Two added RGBA8 images have a nominal 8×W×H-byte capacity, excluding driver allocation overhead.

## Exercise {#exercise}

In a copy change DEBUG_VIEW from 1 to 2 for identifier visualization, then to 0 for color. Recheck interfaces and driver compilation for changed source. Explain why three named attachments do not mean every scene category writes all three.

[Runtime method and evidence](/en/tutorial/runtime) · [Review the resource model](/en/concepts/resources-targets)

[Next: options and settings](/en/tutorial/05-options)
