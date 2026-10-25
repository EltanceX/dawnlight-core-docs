---
title: Analyzer and evidence
description: Validate shader packs with ShaderPackAnalyzer, distinguish offline checks from driver and game evidence, and understand DLTOOL2001.
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

<div id="analyzer-与证据边界" class="legacy-anchor" aria-hidden="true"></div>

# Analyzer and evidence {#analyzer-evidence}

<BaselineNote />

ShaderPackAnalyzer validates packs with the production Loader and explains schemas, resource graphs, scene routing and public interfaces. It helps identify structural and semantic problems before you run the game.

<div id="获取当前工具" class="legacy-anchor" aria-hidden="true"></div>

## Get the current tool {#get-the-tool}

The pinned tool distribution is `docs-tools-f8aaa5c4-w1.1`, for Windows x64 with a self-contained .NET runtime. Its binary assets currently reside in a GitHub Release that requires read access; an anonymous download is not yet available.

Source is available from the [public Gitea repository](https://gitea.com/EltanceX/DawnlightCore). To build it yourself, check out the baseline commit and follow the upstream Analyzer README using the .NET 10 SDK. The commands below assume you already have a version-checked `shaderpack-analyzer.exe`.

<SourceNote path="tools/ShaderPackAnalyzer/README.md" label="Analyzer build, distribution and command documentation" />

<div id="从包验证开始" class="legacy-anchor" aria-hidden="true"></div>

## Start with pack validation {#pack-validation}

```powershell
shaderpack-analyzer.exe pack validate ./MyPack --format json
```

Check the exit code, `valid` and `diagnostics` first. Fix the reported file, JSON pointer, resource or program ID, then request a more specific explanation.

In these commands, `./MyPack` is your own pack directory, not a downloadable example provided by this website.

<div id="按问题选择解释命令" class="legacy-anchor" aria-hidden="true"></div>

## Choose a command for the question {#explanation-commands}

::: code-group

```powershell [Scene routing]
shaderpack-analyzer.exe scene explain ./MyPack --include-inactive --format json
```

```powershell [Resource graph]
shaderpack-analyzer.exe graph dump ./MyPack --contract 2 --include-inactive
```

```powershell [v5 program interface]
shaderpack-analyzer.exe program interface ./MyPack --program "yourpack:post/present" --contract 2
```

```powershell [Custom data]
shaderpack-analyzer.exe data interface ./MyPack --format json
```

:::

Replace `yourpack:post/present` with a Program ID that exists in your pack. For the v5 Program interface, explicitly select contract 2; omitting it may still select an older interface projection.

<div id="不同的成功分别意味着什么" class="legacy-anchor" aria-hidden="true"></div>

## What each successful check establishes {#evidence-levels}

| Result | What it establishes | Evidence still needed |
| --- | --- | --- |
| Schema validation passes | Structure satisfies the corresponding schema | Loader semantics and versioned behavior |
| Loader validation passes | This pack passes the current loading and semantic checks | Driver compilation, linking and resource creation |
| Offline graph / interface succeeds | Active relationships and interfaces can be explained for the selected inputs | An actual device and game context |
| Valid driver report | Device observations exist for the matching identity | Scene, lifecycle and visual acceptance |
| Game visuals and performance verified | Observations for a particular device and scene | Coverage of other devices and configurations |

The current documentation baseline retains `driverStatus=notProvided`, `mappingStatus=deferred`, `runtimeEvaluated=false` and `liveWorldVerified=false`. An offline success does not change those fields into claims of real-device verification.

<div id="一个真实诊断-dltool2001" class="legacy-anchor" aria-hidden="true"></div>

## A real diagnostic: DLTOOL2001 {#dltool2001}

Running `docs verify-v5` on the original v5 guide reports `DLTOOL2001`: triple-backtick code blocks in a reconstructable guide require a language marker and `file=<relative-path>`. The guide contains an explanatory JSON block that does not meet this extraction contract.

The website retains that original failure and provides an independently identified `dawnlight-v5-guide-site-v1` variant. The variant changes only the explanatory block's fence and adds an identity note. The seven file blocks remain unchanged, and extraction matches the pinned example exactly.

When a diagnostic appears, check the input document's purpose and code-block contract. A derived version passing a check does not mean the original input passed.

<SourceNote path="docs/ShaderPackDiagnosticReference.md" label="Diagnostic code reference" />

## A repeatable investigation {#workflow}

1. Record the host commit, Manifest/ABI version, exact source inventory and options. Run pack validate and fix the first error at its file and RFC 6901 JSON pointer.
2. Use scene explain to confirm route ownership and fallback. Inspect graph resources, active commands and Program closure, then Program interface with contract 2 for v5.
3. Load that exact source in a creative world. Export the current published generation's reports and match pack/source/options before interpreting device evidence.
4. Repeat the failed command after repair, then reload, resize and return to BuiltIn. Keep old reports as history.

The [configuration repair lab](/en/troubleshooting/configuration-lab) supplies three complete expected-rejected ZIPs with observed DLMAN0001, file/pointer, failed graph/interface queries and successful repairs. The [symptom index](/en/troubleshooting/) links seven investigation paths.

## Exits and option transport {#exits-options}

Exit 0 means the requested check succeeded; 1 means contract or input failure, and 2 means command misuse. Inspect diagnostics even on exit 0. Read code, file and jsonPointer together; an empty pointer can describe the whole request. Fragment diagnostics retain the real fragment provenance. Never infer DLABI1002 merely from an unknown Provider name: the lab's actual code is DLMAN0001.

The option file is a JSON object keyed by full option IDs. Match boolean/integer/number types to the declaration. This pinned parser distinguishes integer and floating JSON tokens: use 1.0 for a number endpoint instead of an integer 1. Scene, Program interface and Data commands accept --options. Graph CLI on this baseline does not consume that override: request dawnlight/dumpGraph over JSON-RPC with contract 2 and explicit inputs.options. Do not label a default CLI graph as the selected branch.

[Schema and editor association](/en/tools/schema), [WorldFinal snapshots](/en/tools/content-snapshots) and [Scene/Data reports](/en/tools/driver-reports) complete the workflow. Program interface contract 2 consumes a Data report; driver-report inspect consumes a Scene report. A report of the wrong kind is a contract error, not proof of a shader defect.
