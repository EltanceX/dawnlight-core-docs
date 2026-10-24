---
title: 阅读路线
description: 从基础 GLSL 到 JSON 数据驱动管线，了解 DawnlightCore 作者文档的阅读顺序与当前范围。
lang: zh-CN
dawnlight:
  publication: published
  baseline: candidate-f8aaa5c4
  manifestVersions:
    - 5
  sceneAbiVersions:
    - 2
  sourceRefs:
    - repository: website
      path: metadata/public-source.json
---

<div id="从这里开始" class="legacy-anchor" aria-hidden="true"></div>

# 从这里开始 {#start-here}

<BaselineNote />

DawnlightCore 是 Survivalcraft 的光影改版。它将资源声明、着色器注册和渲染命令连接到一套通用管线，让光影包作者通过 JSON 组织执行关系，通过 GLSL 实现具体效果。

这份文档面向希望制作独立光影包的作者。从[环境准备](./environment)和 [GLSL 基础](./glsl)开始，按第 00～10 章完成加载、调色、独立资源、Terrain 接入和 MRT 数据写入。每章提供完整源码、独立下载、静态收据及单独记录的实机观察；[JSON 与 ABI 参考](../reference/)提供字段、行为约束、公共目录和版本差异。

<div id="需要哪些基础" class="legacy-anchor" aria-hidden="true"></div>

## 需要哪些基础 {#prerequisites}

- **JSON**：能阅读对象、数组、字符串和数字，理解字段与引用 ID 的区别。
- **GLSL**：了解顶点与片元着色器、uniform、纹理采样和坐标变换。
- **基本渲染概念**：知道颜色、深度、纹理和帧缓冲分别承担什么职责。

编写光影包主要涉及 JSON 与 GLSL。宿主 C# 提供生命周期、渲染能力和公共合同；需要新增宿主能力时，再进入源码层扩展。

<div id="推荐阅读顺序" class="legacy-anchor" aria-hidden="true"></div>

## 推荐阅读顺序 {#reading-order}

| 课程 | 动手目标 |
| --- | --- |
| [00 · 加载起步包](../tutorial/00-starter) | 从空目录加载并切回 BuiltIn |
| [01 · 第一个后处理](../tutorial/01-first-post) | 修改暖色强度并重载 |
| [02 · 独立资源](../tutorial/02-resources) | 追踪写者、读者和顺序 |
| [03 · 场景接入](../tutorial/03-scene) | 接管 opaque Terrain |
| [04 · MRT 数据](../tutorial/04-mrt) | 写入法线和教学标识符 |
| [05 · 可选效果与设置](/tutorial/05-options) | 制作并验证本章完整独立包 |
| [06 · 时间、天气与自定义数据](/tutorial/06-custom-data) | 制作并验证本章完整独立包 |
| [07 · 稳定内容与材质表](/tutorial/07-materials) | 制作并验证本章完整独立包 |
| [08 · 多级后处理与成本](/tutorial/08-post-chain) | 制作并验证本章完整独立包 |
| [09 · 组合独立光影包](/tutorial/09-complete-pack) | 制作并验证本章完整独立包 |
| [10 · 验证与分发](/tutorial/10-distribution) | 制作并验证本章完整独立包 |

以下概念页可与课程交叉阅读；[实机记录](../tutorial/runtime)说明实际测试范围。

| 顺序 | 页面 | 读完后应能回答 |
| --- | --- | --- |
| 1 | [版本与支持范围](../compatibility/current-baseline) | 文档针对哪个宿主 commit、Manifest 与 Scene ABI？ |
| 2 | [从配置到一帧画面](../concepts/pipeline) | Pass、Command、Program 与 Resource 怎样协作？ |
| 3 | [资源、目标与 drawBuffers](../concepts/resources-targets) | 一次绘制写到哪里，下一次绘制怎样读取结果？ |
| 4 | [Analyzer 与证据边界](../tools/analyzer) | 配置合法与实际画面验证分别需要什么证据？ |

<div id="怎样使用这些文档" class="legacy-anchor" aria-hidden="true"></div>

## 怎样使用这些文档 {#using-the-docs}

概念页说明关系与约束，字段名保留原有英文，便于搜索和对应源码。页面中的片段会明确注明用途；完整可加载包需要配齐资源、场景路由、fallback 和整帧输出，不能只把某个片段保存为 `shaderpack.json`。

每页顶部标明主线合同和宿主基线。来源链接指向 [公开上游仓库](https://gitea.com/EltanceX/DawnlightCore) 的精确 commit；遇到行为差异时，先比较版本，再核对对应文件。

::: tip 先建立数据流
阅读示例时，按“资源由谁产生 → 哪条命令写入 → 后续谁读取 → 最后如何输出”画出一条路径。这比先记住所有字段更容易定位问题。
:::

<div id="当前运行与文档范围" class="legacy-anchor" aria-hidden="true"></div>

## 当前运行与文档范围 {#runtime-and-docs-scope}

首版运行基线为 Windows x64、.NET 10、OpenGL ES 3.2、单主 view。Android、完整 VR、多 view 与其他能力的边界见[版本页](../compatibility/current-baseline#支持边界)。

网站是静态参考，浏览器不会运行 Survivalcraft 光影包。工具输出、真实驱动编译、游戏画面和性能各有独立的验证范围。
