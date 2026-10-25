---
title: Basic effect practice
description: "Basic effect practice: steps, exact inputs, expected results and evidence limits."
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
      path: metadata/w7-examples-validation.json
---

# Basic effect practice {#overview}

<BaselineNote />



## Start with one independent effect {#choose}

- [Color balance: one-sample LDR adjustment](/en/recipes/color-balance)
- [Vignette: dimensions and aspect ratio](/en/recipes/vignette)
- [Luminance outline: limits of local contrast](/en/recipes/luma-outline)

Also see [half-resolution glow](/en/tutorial/08-post-chain), [day/weather data](/en/tutorial/06-custom-data) and [material styling](/en/tutorial/07-materials). These reuse frozen course packs rather than creating editable duplicates.

## Estimate before measuring {#costs}

Compare identical extents, worlds, options and source versions. Intermediate textures, sample counts and closures can be described statically; GPU time, memory residency and whole-frame performance require measurements. Check active resources after disabling an effect. “Optional effects” still require base resources.

[Runtime scope](/en/recipes/runtime) · [Advanced boundaries](/en/recipes/advanced-boundaries) · [Large-pack cases](/en/cases/)
