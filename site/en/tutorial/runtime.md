---
title: Runtime observations and reproduction
description: Test host identity, real driver reports, lifecycle observations and the limits of W4 evidence.
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
      path: metadata/w4-runtime.json
    - repository: website
      path: metadata/w4-reviewed-sources.json
---

# Runtime observations and reproduction {#runtime}

<BaselineNote />

On 2026-10-24 (America/New_York), five course snapshots ran in a copied Windows Debug build from source HEAD **f8aaa5c4**, matching this website’s locked baseline. The source worktree was clean; the EXE/DLL/Content fingerprints identify the supplied build without claiming a fresh reproducible build. The original runtime, worlds and settings were untouched. A new creative world used seed Dawnlight-W4 and fixed daytime.

## Host and method {#host}

The driver reported **OpenGL ES 3.2 NVIDIA 566.07**, **NVIDIA GeForce RTX 4050 Laptop GPU**, GLSL ES 3.20. An isolated init.js hook invoked the public switch coordinator on real game frames and recorded published generations, pending work, errors and window size. A separate computer-use pass inspected the actual window and confirmed **U → Shader Packs → select → Apply**. Selection alone retained the previous active source. Screenshots are window captures with only the title bar removed and size reduced; they are not browser or offscreen-render evidence.

![Shader-pack selector with the starter active](/media/w4/loading-menu-active.jpg)

The older, corrected runtime path is excluded from this record. Driver reports do not contain copied built-in shader source.

## Results {#results}

Each snapshot loaded, reloaded into a later published generation, resized between 2048×1222 and 1024×640, and returned to BuiltIn with no switch error. Every reported Program linked. The pinned Analyzer matched each report to the pack and matched each pack-owned Program interface. The runtime queries use the Scene Program interface contract (default v1); the v5 static course checks also use their separately supported contract 2. Do not pass a Scene driver report to the data-interface report reader.

| Chapter | Driver / lifecycle / image |
| --- | --- |
| [course/00-starter](/en/tutorial/00-starter) | [Driver](/evidence/w4/00-starter-driver.json) · [Lifecycle](/evidence/w4/00-starter-lifecycle.json) · [Image](/media/w4/00-starter.jpg) |
| [course/01-first-post](/en/tutorial/01-first-post) | [Driver](/evidence/w4/01-first-post-driver.json) · [Lifecycle](/evidence/w4/01-first-post-lifecycle.json) · [Image](/media/w4/01-first-post.jpg) |
| [course/02-resources](/en/tutorial/02-resources) | [Driver](/evidence/w4/02-resources-driver.json) · [Lifecycle](/evidence/w4/02-resources-lifecycle.json) · [Image](/media/w4/02-resources.jpg) |
| [course/03-scene](/en/tutorial/03-scene) | [Driver](/evidence/w4/03-scene-driver.json) · [Lifecycle](/evidence/w4/03-scene-lifecycle.json) · [Image](/media/w4/03-scene.jpg) |
| [course/04-mrt](/en/tutorial/04-mrt) | [Driver](/evidence/w4/04-mrt-driver.json) · [Lifecycle](/evidence/w4/04-mrt-lifecycle.json) · [Image](/media/w4/04-mrt.jpg) |

![After returning to BuiltIn](/media/w4/builtin.jpg)

## Fresh-directory reproduction {#reproduction}

A deterministic chapter 01 ZIP was extracted into a new shaderpacks/reader-first-post directory and loaded without earlier chapter files. The saved strength edits 0.0 and 1.0 each published a new generation. The original bytes were restored and BuiltIn reactivated. [Machine-readable record](/evidence/w4/reader-reproduction.json). This is an agent reproduction, **not independent human usability testing**.

Obstacles found: one extra extraction directory prevents discovery; selected and active source differ; discovery refresh does not recompile GLSL; fallback declarations cannot author drawBuffers; host normal data is oct encoding rather than XYZ; the built-in offscreen screenshot helper does not capture external present output correctly, so window screenshots were used. The first isolated startup also referenced the absent default Dawnlight_v3.1 source and fell back to BuiltIn; this historical warning stayed in the title bar after successful switches. It is not a course-pack load failure.

## Evidence limits {#limits}

One GPU and one world establish a bounded observation. Device reset, Android, VR, every Terrain category, particles under all conditions, pixel equivalence to BuiltIn, performance and independent human trials remain unverified. Auxiliary MRT data covers opaque Terrain only. Chapter 03 deliberately differs in lighting; chapter 04 displays encoded bytes, not decoded direction. No complete visible-surface G-buffer is claimed. Legacy ZIP README and static-receipt runtime flags describe their original evidence scope; the dated records on this page add separate observations.

[Machine-readable identity and file hashes](https://github.com/EltanceX/dawnlight-core-docs/blob/main/metadata/w4-runtime.json) · [Begin chapter 00](/en/tutorial/00-starter)

[Reviewed host sources and Git-blob identities](https://github.com/EltanceX/dawnlight-core-docs/blob/main/metadata/w4-reviewed-sources.json).
