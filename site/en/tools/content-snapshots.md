---
title: World content snapshots and material resolution
description: "World content snapshots and material resolution: steps, exact inputs, expected results and evidence limits."
lang: en-US
dawnlight:
  publication: published
  baseline: candidate-f8aaa5c4
  manifestVersions:
    - 5
  sceneAbiVersions:
    - 2
  sourceRefs:
    - repository: upstream
      path: tools/ShaderPackAnalyzer/README.md
      commit: f8aaa5c4218f54536ccf994a2d512aed2e3678b7
    - repository: upstream
      path: docs/ShaderPackDiagnosticReference.md
      commit: f8aaa5c4218f54536ccf994a2d512aed2e3678b7
---

# World content snapshots and material resolution {#overview}

<BaselineNote />



## Export from the target world {#export}

Enter the target world after Mod/block registration has completed and run `/switchshader content-export` in game chat. The log gives the absolute export path. Copy it to your authoring directory and retain the original. WorldFinal describes that world’s final logical/effective content IDs, owners and registration identity. It is neither an image nor a universal Mod database, and does not make Analyzer execute Mod DLLs. Export separately for different Mod sets.

## Resolve and inspect mappings {#resolve}

Run these commands at the pack root. Check exit code and diagnostics before mapping matches and fallback. Without a snapshot, deferred/null means missing context, not “the Mod does not exist.” Use onMissing=skip for optional content. Required content should fail clearly; changing a translated block name is not content identity matching.

```powershell
shaderpack-analyzer.exe materials layout . --format json
shaderpack-analyzer.exe materials explain . --content-snapshot ./world-final.json --format json
shaderpack-analyzer.exe data interface . --content-snapshot ./world-final.json --format json
```

## When to export again {#identity}

Re-export after changing Mods, owners, final registration or the relevant host baseline. Compare content/source/generation identities rather than filenames. materialTable is an allocator-initialized readonly SSBO. A mapping match does not prove shader values: inspect layout/bindings, the corresponding Data report and game appearance separately. W6 performed same-world resolution; see its [runtime scope](/en/tutorial/pack-runtime). Keep full world snapshots local.
