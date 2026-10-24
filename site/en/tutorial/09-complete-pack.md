---
title: 09 · Compose an independent pack
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
      path: examples/course/09-complete-pack/shaderpack.json
    - repository: website
      path: metadata/w6-examples-validation.json
    - repository: website
      path: metadata/w6-runtime.json
  example: course/09-complete-pack
  verification:
    static: passed
    driverStatus: notProvided
    runtimeEvaluated: false
    liveWorldVerified: false
    visual: notRun
---

# 09 · Compose an independent pack {#chapter}

<BaselineNote />

Bring the previous chapters together as Amber: gentle warm contrast, day/rain weighting, stone/sand responses and optional glow. Prerequisite: chapter 08. Maintain fragment boundaries, reproduce presets and handle missing Mod content.

## Changes and complete download {#changes}

The root shaderpack.json retains identity, shaderRoot, settings, frameTarget, sourceFormatVersion=1 and the ordered fragments list. Put options/resources/programs/passes in manifest/, place sceneCategories with passes and materials/customData in data.json. Add three full option presets and an optional Mod selector.

[Previous chapter download](/en/examples/08-post-chain#download) · [This complete ZIP, source inventory and receipt](/en/examples/09-complete-pack#download)

## Resource flow {#resource-flow}

<div class="course-flow">shaderpack.json → manifest/{options,resources,programs,passes,data}.json → one immutable descriptor → selected active chain → Amber</div>

Fragments compose declarations, rather than applying patches. Arrays concatenate in root order and duplicate IDs remain errors. settings and frameTarget belong to the root. This composed v5 root does not accept sceneCategories, so it lives in a fragment. Shader paths resolve from root shaderRoot, not the fragment directory. Package every fragment, settings file and shader together.

balanced uses defaults. economy keeps grade, disables glow and sets strength=0.4. neutral disables grade/glow. presets/*.json are Analyzer override files and settings recipes; the host does not automatically create a preset menu from them. Apply the same values through settings. Preserve 1.0 for number overrides even at integral values to avoid Integer/Number warnings.

amberdemo:MarbleBlock is a fictional Mod integration point with priority=20 and onMissing=skip. No Mod installation is required. Missing content skips the mapping; other unmatched content uses course:neutral. For an actual Mod, obtain logical/effective IDs and owner from this world’s WorldFinal snapshot before changing the selector. economy removes post work but keeps the opaque material table. BuiltIn restores host rendering.

## Active branch matrix {#branches}

<CourseBranchNote example="course/09-complete-pack" />

## Preset recipes {#presets}

| Recipe | grade | glow | strength | gain |
| --- | --- | --- | --- | --- |
| balanced | true | true | 0.65 | 1.0 |
| economy | true | false | 0.4 | 1.0 |
| neutral | false | false | 0.65 | 1.0 |

## Complete shader sources {#shader-sources}

<details>
<summary>shaders/fullscreen.vsh</summary>

<<< @/../examples/course/09-complete-pack/shaders/fullscreen.vsh{glsl}

</details>

<details>
<summary>shaders/glow.psh</summary>

<<< @/../examples/course/09-complete-pack/shaders/glow.psh{glsl}

</details>

<details>
<summary>shaders/grade.psh</summary>

<<< @/../examples/course/09-complete-pack/shaders/grade.psh{glsl}

</details>

<details>
<summary>shaders/present.psh</summary>

<<< @/../examples/course/09-complete-pack/shaders/present.psh{glsl}

</details>

<details>
<summary>shaders/terrain.psh</summary>

<<< @/../examples/course/09-complete-pack/shaders/terrain.psh{glsl}

</details>

<details>
<summary>shaders/terrain.vsh</summary>

<<< @/../examples/course/09-complete-pack/shaders/terrain.vsh{glsl}

</details>

## Complete Manifest and settings {#complete-manifest}

<details>
<summary>manifest/data.json</summary>

<<< @/../examples/course/09-complete-pack/manifest/data.json

</details>

<details>
<summary>manifest/options.json</summary>

<<< @/../examples/course/09-complete-pack/manifest/options.json

</details>

<details>
<summary>manifest/passes.json</summary>

<<< @/../examples/course/09-complete-pack/manifest/passes.json

</details>

<details>
<summary>manifest/programs.json</summary>

<<< @/../examples/course/09-complete-pack/manifest/programs.json

</details>

<details>
<summary>manifest/resources.json</summary>

<<< @/../examples/course/09-complete-pack/manifest/resources.json

</details>

<details>
<summary>presets/balanced.json</summary>

<<< @/../examples/course/09-complete-pack/presets/balanced.json

</details>

<details>
<summary>presets/economy.json</summary>

<<< @/../examples/course/09-complete-pack/presets/economy.json

</details>

<details>
<summary>presets/neutral.json</summary>

<<< @/../examples/course/09-complete-pack/presets/neutral.json

</details>

<details>
<summary>settings.json</summary>

<<< @/../examples/course/09-complete-pack/settings.json

</details>

<details>
<summary>shaderpack.json</summary>

<<< @/../examples/course/09-complete-pack/shaderpack.json

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

<PackRuntimeNote example="course/09-complete-pack" />

## Troubleshooting {#troubleshooting}

Duplicate IDs are not fragment overrides: locate both declarations and keep one. Missing shaders require paths relative to shaderRoot. UI rejection often means an option lacks exactly one control/hiddenOptions entry. The absent fictional Mod is deliberately skipped. A real hard dependency should use error and be documented for distribution.

## Exercise {#exercise}

Load economy from a fresh ZIP and confirm that only one full-size post target remains. Replace the fictional selector with an actual stable ID from your WorldFinal snapshot, inspect the mapping and restore it. After splitting another fragment, validate source and ZIP and keep unsupported fields out of the root.

[manifest](/en/reference/manifest) · [materials](/en/reference/materials) · [settings-ui](/en/reference/settings-ui)

[Next chapter: 10 · Verify and distribute](/en/tutorial/10-distribution)
