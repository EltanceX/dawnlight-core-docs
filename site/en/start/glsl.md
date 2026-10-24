---
title: GLSL essentials for the course
description: Learn only the GLSL concepts used by the first five complete shader-pack snapshots.
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

# GLSL essentials for the course {#chapter}

<BaselineNote />

JSON describes resources and execution; GLSL computes vertices and pixels. Read a vertex main first, then its matching fragment main. This course uses GLSL ES 3.20 with #version 320 es.

## Values and stages {#values}

float is scalar, vec2/3/4 are vectors, mat4 transforms a position, and uint preserves integer identifiers. Uniforms are supplied by bindings; in/out connects stages. flat keeps an identifier from being interpolated. A fullscreen vertex shader generates a quad from gl_VertexID; Terrain instead consumes the host’s public vertex attributes.

## Read a pixel {#pixel}

sampler2D names a bound texture, texture samples normalized UV coordinates, and texelFetch reads an integer pixel without interpolation. mix(a,b,s) blends endpoints; clamp limits values. Start with the complete chapter 01 fragment shader:

<<< @/../examples/course/01-first-post/shaders/present.psh{glsl}

## Compile and reason {#compile}

Keep precision declarations in fragment shaders. Sampler names must match manifest symbols exactly. A Program combines vertex and fragment files; successful source analysis does not prove driver link success. Read errors from the first diagnostic, with filename and line, then force-reload the saved file. No online shader editor can reproduce the host’s bindings by itself.

For each line ask: which stage runs it, where does its input come from, what output location receives it, and is the value normalized color, encoded data or an integer? Chapter 04 relies on these distinctions.

[Begin chapter 00](/en/tutorial/00-starter)
