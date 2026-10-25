---
title: Scene and Data driver reports
description: "Scene and Data driver reports: steps, exact inputs, expected results and evidence limits."
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

# Scene and Data driver reports {#overview}

<BaselineNote />



## Select the published generation {#export}

In a creative world confirm active selection, generation and options, then run `/switchshader export-driver-report`. For v5 data interfaces also run `/switchshader export-data-driver-report`, which requires a published v5 generation and final world content. The log gives the paths. Candidate, rolling-back or retired generations cannot export success. A failed candidate’s diagnostics are not the active pack’s report.

## Use the command for each report kind {#inspect}

Scene reports check linked Programs, native instances and FBOs. Data reports check declared/prepared data interfaces; the report kinds are not interchangeable. Use the exact same pack and options.

```powershell
shaderpack-analyzer.exe driver-report inspect ./scene-driver.json --pack-root .
shaderpack-analyzer.exe program interface . --program practice:post/grade --contract 2 --driver-report ./data-driver.json
shaderpack-analyzer.exe data-driver-report inspect ./data-driver.json --pack-root .
shaderpack-analyzer.exe data interface . --content-snapshot ./world-final.json --driver-report ./data-driver.json --format json
```

## Interpret matching precisely {#interpret}

DLREPORT0000–0020 cover format/integrity, 0101–0104 indicate partial evidence and 1001–1010 cover pack/source mismatch. Data rejection uses DLDATA3001. matched upgrades only the corresponding interface/Program/FBO observation. valueReadback=notProvided supplies no uniform/SSBO values, and liveWorldVerified=false supplies no world-visual acceptance.

An offline sidecar cannot see another process’s current device epoch. It cannot call a self-consistent historical report stale solely because a later reset occurred. Comparing with “running now” also requires current generation/epoch expectations. Recollect after reload, shader/options edits, world or device changes. Preserve old reports instead of editing hashes.


A checked failure: passing a Scene report to v5 Program interface contract 2 returned DLDATA2002 (contractVersion could not map to P11DataDriverReport). The same query with the matching Data report succeeded. Keep the two exports separate, including for a pack with no authored custom data.
