---
title: Black/white frames, missing sky or transparency
description: "Black/white frames, missing sky or transparency: steps, exact inputs, expected results and evidence limits."
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

# Black/white frames, missing sky or transparency {#overview}

<BaselineNote />

Follow one order: loading/versions → routes/active closure → resources/bindings → static interface → matching runtime report → appearance/lifecycle. Change one factor at a time.

## Locate the failing layer {#locate}

Disable the effect and check present-raw first. Inspect all four Terrain routes, modes, Providers, targets and drawBuffers. DLABI2/DLSCENE cover route ownership. DLABI2005 warns that a disabled route can hide content. An opaque override is not full sky/model/hand integration.

## Inspect and repair {#inspect}

Display each step directly along scene color → intermediate → present. Inspect clear/load/store, format, extent, sampled input and output locations. White may come from encoding/range or stacked exposure; black can come from empty targets, wrong samplers, unwritten resources or driver failure. A controlled constant-color output can show whether a shader runs. Change one factor at a time.

## Recheck and recover {#verify}

For transparency inspect alpha-tested, transparent and sorted-translucent ordering plus depth/blend state. Compare with BuiltIn and inspect the corresponding Scene report. These visual symptoms do not share one stable diagnostic code.
