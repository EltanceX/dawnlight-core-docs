---
title: 07 · Stable content and materials
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
      path: examples/course/07-materials/shaderpack.json
    - repository: website
      path: metadata/w6-examples-validation.json
    - repository: website
      path: metadata/w6-runtime.json
  example: course/07-materials
  verification:
    static: passed
    driverStatus: notProvided
    runtimeEvaluated: false
    liveWorldVerified: false
    visual: notRun
---

# 07 · Stable content and materials {#chapter}

<BaselineNote />

Distinguish stone and sand using stable content IDs and read tint, response and tags through the public material ABI. Prerequisites: chapter 06, flat uint varyings and SSBOs. Retain a neutral fallback and distinguish geometry identifiers from stable content identity.

## Changes and complete download {#changes}

Add materials.abiVersion=1 and a persistent materialTable buffer. Only the opaque Terrain command gains a readOnly storageBuffer at binding 4, with the table also declared in inputs. The fragment shader includes the host’s virtual /dawnlight/materials-v1.glsl; no helper file is copied.

[Previous chapter download](/en/examples/06-custom-data#download) · [This complete ZIP, source inventory and receipt](/en/examples/07-materials#download)

## Resource flow {#resource-flow}

<div class="course-flow">WorldFinal stable content IDs → mappings / neutral fallback → materialTable SSBO → LookupMaterial(flat identifier) → opaque RT0 → grade → present</div>

The course:stones group selects survivalcraft:GraniteBlock and BasaltBlock; another mapping selects SandBlock. Both use priority=10 and onMissing=skip. course:neutral must have shaderId 0, while stone=1 and sand=2. White tint and response=0 preserve unmatched blocks. Logical ID, effective ID/owner, RenderIdentifier, material record index and shaderId are separate domains. Never infer a species or BlockIndex from an arbitrary number.

The vertex stage carries identifiers as flat out highp uint into flat in highp uint. Explicit highp is required even when default integer precision is high. LookupMaterial returns a record; AmberTint/AmberResponse read declared properties, MaterialHasTag tests mineral, and MaterialShaderId selects the author’s branch. response controls color mixing, rather than claiming PBR roughness.

The final world layout determines byteSize; never hardcode it. A 16 B header precedes lookup and records. Each record has 16 B of identity/tag data plus 16 B per property, so these two properties give 48 B per record. Total size remains world-dependent. Without the same world’s WorldFinal snapshot, materials explain must keep mappingStatus=deferred. Valid definitions/layout do not establish world mapping or actual GPU reads.

## Active branch matrix {#branches}

<CourseBranchNote example="course/07-materials" />

## Complete shader sources {#shader-sources}

<details>
<summary>shaders/fullscreen.vsh</summary>

<<< @/../examples/course/07-materials/shaders/fullscreen.vsh{glsl}

</details>

<details>
<summary>shaders/grade.psh</summary>

<<< @/../examples/course/07-materials/shaders/grade.psh{glsl}

</details>

<details>
<summary>shaders/present.psh</summary>

<<< @/../examples/course/07-materials/shaders/present.psh{glsl}

</details>

<details>
<summary>shaders/terrain.psh</summary>

<<< @/../examples/course/07-materials/shaders/terrain.psh{glsl}

</details>

<details>
<summary>shaders/terrain.vsh</summary>

<<< @/../examples/course/07-materials/shaders/terrain.vsh{glsl}

</details>

## Complete Manifest and settings {#complete-manifest}

<details>
<summary>settings.json</summary>

<<< @/../examples/course/07-materials/settings.json

</details>

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/course/07-materials/shaderpack.json

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
& $analyzer materials explain . --format json
```

These graph CLI commands check defaults. The committed branch receipt uses JSON-RPC with explicit inputs.options; see the branch table and [maintenance procedure](https://github.com/EltanceX/dawnlight-core-docs/blob/main/docs/maintenance/CoursePacks.zh-CN.md).

For actual mapping, load the world, run `/switchshader content-export`, and pass that file as `--content-snapshot world-final.json` to materials explain. Export `/switchshader export-data-driver-report` for Data interface comparison. Keep the world snapshot private.

<PackRuntimeNote example="course/07-materials" />

## Troubleshooting {#troubleshooting}

DLMAT1005 calls for checking flat highp uint on both varying declarations. DLMAT1002 means the table must be consumed as a readOnly storageBuffer, never a UBO. Deferred mappings require content-export after world loading and that same snapshot passed to materials explain. Do not borrow another world’s slot table. Alpha-tested and transparent routes remain BuiltIn and are outside this opaque material shader.

## Exercise {#exercise}

Give SandBlock a subtle cool tint in a copy, leaving neutral white. Compare sand and an unmatched block. Add a second conflicting mapping at the same priority, confirm rejection during validation or snapshot resolution and restore it. Explain why chapter 04’s low-16-bit RT2 teaching bytes are unsuitable as stable material IDs.

[materials](/en/reference/materials) · [custom-data](/en/reference/custom-data) · [scene](/en/reference/scene)

[Next chapter: 08 · A post chain and its cost](/en/tutorial/08-post-chain)
