---
title: Environment and loading
description: Prepare the Windows host, editor and pinned Analyzer, then load a complete external pack.
lang: en-US
dawnlight:
  publication: published
  baseline: candidate-f8aaa5c4
  manifestVersions:
    - 5
  sceneAbiVersions:
    - 2
  sourceRefs:
    - repository: website
      path: examples/registry.json
    - repository: website
      path: metadata/w4-runtime.json
---

# Environment and loading {#chapter}

<BaselineNote />

Use Windows x64, .NET 10 and a driver supporting OpenGL ES 3.2. The host baseline is f8aaa5c4; another Survivalcraft API build may expose different contracts. Obtain the host from the [public upstream](https://gitea.com/EltanceX/DawnlightCore) or your trusted build; this website does not redistribute the game.

## Prepare the tools {#tools}

Install a UTF-8 editor such as VS Code. Enable JSON/GLSL syntax support and preserve filenames (.vsh/.psh), LF and UTF-8 without BOM. Install the **docs-tools-f8aaa5c4-w1.1** Analyzer from the project’s controlled tool distribution; this is a pinned self-contained Windows tool, with no global .NET SDK needed to run it. The website does not provide an anonymous binary download. Maintainers can restore the locked tool using [LockedInputs](https://github.com/EltanceX/dawnlight-core-docs/blob/main/docs/maintenance/LockedInputs.zh-CN.md); readers without that access can still load the chapter ZIP and use in-game diagnostics. Inspect the [tool identity](/en/tools/analyzer) before using a different Analyzer build.

## Install an external pack {#install}

Download chapter 00, verify its ZIP SHA-256 with Get-FileHash, then extract it so the folder layout is exactly:

```text
<GameDirectory>/
  Survivalcraft.exe
  shaderpacks/
    00-starter/
      shaderpack.json
      README.md
      shaders/
        fullscreen.vsh
        present.psh
```

```powershell
Get-FileHash .\starter.zip -Algorithm SHA256
```

Discovery scans direct child directories of AppContext.BaseDirectory/shaderpacks. A ZIP or a nested 00-starter/00-starter directory is not a loadable entry. The folder name is the external source identifier; the manifest id is a separate pack identity.

## Activate and edit {#activate}

Start a disposable creative world. Press **U** to open Dawnlight settings, then open **Shader Packs**. Refresh discovery, select the folder, then **Apply**. Selection and refresh alone do not activate a generation. Confirm the active source, not only the highlighted row. After saving GLSL, use **Force Reload Shaders**. On failure inspect diagnostics; the previously published generation can remain active. For recovery, select BuiltIn and apply it.

## First reader checklist {#checklist}

Use a fresh directory and the ZIP only. Check extension visibility, folder depth, active source, save/reload and resize, then return to BuiltIn. Record host identity, source fingerprint, observed image and any error. The [runtime record](/en/tutorial/runtime) lists the obstacles found during this reproduction.

[Continue to GLSL essentials](/en/start/glsl) · [Load chapter 00](/en/tutorial/00-starter)
