---
title: From configuration to a frame
description: Understand the roles and execution relationships of Phase, Pass, Command, Program and Resource in DawnlightCore.
---

<div id="从配置到一帧画面" class="legacy-anchor" aria-hidden="true"></div>

# From configuration to a frame {#configuration-to-frame}

<BaselineNote />

A shader pack must answer two kinds of questions: how GLSL computes color, and when those computations run, what they read and where they write. JSON describes the latter and connects shader programs through executable resource and command relationships.

<div id="五个核心概念" class="legacy-anchor" aria-hidden="true"></div>

## Five core concepts {#core-concepts}

| Concept | Role | What to look for in configuration |
| --- | --- | --- |
| Phase | Identifies an execution point provided by the host | Which scene phase does this work belong to? |
| Pass | Declares work together with its Stage, programs and commands | What are its dependencies, conditions and execution position? |
| Command | Describes an operation | Does it draw geometry, draw fullscreen, dispatch compute, copy or clear? |
| Program | Specifies shader entry points and compilation settings | Which GLSL files and compilation modes does it use? |
| Resource | Declares storage that operations can read or write | What are its format, size, lifetime and producer? |

A Provider supplies host geometry submission or another public capability. A Service handles the corresponding host service and state. Their IDs and versions come from the current Catalog; inventing a string with a similar name does not create a new capability.

<div id="从声明到执行" class="legacy-anchor" aria-hidden="true"></div>

## From declarations to execution {#declarations-to-execution}

Read a pack along this path:

```text
Manifest and composition files
    ↓ Loading, reference resolution and semantic checks
Dependencies between resources / Programs / Passes / Commands
    ↓ Build a candidate generation
Invoke Stages and commands at host execution points
    ↓
Read resources → run shaders or host operations → write targets
```

Resource and program declarations provide objects to reference; commands determine how to use them. The same Program can serve different call configurations. Configuration must also describe the read and write relationships explicitly.

Within a `dawnlight:command_list@1` Stage, commands execute in Manifest order. Dependencies between Passes, read/write hazards and phase direction still require loading and graph analysis. The order of one text block is not a universal scheduling rule for every stage.

<div id="七类通用命令" class="legacy-anchor" aria-hidden="true"></div>

## Seven generic command types {#command-types}

| `type` | Operation | `program` rule |
| --- | --- | --- |
| `fullscreen` | Draw fullscreen to a named target | Required |
| `compute` | Dispatch compute and declare barriers | Required |
| `copy` | Copy framebuffer resources | Not allowed |
| `clear` | Clear a named target or the default framebuffer | Not allowed |
| `present` | Draw the final fullscreen output to the default framebuffer | Required |
| `engineDraw` | Invoke a host geometry Provider | Optional |
| `historyCommit` | Mark a History resource as complete for the frame | Not allowed |

Commands without a Program still participate in resource or ordering analysis. For example, `copy` needs an actual source read and destination write. `historyCommit` is a lifecycle event; it cannot stand in for a texture write.

<SourceNote path="docs/DawnlightGenericCommandTypes.md" label="Generic Command contracts and History constraints" />

<div id="json、glsl-与宿主怎样分工" class="legacy-anchor" aria-hidden="true"></div>

## How JSON, GLSL and the host work together {#json-glsl-host}

Suppose you want to apply color grading to a rendered scene:

1. A **resource** stores scene color; configuration determines its size, format and lifetime.
2. A **Program** references a fullscreen vertex shader and a color-grading fragment shader.
3. A **Command** binds scene color to a shader input and selects the output target.
4. **GLSL** samples the input and computes a new color.
5. The **host** schedules the work at the appropriate execution point and manages graphics resources and state.

This explanation establishes responsibilities. A valid complete external pack must also handle host scene takeover, whole-frame targets and fallback paths. Having a post-processing shader alone does not establish a complete scene setup.

<div id="读一个包时先找什么" class="legacy-anchor" aria-hidden="true"></div>

## Where to start when reading a pack {#reading-a-pack}

Find scene color and depth in the resource list, then find the commands that produce them. Follow the post-processing chain to the final output. Check the input ID, target, format and lifetime at each connection.

If you cannot find a producer, check the current enable conditions and BuiltIn fallback, then use Analyzer to explain the active graph. Continue with [Resources, targets and drawBuffers](./resources-targets) to separate the different parts of choosing an output destination.
