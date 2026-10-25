---
title: Feedback, writers, ordering and barriers
description: "Feedback, writers, ordering and barriers: steps, exact inputs, expected results and evidence limits."
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

# Feedback, writers, ordering and barriers {#overview}

<BaselineNote />

Follow one order: loading/versions → routes/active closure → resources/bindings → static interface → matching runtime report → appearance/lifecycle. Change one factor at a time.

## Locate the failing layer {#locate}

Build producer → resource → consumer from active=true nodes in graph contract 2. Compare Pass inputs/outputs with command bindings/targets/access. Allocation is not a current-frame writer: asset, external, clear, history fallback and undefined initialization differ.

## Inspect and repair {#inspect}

DLGRAPH1001–1002 concern command access direction, 1101–1102 mixed legacy access. A DLGRAPH1201 read-modify-write observation is not proof that OpenGL framebuffer feedback is legal. Fullscreen sampling from the same written subresource needs separate targets or valid ping-pong. Add phase-compatible dependencies rather than cyclic after edges.

## Recheck and recover {#verify}

For compute image/SSBO visibility inspect access declarations, subsequent consumers and barriers under the public Command contract. An arbitrary barrier cannot repair same-draw sampler feedback or create missing contents. After disabling an effect recheck active Programs/resources/Services, not only pass.enabled. The pinned graph CLI ignores options; use JSON-RPC inputs.options for branch graphs.
