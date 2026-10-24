---
title: Versions and support
description: The host commit, Manifest v5, Scene ABI v2, tool identity and support boundaries for this documentation.
---

<div id="版本与支持范围" class="legacy-anchor" aria-hidden="true"></div>

# Versions and support {#versions-support}

<BaselineNote />

This edition targets one fixed host baseline. The main documentation covers Manifest v5 / Scene ABI v2. Historical v3/v4 examples support compatibility explanations; they do not directly replace new v5 course packs.

<div id="版本身份" class="legacy-anchor" aria-hidden="true"></div>

## Version identities {#version-identities}

| Item | Current value |
| --- | --- |
| Host commit | `f8aaa5c4218f54536ccf994a2d512aed2e3678b7` |
| Manifest | 5 |
| Scene ABI | 2 |
| materials / customData ABI | 1 / 1 |
| Manifest composition | 1 |
| Catalog / Graph output contracts | 2 / 2 |
| v5 Program interface | Explicit contract 2 |
| Pinned tool | `docs-tools-f8aaa5c4-w1.1` |

These numbers identify separate contracts. A single “v5” does not describe every interface version. You can also [download the baseline as JSON](/downloads/site-baseline.json) to check the identity of this documentation preview.

Public source is available at [Gitea / EltanceX / DawnlightCore](https://gitea.com/EltanceX/DawnlightCore). Anonymous access to the repository and this commit has been verified. Source links pin the commit, so changes to the upstream default branch do not silently change this baseline.

<div id="支持边界" class="legacy-anchor" aria-hidden="true"></div>

## Support boundaries {#support-boundaries}

| Area | Current scope |
| --- | --- |
| Initial runtime target | Windows x64, .NET 10, OpenGL ES 3.2, single main view |
| Public resource kinds | `texture2D`, `textureCube`, `buffer` |
| materials / typed custom data | Public contracts and offline tools exist; real-device claims depend on specific evidence |
| Android ARM64 | Preparation material exists; device validation is pending |
| Frame / Transient lifetime | Tokens are reserved, but the current resource converter rejects them; they are not usable allocators |
| General texture3D / textureArray declarations | Outside the current public resourceKind surface |
| Geometry / Tessellation stages | No undocumented configuration entry points are provided |
| Split screen, multiple views, full VR shaders | Outside this baseline's commitments |

G9 comparison sampling, public temporal views, jitter and light-frustum geometry each have their own version and capability boundaries. Later reference pages will explain them individually. The presence of a token does not establish support in every execution environment.

<div id="本轮已核对什么" class="legacy-anchor" aria-hidden="true"></div>

## What has been checked {#verified-scope}

The pinned inputs and toolchain completed 19 GL-free checks: 18 succeeded, and one confirmed the original guide's known `DLTOOL2001` failure. The independent website guide variant passed reconstruction checks. Four representative upstream packs passed the Loader. Six engineering regression tests also covered tamper rejection, line-ending preservation, restoration and related behavior.

These results belong to the recorded baseline; they do not prove that every pack configuration runs. No new GPU execution, game screenshots, runtime material mapping or performance acceptance has been added.

<div id="文档建设进度" class="legacy-anchor" aria-hidden="true"></div>

## Documentation progress {#documentation-progress}

The reading guide, pipeline model, resources and targets, Analyzer and version scope are available in Chinese and English. Step-by-step tutorials, a starter pack, downloadable examples and complete field references remain for later phases. Unfinished pages do not appear in navigation.

Website source and page content are public. The full upstream snapshot remains local and in pinned private assets. Static builds use only committed public pages and pinned metadata; complete upstream Analyzer verification runs through a separate process.
