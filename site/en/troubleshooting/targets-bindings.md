---
title: MRT outputs and binding conflicts
description: "MRT outputs and binding conflicts: steps, exact inputs, expected results and evidence limits."
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

# MRT outputs and binding conflicts {#overview}

<BaselineNote />

Follow one order: loading/versions → routes/active closure → resources/bindings → static interface → matching runtime report → appearance/lifecycle. Change one factor at a time.

## Locate the failing layer {#locate}

Separate named targets, active draw buffers and shader locations. An output location must correspond to an active color attachment. An allocated attachment need not be written by this draw. Check format, dimensions, load/store and clear encoding. DLABI3 covers target/draw-buffer contracts; DLABI4003–4006 cover type, frequency, slots and shader interface.

## Inspect and repair {#inspect}

List symbol, kind, binding, resource, access, frequency and source owner for each invocation. Samplers, images, UBOs and SSBOs have separate namespaces; equal numbers alone do not prove a collision. Check collisions and ABI reservations within the correct namespace. materialTable requires readonly storageBuffer; the [W5 UBO negative example](/en/reference/examples) preserves DLMAT1002.

## Recheck and recover {#verify}

Run program interface --contract 2, then compare with the same-generation report. Two suspicious generic post-process target/feedback edits produced no diagnostics in this GL-free probe. That does not prove output mapping, FBOs or pixels correct. Inspect the driver report and actual image.
