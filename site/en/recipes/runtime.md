---
title: Basic effect runtime observations
description: "Basic effect runtime observations: steps, exact inputs, expected results and evidence limits."
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
      path: metadata/w7-runtime.json
    - repository: website
      path: metadata/w7-examples-validation.json
---

# Basic effect runtime observations {#overview}

<BaselineNote />



## Host, method and limits {#scope}

An isolated Windows copy of pinned f8aaa5c4, one creative world and one main view. Linked/FBO report observations and screenshots are recorded separately. Raw reports, worlds and the maintenance hook stay local. No numeric readback, RenderDoc, formal performance, other GPU/platform, device-loss, VR or multiple-view acceptance is claimed.

## Observations for each independent pack {#effects}

<PracticeRuntimeNote example="features/color-balance" />

<PracticeRuntimeNote example="features/vignette" />

<PracticeRuntimeNote example="features/luma-outline" />

## Invalid candidate and recovery {#rollback}

The controlled unknown-provider request timed out in the frame bridge. After restoring the exact Manifest bytes the active pack remained usable, but this does not establish runtime rejection or rollback. The three source/ZIP negative cases and their successful repairs are verified offline in the [configuration lab](/en/troubleshooting/configuration-lab). Runtime failure preservation remains unverified. Agent observations are not an independent human trial.
