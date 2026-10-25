---
title: Large-pack relationships and case index
description: "Large-pack relationships and case index: steps, exact inputs, expected results and evidence limits."
lang: en-US
dawnlight:
  publication: published
  baseline: candidate-f8aaa5c4
  manifestVersions:
    - 3
    - 4
    - 5
  sceneAbiVersions:
    - 1
    - 2
  sourceRefs:
    - repository: website
      path: metadata/w7-case-studies.json

---

# Large-pack relationships and case index {#overview}

<BaselineNote />



## Read bounded slices at their exact versions {#method}

The diagrams describe selected Manifest/fragment bytes at the pinned commit. The [case projection](/downloads/examples/w7-case-studies.json) records file SHA-256, paths, conditions and command order. These are local dependency sketches, not complete active graphs for every option. Preserve original IDs, versions and ownership. The site does not redistribute whole large works or copy their images, textures or private host interfaces.

## Dawnlight v3.1: highlight chain and final output {#dawnlight}

This directory uses Manifest v3, so it is not a v5 Scene-route example. Selected composites.json contains composite1 → composite2 → composite3, writing highlight_texture and two distinct blur_temp_texture resources. output.json separately has final write current screen_output/texture_history, followed by screen_output with present and historyCommit. Many scene/cloud/water/shadow dependencies are omitted.

<CaseStudyNote id="dawnlight" />

Task: trace one highlight resource’s extent and sampler, compare separate intermediates with source overwrite, then locate final bindings through composition. This local sketch does not replace all barrier/phase ordering.

## ToonLab v0.1 v4: lighting color to outline {#toonlab}

Select shaderpack-candidates/ToonLab_v0.1_v4, Manifest v4, rather than the older shaderpacks entry. final writes toonlab:lighting/color. toon_outline reads that color, depth, normal, identifier and particles/coverage, writes toonlab:final/color plus current history, then screen_output presents/commits. ambient_occlusion is a separate preceding feature slice.

<CaseStudyNote id="toonlab" />

Compare with [luminance outlines](/en/recipes/luma-outline): geometry/category buffers reduce color-only ambiguity but add attachments, reads and coverage contracts. Trace this pack’s writer/decoder rather than inferring a fixed host normal/identifier encoding from names.

## MakeUp v0.21: explicit temporal resolve and commit {#makeup}

Manifest v5 / Scene ABI v2. makeupsc:taa in taa.json is active only for taa_mode∈{1,2}. Commands execute taa_resolve, taa_apply, color commit and depth commit. It reads current scene color/depth and previous histories, writes current histories and applies to scene color. bloom_chain_2/3/4 are separate conditional branches, not three simultaneously active chains.

<CaseStudyNote id="makeup" />

Study the Resource/Program/Service closure when disabling a feature and separate declared size from active cost. Preserve MakeUp’s UPSTREAM/attribution and version. This relationship extraction neither grants new asset rights nor reuses upstream runtime/performance acceptance.
