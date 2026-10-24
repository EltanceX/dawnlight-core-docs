---
title: 10 · Verify and distribute
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
      path: examples/course/10-distribution/shaderpack.json
    - repository: website
      path: metadata/w6-examples-validation.json
    - repository: website
      path: metadata/w6-runtime.json
  example: course/10-distribution
  verification:
    static: passed
    driverStatus: notProvided
    runtimeEvaluated: false
    liveWorldVerified: false
    visual: notRun
---

# 10 · Verify and distribute {#chapter}

<BaselineNote />

Hand the complete Amber pack to another author who can extract, validate, load and return to BuiltIn from scratch. Prerequisite: chapter 09. Produce a distribution with inventory, hashes, tested scope and known limitations.

## Changes and complete download {#changes}

Keep chapter 09’s rendering features and fragments under the independent 10-distribution identity with a complete README. The ZIP includes all source and three presets. Host binaries, tools, Mods, worlds, WorldFinal snapshots and raw driver logs are outside the download. Its page supplies an inventory and static receipt.

[Previous chapter download](/en/examples/09-complete-pack#download) · [This complete ZIP, source inventory and receipt](/en/examples/10-distribution#download)

## Resource flow {#resource-flow}

<div class="course-flow">registered source bytes → deterministic ZIP + inventory → fresh extraction → static branch checks → actual game lifecycle → documented distribution</div>

First download ZIP and inventory, then compare Get-FileHash -Algorithm SHA256 against the download page. Extract into a fresh directory with shaderpack.json at its root. Verify every path, byte length and SHA-256 in the inventory, rather than checking only the root JSON. Source fingerprint, ZIP hash and Loader manifestHash identify source bytes, archive bytes and the parsed contract respectively.

Next validate pack, scene, every Program interface, data/materials and graphs with the intended options. Cover default, grade-off, glow-off, all-off, strength-max and economy. CLI graph dump checks defaults only; this website’s script supplies inputs.options to JSON-RPC dawnlight/dumpGraph for each branch. With includeInactive, declarations remain in the graph, so counts must filter active=true.

Finally load a creative test world in the compatible host, apply presets, change gain/strength, reload the pack, resize the actual window, export driver/data reports and switch back to BuiltIn. Resolve materials against content-export from that same world. driverStatus=matched establishes report identity/interface agreement; observe the rendered image separately. Record host version, GPU/API, dimensions, conditions and failure/fallback behavior.

This reproduction is performed by the agent in an isolated runtime, not by an independent human beginner. The runtime record below binds this final ZIP and fingerprint and lists observed checks. Android, VR, multiple views, device-loss recovery, other drivers and performance gates require separate acceptance. Distributing a teaching pack does not satisfy the upstream P11 release publish acceptance matrix.

## Active branch matrix {#branches}

<CourseBranchNote example="course/10-distribution" />

## Preset recipes {#presets}

| Recipe | grade | glow | strength | gain |
| --- | --- | --- | --- | --- |
| balanced | true | true | 0.65 | 1.0 |
| economy | true | false | 0.4 | 1.0 |
| neutral | false | false | 0.65 | 1.0 |

## Complete shader sources {#shader-sources}

<details>
<summary>shaders/fullscreen.vsh</summary>

<<< @/../examples/course/10-distribution/shaders/fullscreen.vsh{glsl}

</details>

<details>
<summary>shaders/glow.psh</summary>

<<< @/../examples/course/10-distribution/shaders/glow.psh{glsl}

</details>

<details>
<summary>shaders/grade.psh</summary>

<<< @/../examples/course/10-distribution/shaders/grade.psh{glsl}

</details>

<details>
<summary>shaders/present.psh</summary>

<<< @/../examples/course/10-distribution/shaders/present.psh{glsl}

</details>

<details>
<summary>shaders/terrain.psh</summary>

<<< @/../examples/course/10-distribution/shaders/terrain.psh{glsl}

</details>

<details>
<summary>shaders/terrain.vsh</summary>

<<< @/../examples/course/10-distribution/shaders/terrain.vsh{glsl}

</details>

## Complete Manifest and settings {#complete-manifest}

<details>
<summary>manifest/data.json</summary>

<<< @/../examples/course/10-distribution/manifest/data.json

</details>

<details>
<summary>manifest/options.json</summary>

<<< @/../examples/course/10-distribution/manifest/options.json

</details>

<details>
<summary>manifest/passes.json</summary>

<<< @/../examples/course/10-distribution/manifest/passes.json

</details>

<details>
<summary>manifest/programs.json</summary>

<<< @/../examples/course/10-distribution/manifest/programs.json

</details>

<details>
<summary>manifest/resources.json</summary>

<<< @/../examples/course/10-distribution/manifest/resources.json

</details>

<details>
<summary>presets/balanced.json</summary>

<<< @/../examples/course/10-distribution/presets/balanced.json

</details>

<details>
<summary>presets/economy.json</summary>

<<< @/../examples/course/10-distribution/presets/economy.json

</details>

<details>
<summary>presets/neutral.json</summary>

<<< @/../examples/course/10-distribution/presets/neutral.json

</details>

<details>
<summary>settings.json</summary>

<<< @/../examples/course/10-distribution/settings.json

</details>

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/course/10-distribution/shaderpack.json

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
& $analyzer program interface . --program course:post/glow --contract 2
& $analyzer data explain . --format json
& $analyzer materials explain . --format json
& $analyzer scene explain . --options presets/economy.json --include-inactive --format json
& $analyzer data explain . --options presets/economy.json --format json
```

These graph CLI commands check defaults. The committed branch receipt uses JSON-RPC with explicit inputs.options; see the branch table and [maintenance procedure](https://github.com/EltanceX/dawnlight-core-docs/blob/main/docs/maintenance/CoursePacks.zh-CN.md).

For actual mapping, load the world, run `/switchshader content-export`, and pass that file as `--content-snapshot world-final.json` to materials explain. Export `/switchshader export-data-driver-report` for Data interface comparison. Keep the world snapshot private.

<PackRuntimeNote example="course/10-distribution" />

## Troubleshooting {#troubleshooting}

A loadable but incorrect image requires checking that External is actually selected and no BuiltIn fallback occurred, then comparing manifest/source/generation identities. An unchanged ZIP hash after adding files suggests an old download or URL. Refresh stale material evidence from the same world and generation. A Scene contract-v1 report cannot stand in for a Data contract-v2 report.

## Exercise {#exercise}

Ask another author to follow only this ZIP and README and record obstacles separately from the agent reproduction. Publish your derivative under a new ID/version and fingerprint URL, preserving old course downloads, and document its own host/hardware acceptance scope.

## README {#readme}

<details>
<summary>README.md</summary>

<<< @/../examples/course/10-distribution/README.md

</details>

[tool-contracts](/en/reference/tool-contracts) · [materials](/en/reference/materials) · [programs](/en/reference/programs)

[Complete runtime record and limits](/en/tutorial/pack-runtime)
