---
title: Troubleshoot by symptom
description: "Troubleshoot by symptom: steps, exact inputs, expected results and evidence limits."
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

# Troubleshoot by symptom {#overview}

<BaselineNote />



## Choose a symptom {#symptoms}

- [Pack missing, failed to load or still looks old](/en/troubleshooting/loading)
- [Black/white frames, missing sky or transparency](/en/troubleshooting/image-scene)
- [MRT outputs and binding conflicts](/en/troubleshooting/targets-bindings)
- [Feedback, writers, ordering and barriers](/en/troubleshooting/graph-hazards)
- [Resize, stale pack state and history trails](/en/troubleshooting/lifecycle-history)
- [Missing Mod material matches and deferred mapping](/en/troubleshooting/materials)
- [Static success but compile/link or FBO failure](/en/troubleshooting/driver)

## Record first, then narrow the cause {#sequence}

Record host commit, pack/ZIP fingerprint, options, selection, published generation, actual extent, world/Mods, GPU/driver and the first error. Run pack validate, then scene/graph/interface, then compare the corresponding report and appearance. Avoid changing host, world, source and options together.

The [repair lab](/en/troubleshooting/configuration-lab) includes three complete ZIPs clearly marked as negative examples. Source and fresh ZIP were rejected, then passed after restoration.

## Use codes and provenance {#codes}

Use stable codes/families and file/pointer for location. English messages supply context. One symptom can come from several layers and one family from several sources. See [diagnostics](/en/reference/diagnostics) and [Analyzer](/en/tools/analyzer) for codes and exit contracts.
