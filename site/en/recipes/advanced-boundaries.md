---
title: History, temporal and shadow boundaries
description: "History, temporal and shadow boundaries: steps, exact inputs, expected results and evidence limits."
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
      path: docs/DawnlightGenericCommandTypes.md
      commit: f8aaa5c4218f54536ccf994a2d512aed2e3678b7
    - repository: upstream
      path: docs/DawnlightTemporalViewABI.md
      commit: f8aaa5c4218f54536ccf994a2d512aed2e3678b7
    - repository: upstream
      path: docs/DawnlightLightFrustumGeometryABI.md
      commit: f8aaa5c4218f54536ccf994a2d512aed2e3678b7
    - repository: website
      path: metadata/w7-case-studies.json
---

# History, temporal and shadow boundaries {#overview}

<BaselineNote />



## History is a resource lifetime {#history}

Distinguish persistent storage from a history ring: declare capacity, current/previous views and fallback, then historyCommit after all current-frame writers. A commit is an ordering/lifecycle event, not a texture write. Barriers cannot repair duplicate commit, missing writer or a writer after commit. A disabled/skipped producer does not imply previous has advanced.

The selected MakeUp TAA slice declares two-slot RGBA16F color and R32F depth histories: nominal payload 24WH bytes, plus a 1×1 RGBA8 fallback. Other scene targets, alignment and residency are excluded. See resolve → apply → separate commits in the [case](/en/cases/#makeup).

## View continuity differs from GPU-history validity {#temporal}

Public dawnlight:temporal_view@1 inputs describe the last successfully committed main view. MissingView differs from available + history_valid=false; the latter can supply current values and fallback previous values. Failed or repeated full renders in one frame do not commit; skipped views do not advance. Continuity depends on generation/world/device/owner/camera/extent, logical projection, cuts and jitter configuration.

G5 data consumption does not enable jitter. dawnlight:view_jitter@1 is an explicit active Service closure. Reconstruct jittered depth using render_projection_inverse_matrix, not an old unjittered matrix; do not apply camera delta twice or flip Y without contract justification. view_history_valid does not replace texture-history availability, depth consistency, screen bounds or hand/sky classification. Read the frozen early runtimeReady=false contract separately from later G5/G6 implementation records.

## Light geometry is not a complete shadow effect {#shadows}

dawnlight:light_frustum_geometry@1 supplies light-frustum geometry/matrices; dawnlight:light_frustum/matrix@1 maps absolute world to native GL clip [-1,1], so do not convert logical depth again. The service creates no shadow texture, Program or history and does not implicitly update old CSM. The pack supplies caster Providers, targets, clear/state, filtering, bias and receiver sampling.

Published Terrain/instanced/skinned light_geometry categories have separate constraints. Without hand/particle/moving-block caster contracts there is no full-scene shadow claim. The main camera’s visible list cannot replace light-frustum selection. Check matching writer/receiver projections and depth conventions, duplicate conversion, clear, alpha cutoff and bias rather than hiding faults with ever-larger bias.

## Acceptance scope for advanced topics {#acceptance}

These are traceable public contracts and case studies, not new TAA/shadow runtime acceptance. This run exercises three history-free basic effects. Temporal/shadow/CSM behavior, device recovery, multiple views, Android/VR, special Mod categories and performance need their own evidence. A passing upstream lab or interface probe does not establish support for every work.
