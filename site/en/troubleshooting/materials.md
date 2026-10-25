---
title: Missing Mod material matches and deferred mapping
description: "Missing Mod material matches and deferred mapping: steps, exact inputs, expected results and evidence limits."
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

# Missing Mod material matches and deferred mapping {#overview}

<BaselineNote />

Follow one order: loading/versions → routes/active closure → resources/bindings → static interface → matching runtime report → appearance/lifecycle. Change one factor at a time.

## Locate the failing layer {#locate}

Check materials ABI, the unique materialTable, properties/tags/definitions/fallback, then the current world’s selector owners and final IDs. Paths, display names and translations are not stable content identity. Resolve against same-world WorldFinal. Preserve deferred until the required context is supplied.

## Inspect and repair {#inspect}

Inspect matches by priority and selector, distinguishing missing required content from onMissing=skip. W6’s amberdemo:MarbleBlock is a fictional optional selector; skipping it without that Mod is expected and unmatched content uses neutral. DLMAT1001–1003 concern declarations/consumer conflicts; 1005–1006 separate source ABI from linked layout.

## Recheck and recover {#verify}

If mappings match but appearance does not change, inspect readonly std430, SSBO slot, shaderId bounds, flat uint transport and property reads. Data matched supplies no numeric readback and does not replace actual shader-consumption checks. See [snapshot steps](/en/tools/content-snapshots) and [Data reports](/en/tools/driver-reports).
