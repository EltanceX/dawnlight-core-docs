---
title: Schema and editor setup
description: "Schema and editor setup: steps, exact inputs, expected results and evidence limits."
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

# Schema and editor setup {#overview}

<BaselineNote />



## Associate files and preserve Schema bytes {#associate}

Create `.vscode/settings.json` at the pack root. The course uses v5; select v3/v4 schemas for compatibility packs. Do not add `$schema` to shaderpack.json: the Loader root whitelist does not accept that editor convention. This example matches only the course’s five fragments. settings.json has a separate UI contract and must not use the Manifest root schema.

```json
{"json.schemas":[{"fileMatch":["/shaderpack.json"],"url":"https://core.eltancex.top/downloads/reference/schema-v5.json"},{"fileMatch":["/manifest/options.json","/manifest/resources.json","/manifest/programs.json","/manifest/passes.json","/manifest/data.json"],"url":"https://core.eltancex.top/downloads/reference/schema-v5.json#/$defs/fragment"}]}
```

## Offline copies and references {#offline}

Save schema-v5.json from the [reference downloads](/en/reference/tool-contracts#sources), verify SHA-256 and use its local relative path as url. `$id` is contract identity; the download URL is a distribution location. Preserve the bytes and `$id`. Internal v5 references target definitions in the same document, so retain the whole file offline. completion-v2.json is completion metadata, not the Manifest schema. Keep v3/v4 and v5 tool bundles in separate output directories.

## Export, verify and interpret failures {#verify}

Export into an explicit new directory, then run read-only byte verification. Use a new or tool-managed directory, never a pack, filesystem root or directory containing unrelated files. Routine verification does not run approve.

```powershell
shaderpack-analyzer.exe schema export --manifest-version 5 --output ./schema-v5
shaderpack-analyzer.exe schema verify --manifest-version 5 --output ./schema-v5
```

DLSCHEMA1001–1003 cover request/output safety; DLSCHEMA2001–2002 mean missing or different bytes. Editor structure hints do not prove Catalog registration, composition references or driver linking. Continue with pack validate and the [repair lab](/en/troubleshooting/configuration-lab).
