---
title: Resources, targets and drawBuffers
description: Distinguish resource declarations, target attachments, output locations and active drawBuffers, and trace rendering reads and writes.
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
      path: docs/ShaderPackAuthorGuideP11V5.md
      commit: f8aaa5c4218f54536ccf994a2d512aed2e3678b7
    - repository: upstream
      path: docs/ShaderPackAuthorGuide.md
      commit: f8aaa5c4218f54536ccf994a2d512aed2e3678b7
---

<div id="资源、目标与-drawbuffers" class="legacy-anchor" aria-hidden="true"></div>

# Resources, targets and drawBuffers {#resources-targets}

<BaselineNote />

A texture is a resource that can store data. Writing a draw's output into it also requires a drawing target and a mapping between shader outputs and target attachments.

<div id="资源声明解决存储问题" class="legacy-anchor" aria-hidden="true"></div>

## Resource declarations describe storage {#resource-storage}

A resource ID refers to the same object throughout configuration. Format, size and lifetime determine how that object is created and managed. The current public resource kinds are `texture2D`, `textureCube` and `buffer`.

The following **resource object fragment** illustrates field relationships. It is not a complete shader pack:

```json
{
  "id": "example:scene/color",
  "kind": "texture2D",
  "lifetime": "persistent",
  "size": { "mode": "viewport" },
  "format": "rgba8"
}
```

This declares a persistent color resource that follows the viewport size. It does not identify a writer or establish a sampling input for any Program.

<SourceNote path="docs/ShaderPackAuthorGuideP11V5.md" label="Resources and reconstructable examples in the v5 author guide" />

<div id="把四个层次分开" class="legacy-anchor" aria-hidden="true"></div>

## Separate the four layers {#four-layers}

| Layer | Question it answers |
| --- | --- |
| Resource | Which object stores the data? |
| Target / attachment topology | Which color or depth attachments belong to this draw target? |
| GLSL output `location` | At which output location does the fragment shader write data? |
| `drawBuffers` | Which color output mappings are active for this call? |

Attachment layout and active draw buffers are separate layers. A target with several color attachments does not require every draw to write all of them. Selecting an active output does not create a missing resource or attachment.

A depth attachment has a separate role in depth testing and related depth operations. It cannot be used directly as an ordinary color output location.

<div id="多个颜色输出-mrt" class="legacy-anchor" aria-hidden="true"></div>

## Multiple color outputs: MRT {#mrt}

MRT allows a draw to produce multiple color results. A pack might write final color, encoded normals and material information to separate color attachments.

Normal and material encodings are the pack's own conventions: consumers must decode what producers encode. These illustrations do not establish a fixed G-buffer format supplied by the host.

After declaring multiple `layout(location = ...) out` variables in GLSL, check the configured target layout, active `drawBuffers`, formats and actual driver capabilities. Being able to write those variables in source completes only part of the work.

<SourceNote path="docs/ShaderPackAuthorGuide.md" label="Scene ABI and MRT examples in the v3/v4 guide" />

<div id="写入和采样分别建立关系" class="legacy-anchor" aria-hidden="true"></div>

## Connect writes and sampling separately {#writes-and-sampling}

When post-processing reads the previous step's color, trace this path:

```text
Producing command → named resource → later command's input binding → sampler
```

The target determines writes; a binding connects a resource to a shader input. Giving a resource a name similar to a uniform does not establish that sampling relationship.

Also check that resource dimensions are correct, whether data must be retained, whether the producer is enabled by the current options and whether the call has any read/write hazards.

<div id="常见排查顺序" class="legacy-anchor" aria-hidden="true"></div>

## Troubleshooting order {#troubleshooting}

If the screen is black or an attachment lacks its expected contents, check:

1. The resource exists and its format suits the intended use.
2. A command in the active graph writes that resource.
3. Target attachments match output locations, and `drawBuffers` enables the intended outputs.
4. The consumer binds the same resource with the correct view / history.
5. Actual driver evidence is available for GLSL, framebuffer and device results.

Use [Analyzer](../tools/analyzer) to locate configuration and offline interface problems, then validate on the actual graphics driver.
