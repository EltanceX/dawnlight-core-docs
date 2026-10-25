---
title: Static success but compile/link or FBO failure
description: "Static success but compile/link or FBO failure: steps, exact inputs, expected results and evidence limits."
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

# Static success but compile/link or FBO failure {#overview}

<BaselineNote />

Follow one order: loading/versions → routes/active closure → resources/bindings → static interface → matching runtime report → appearance/lifecycle. Change one factor at a time.

## Locate the failing layer {#locate}

Preserve the first candidate failure, Program ID, source owner, include/define variant, GL API/driver and native compiler log. Check dialect, precision, version and actual device support. compileContextAvailable=false in GL-free staticReflection explicitly means no driver context.

## Inspect and repair {#inspect}

DLSHADER0301–0302 locate preprocessing failures and DLABI4006 public shader-interface mismatches. Native compiler text still requires device logs; do not invent a stable code from a message. For FBOs inspect format/extent/location, sample count, drawBuffers and complete rows. Restore a minimal RGBA8 + depth24 topology first.

## Recheck and recover {#verify}

Re-export using the [report guide](/en/tools/driver-reports). A candidate that never published cannot supply a success report. Preserve the old active generation as a recovery baseline. matched covers recorded Program/FBO rows, not every scene or performance. The [W7 runtime record](/en/recipes/runtime) states the observed scope.
