---
title: Reading guide
description: Find your path from basic GLSL to a JSON-driven rendering pipeline, and understand the current scope of DawnlightCore documentation.
---

<div id="从这里开始" class="legacy-anchor" aria-hidden="true"></div>

# Start here {#start-here}

<BaselineNote />

DawnlightCore is a shader-focused modification of Survivalcraft. It connects resource declarations, shader registration and rendering commands through a general-purpose pipeline. Shader pack authors use JSON to organize execution and GLSL to implement visual effects.

This documentation is for authors with basic GLSL knowledge who want to create independent shader packs. It currently covers verifiable core concepts and validation methods. Step-by-step courses, a starter pack and complete field references will follow.

<div id="需要哪些基础" class="legacy-anchor" aria-hidden="true"></div>

## Prerequisites {#prerequisites}

- **JSON**: read objects, arrays, strings and numbers, and distinguish field names from reference IDs.
- **GLSL**: understand vertex and fragment shaders, uniforms, texture sampling and coordinate transforms.
- **Basic rendering concepts**: know the roles of color, depth, textures and framebuffers.

Writing a shader pack primarily involves JSON and GLSL. The host's C# code provides lifecycle management, rendering capabilities and public contracts. Extending that source is necessary when you need a new host capability.

<div id="推荐阅读顺序" class="legacy-anchor" aria-hidden="true"></div>

## Suggested reading order {#reading-order}

| Order | Page | What you should be able to answer |
| --- | --- | --- |
| 1 | [Versions and support](../compatibility/current-baseline) | Which host commit, Manifest version and Scene ABI does the documentation target? |
| 2 | [From configuration to a frame](../concepts/pipeline) | How do Pass, Command, Program and Resource work together? |
| 3 | [Resources, targets and drawBuffers](../concepts/resources-targets) | Where does a draw write its output, and how does the next draw read it? |
| 4 | [Analyzer and evidence](../tools/analyzer) | What evidence establishes valid configuration, and what establishes actual visual results? |

<div id="怎样使用这些文档" class="legacy-anchor" aria-hidden="true"></div>

## Using this documentation {#using-the-docs}

Concept pages explain relationships and constraints. Field names retain their original spelling so you can search for them and compare them with the source. Snippets state their purpose explicitly. A complete loadable pack must also provide resources, scene routing, fallback behavior and whole-frame output; saving an isolated snippet as `shaderpack.json` is not enough.

The top of each page identifies the main contracts and host baseline. Source links point to the exact commit in the [public upstream repository](https://gitea.com/EltanceX/DawnlightCore). If behavior differs, compare versions before checking the relevant file.

::: tip Trace the data flow first
When reading an example, trace a path: who produces a resource → which command writes it → who reads it next → how it reaches the final output. This helps locate problems before you memorize every field.
:::

<div id="当前运行与文档范围" class="legacy-anchor" aria-hidden="true"></div>

## Runtime and documentation scope {#runtime-and-docs-scope}

The initial runtime baseline is Windows x64, .NET 10, OpenGL ES 3.2 and a single main view. See [Versions and support](../compatibility/current-baseline#support-boundaries) for Android, full VR, multiple views and other capability boundaries.

This website is a static reference. The browser does not run Survivalcraft shader packs. Tool output, real driver compilation, game visuals and performance each require their own evidence.
