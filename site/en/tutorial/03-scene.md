---
title: 03 · Override opaque Terrain
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
      path: examples/course/03-scene/shaderpack.json
  example: course/03-scene
  verification:
    static: passed
    driverStatus: notProvided
    runtimeEvaluated: false
    liveWorldVerified: false
    visual: notRun
---

# 03 · Override opaque Terrain {#chapter}

<BaselineNote />

Use a pack-owned Program for opaque Terrain while retaining BuiltIn for the other three categories. Expect a slight green terrain tint; sky, water and UI are distinct paths. Prerequisites: 02 and vertex-to-fragment data flow.

## Changes and complete snapshot {#changes}

Add terrain.vsh / terrain.psh and course:scene/terrain. Set the opaque sceneCategory to override, point it to its Stage, and give engineDraw a Program and sceneBindings. Other fallback declarations omit Program. Resource and command counts remain 3 and 6.

[Download and inspect all files](/en/examples/03-scene#download)

## Resource flow {#resource-flow}

<div class="course-flow">Host Terrain vertices / texture → sceneBindings + pack Program → scene/color → grade → present</div>

Use officialCompatible compilation and the public Terrain vertex layout: locations 0–7, semantic annotations and a uint identifier. View-frequency bindings provide viewProjection and terrain origin; batch provides lightTable; draw provides the block texture. Subtract the XZ origin, multiply the matrix and apply OPENGL_POSITION_FIX. Do not infer units from names or interpolate an integer identifier as a float. This clean-room shader demonstrates texture, vertex color and basic light-table use; it does not reproduce all BuiltIn fog, lighting or visuals.

## Complete shaders {#shader-sources}

<<< @/../examples/course/03-scene/shaders/fullscreen.vsh{glsl}

<<< @/../examples/course/03-scene/shaders/terrain.vsh{glsl}

<<< @/../examples/course/03-scene/shaders/terrain.psh{glsl}

<<< @/../examples/course/03-scene/shaders/grade.psh{glsl}

<<< @/../examples/course/03-scene/shaders/present.psh{glsl}

## Complete manifest {#complete-manifest}

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/course/03-scene/shaderpack.json

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

<RuntimeNote example="course/03-scene" />

## Troubleshooting {#troubleshooting}

Missing terrain: match category, Stage ID and engineDraw provider, then check matrix/origin. Wrong texture: verify sampler symbol, binding and block_texture contract. BuiltIn routes do not load from the pack shaderRoot; do not redirect their filenames into the pack to complete them.

## Exercise {#exercise}

Change only the green factor in terrain.psh and identify the affected category. Use scene explain to locate the single pack-owned Terrain route. Explain why present is also pack-owned without being a Terrain route.

[Runtime method and evidence](/en/tutorial/runtime) · [Next: 04 · Write and inspect MRT data](/en/tutorial/04-mrt)
