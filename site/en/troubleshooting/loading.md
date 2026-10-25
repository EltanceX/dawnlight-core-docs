---
title: Pack missing, failed to load or still looks old
description: "Pack missing, failed to load or still looks old: steps, exact inputs, expected results and evidence limits."
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

# Pack missing, failed to load or still looks old {#overview}

<BaselineNote />

Follow one order: loading/versions → routes/active closure → resources/bindings → static interface → matching runtime report → appearance/lifecycle. Change one factor at a time.

## Locate the failing layer {#locate}

Check that the directory is a direct shaderpacks child, shaderpack.json is at its root, versions match and the selected pack name is correct. Rule out a second game installation or nested extraction. Run pack validate on the actual directory. DLMAN/DLSCHEMA concern authored inputs; DLABI1 concerns Catalog IDs/versions/identity. Start there before editing GLSL.

## Inspect and repair {#inspect}

After loading/reload compare actual selection, published generation, LastError and source identity. A failed candidate can leave the old generation visible, so a continuing image does not prove the new pack succeeded. Restore a known-good ZIP and switch to the same pack again, or use `/switchshader builtin`. Restart after installing a new C# host; JSON reload cannot update process code.

## Recheck and recover {#verify}

See the [configuration lab](/en/troubleshooting/configuration-lab) for a real DLMAN0001 Provider error and repair. Preserve old source/report identities, then collect a new report after success.
