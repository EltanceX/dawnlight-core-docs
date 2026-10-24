---
title: 资源、目标与 drawBuffers
description: 区分资源声明、目标附件、输出 location 与活动 drawBuffers，理解渲染结果的读写关系。
lang: zh-CN
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

# 资源、目标与 drawBuffers {#resources-targets}

<BaselineNote />

一张纹理只是可存储数据的资源。要把一次绘制的输出写进去，还需要声明绘制目标，并确定着色器输出和目标附件之间的对应关系。

<div id="资源声明解决存储问题" class="legacy-anchor" aria-hidden="true"></div>

## 资源声明解决存储问题 {#resource-storage}

资源 ID 用于在配置中引用同一份对象；格式、大小和生命周期决定如何创建和管理它。当前公开资源类型包含 `texture2D`、`textureCube` 和 `buffer`。

以下是说明字段关系的**资源对象片段**，不构成完整光影包：

```json
{
  "id": "example:scene/color",
  "kind": "texture2D",
  "lifetime": "persistent",
  "size": { "mode": "viewport" },
  "format": "rgba8"
}
```

这里声明了一个随 viewport 尺寸变化的持久颜色资源。它尚未说明由谁写入，也没有替任何 Program 建立采样输入。

<SourceNote path="docs/ShaderPackAuthorGuideP11V5.md" label="v5 作者指南中的资源与可重建示例" />

<div id="把四个层次分开" class="legacy-anchor" aria-hidden="true"></div>

## 把四个层次分开 {#four-layers}

| 层次 | 解决的问题 |
| --- | --- |
| Resource | 哪个对象保存数据？ |
| Target / attachment topology | 本次绘制目标包含哪些颜色或深度附件？ |
| GLSL 输出 `location` | 片元着色器从哪个输出位置写出数据？ |
| `drawBuffers` | 本次调用启用哪些颜色输出映射？ |

附件布局与活动 draw buffers 是两个层次。某个目标包含多个颜色附件，不表示每次绘制都要写入全部附件；反过来，选择一个活动输出也不会自动创建缺失的资源或附件。

深度附件也有独立用途。它参与深度测试和相应深度操作，不能直接当作普通的颜色输出 location 使用。

<div id="多个颜色输出-mrt" class="legacy-anchor" aria-hidden="true"></div>

## 多个颜色输出：MRT {#mrt}

MRT 让一次绘制产生多个颜色结果。例如一个包可以约定将最终颜色、法线编码和材质信息分别写入不同的颜色附件。

法线和材质的编码属于包自己的约定：生产者怎样编码，后续消费者就要怎样解码。文档中的示意不代表宿主提供了一套固定 G-buffer 格式。

GLSL 中声明多个 `layout(location = ...) out` 变量以后，还需核对配置里的目标布局、活动 `drawBuffers`、格式与实际驱动能力。源码能写出这些变量，只完成了其中一部分工作。

<SourceNote path="docs/ShaderPackAuthorGuide.md" label="v3/v4 指南中的 Scene ABI 与 MRT 示例" />

<div id="写入和采样分别建立关系" class="legacy-anchor" aria-hidden="true"></div>

## 写入和采样分别建立关系 {#writes-and-sampling}

一个后处理读取前一步颜色时，检查以下路径：

```text
生产命令 → 命名资源 → 后续命令的输入绑定 → sampler
```

目标负责写入，binding 负责把资源连接到着色器输入。给资源取一个与 uniform 相似的名字，不会自动建立采样关系。

还要检查资源尺寸是否符合预期、数据是否需要保留、生产者是否在当前选项下启用，以及当前调用是否存在读写危害。

<div id="常见排查顺序" class="legacy-anchor" aria-hidden="true"></div>

## 常见排查顺序 {#troubleshooting}

画面全黑或某个附件没有预期内容时，先核对：

1. 资源是否存在，且格式适用于当前用途。
2. 当前活动图中是否有命令写入该资源。
3. 目标附件与输出 location 是否对应，`drawBuffers` 是否启用了预期输出。
4. 消费者是否绑定了同一个资源，以及正确的 view / history。
5. GLSL、帧缓冲与设备端结果是否有真实驱动证据。

用 [Analyzer](../tools/analyzer) 定位配置与离线接口问题，再进入实际图形驱动验证。
