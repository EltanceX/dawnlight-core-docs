---
title: "Configuration lab: diagnose and repair"
description: "Configuration lab: diagnose and repair: steps, exact inputs, expected results and evidence limits."
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
    - repository: website
      path: examples/diagnostics/w7-cases.json
    - repository: website
      path: metadata/w7-diagnostics.json
---

# Configuration lab: diagnose and repair {#overview}

<BaselineNote />



## Complete negative examples and expected results {#downloads}

These ZIPs are **intentionally invalid** and intended for offline diagnosis, not working presets. Each applies one explicit edit to the same standalone color pack. The pinned Analyzer runs pack, graph and Program interface on source and fresh ZIP, expecting exit 1; restoring the original Manifest makes all three exit 0. The three cases total 27 actual calls.

<DiagnosticLabNote />

## Read code, file and pointer {#locate}

Extract unknown-provider into a fresh work directory and run these commands at its root. DLMAN0001 identifies file=shaderpack.json and pointer=/passes/0/commands/0/sceneProvider/id: the first Pass and first command, not a line number. The value is the unregistered dawnlight:scene_draw/missing. This version reports DLMAN0001 at the Loader layer; do not relabel it DLABI1002 based on meaning.

```powershell
shaderpack-analyzer.exe pack validate . --format json
$LASTEXITCODE
shaderpack-analyzer.exe graph dump . --contract 2 --include-inactive
shaderpack-analyzer.exe program interface . --program practice:post/grade --contract 2
```

## Repair one value, then repeat the loop {#repair}

Restore the published Catalog v2 ID dawnlight:scene_draw/terrain_opaque and keep version 2. Repeat pack → scene → graph → interface. Failed graph/interface responses retain provenance; they do not supply a successful graph or driver observation. After repair inspect four BuiltIn routes, effect accesses and one present.

```powershell
shaderpack-analyzer.exe pack validate . --format json
shaderpack-analyzer.exe scene explain . --include-inactive --format json
shaderpack-analyzer.exe graph dump . --contract 2 --include-inactive
shaderpack-analyzer.exe program interface . --program practice:post/grade --contract 2
```

For unknown-program restore practice:post/grade. For history-on-persistent remove the added historyCommit; a persistent texture does not acquire History writers/fallback simply by renaming it. Downloaded recipe JSON records every edit.

## From repair to matching runtime evidence {#report}

Manual saving may change JSON bytes: a semantic repair no longer has the original ZIP’s source fingerprint. To reproduce this runtime record, freshly extract the [valid color pack](/en/examples/practice-color-balance#download), check its inventory, then load, change options, reload, resize and return to BuiltIn in a creative world. Export that generation’s Scene report. The invalid Provider frame-bridge request timed out; runtime rejection and generation preservation remain unverified. See the [actual record](/en/recipes/runtime).

This lab supplies no RenderDoc, numeric data readback or performance gate. Messages provide context; stable location uses code/file/pointer and exact provenance.
