---
title: Independent pack runtime observations
description: Exact source identities, branch observations and limits of the W6 agent reproduction.
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
      path: metadata/w6-runtime.json
    - repository: website
      path: metadata/w6-examples-validation.json
---

# Independent pack runtime observations {#runtime}

<BaselineNote />

The agent tested the six independent ZIPs in an isolated copy of the pinned Windows host, using a creative world and one main view. Local maintenance commands requested switches and exported reports at frame boundaries. Screenshots were inspected through the computer-use skill. This is an agent reproduction; an independent human trial is still outstanding.

## Host and evidence boundaries {#scope}

Host f8aaa5c4218f54536ccf994a2d512aed2e3678b7; Windows x64, .NET 10, OpenGL ES 3.2, RTX 4050 Laptop GPU, NVIDIA 566.07. Static source/ZIP checks, Scene driver link/framebuffer observations, Data prepared-interface comparisons and screenshots are recorded separately. No performance gate, numeric uniform/SSBO readback, full category coverage, Android, VR, multiple views, device loss or other GPU is claimed.

## Chapter observations {#chapters}

<PackRuntimeNote example="course/05-options" />

<PackRuntimeNote example="course/06-custom-data" />

<PackRuntimeNote example="course/07-materials" />

<PackRuntimeNote example="course/08-post-chain" />

<PackRuntimeNote example="course/09-complete-pack" />

<PackRuntimeNote example="course/10-distribution" />

## Fresh ZIP reproduction {#reader-reproduction}

<PackRuntimeNote reader />

For another author: download the final ZIP, verify its hash, extract it into a new shaderpacks child directory, apply balanced/economy/neutral values, reload, resize and switch to BuiltIn. Record an independent human trial separately. The full local WorldFinal and Data driver reports remain private; the public summary carries hashes and bounded results.

## Authored settings UI {#settings}

Press U → Options → Amber course. The agent toggled glow off and clicked Apply: generation advanced from 77 to 78, with course:glow=false and the glow Program absent. The default and applied screenshots show the actual UI.

![Default authored settings](/media/w6/settings.jpg)

![Glow disabled and applied](/media/w6/settings-applied.jpg)

[UI application record](/evidence/w6/settings-observation.json)
