---
title: Resize, stale pack state and history trails
description: "Resize, stale pack state and history trails: steps, exact inputs, expected results and evidence limits."
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

# Resize, stale pack state and history trails {#overview}

<BaselineNote />

Follow one order: loading/versions → routes/active closure → resources/bindings → static interface → matching runtime report → appearance/lifecycle. Change one factor at a time.

## Locate the failing layer {#locate}

Record generation, actual window/render extent, resource extents and selection before/after changes. Viewport-sized resources follow lifecycle rebuilds; absolute-size probes are not fullscreen targets. Identical screenshots do not prove a resize occurred. Reproduce first with a [history-free feature](/en/recipes/), then add history incrementally.

## Inspect and repair {#inspect}

History needs a real writer, valid current/previous views, fallback and at most one historyCommit after every writer. A persistent resource cannot be committed; this release includes that real negative example. Skipped producers must not advance history. Reload, world/device/owner/camera/extent changes and camera cuts follow invalidation rules. GPU-history validity and view_history_valid are distinct conditions.

## Recheck and recover {#verify}

Old reports against a new generation can trigger DLREPORT1001–1010; use DLAST/DLDATA for temporal input/AST errors. Static success does not establish device-loss recovery, multiple views, other drivers or TAA quality. See [advanced boundaries](/en/recipes/advanced-boundaries).
