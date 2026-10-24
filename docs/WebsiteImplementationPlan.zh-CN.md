# DawnlightCore 文档网站实现方案与实施步骤

> 文档状态：持续实施中的方案；W0/W1/W2/W3 已完成，W4 课程主线与有限实机观察已交付，独立真人试读待完成。
>
> 补充实现：按用户要求为当前六个页面增加完整英文版与顶栏语言切换，中文路径不变，英文位于 `/en/`；维护规则见 [双语页面维护](maintenance/Locales.zh-CN.md)。
>
> 编写日期：2026-10-23。
>
> 当前项目：`E:/Projects/document-site/dawnlight-core`。
>
> 参考宿主：`E:/sc/2.4 Rebuild/1.81-3/DawnlightCore`。
>
> 本次调研对应宿主 commit：`f8aaa5c4218f54536ccf994a2d512aed2e3678b7`。该 commit 是调研起点，不能仅凭此记录认定所有功能已经完成发布验收。
>
> 实施进度（2026-10-24）：W0 已冻结范围与候选基线，W1 已完成输入与工具链，W2 已完成网站骨架与首次 Pages 部署。W3 已建立示例/页面登记、合法外置起步包、同源代码与 ZIP 生成、Analyzer 收据及失败拦截。W4 已交付环境、GLSL、00～04 双语课程和五个独立快照，完成一台 Windows / NVIDIA 设备上的逐章观察与代理复现，独立真人试用仍待完成。见 [W0](baseline/W0BaselineAudit.zh-CN.md)、[W1](baseline/W1ToolchainAudit.zh-CN.md)、[W2](baseline/W2WebsiteAudit.zh-CN.md)、[W3](baseline/W3ContentFoundationAudit.zh-CN.md)、[W4](baseline/W4CourseAudit.zh-CN.md) 记录。原始 v5 指南失败和独立网站变体的通过分别保留。

## 1. 目标与实施原则

网站面向 Survivalcraft DawnlightCore 光影包开发者，提供从基础概念、JSON 数据驱动配置、GLSL 编写，到独立光影包制作、调试和发布的完整学习路径。

最终结果应同时满足三类使用场景：

1. 新手按照教程，从空目录制作一款具有独立视觉风格的完整光影包。
2. 已有经验的作者快速查找字段、公共输入、资源约束、命令用法和诊断代码。
3. 管线维护者升级宿主后，能够识别文档、示例和实际运行时之间的差异，并可靠更新网站。

采用以下原则：

- 主线围绕作者要完成的任务展开，阶段编号、迁移过程和内部验收记录作为来源资料保留。
- 教程、概念解释、接口参考、效果实践分别组织，并通过链接互相连接。
- JSON 描述资源、程序、执行关系和配置；GLSL 实现着色算法；宿主 C# 提供公共 ABI、引擎绘制与生命周期。
- 每份可运行示例只有一个维护入口，网页代码、下载包和验证输入来自同一份源码。
- 文档声明必须绑定宿主基线。支持状态、静态校验和运行时证据分别记录。
- 自动生成字段事实和目录数据，人工解释行为、原因、适用场景和排错方法。
- 先完成一条经过验证的学习路径，再扩展效果数量和交互功能。

## 2. 已调研的项目基础

### 2.1 当前文档站状态

方案编写时，当前项目仅有空的 `docs/` 目录。W0 新增 ADR、候选 lock、来源和能力元数据；W1 建立精确字节快照及固定工具资产；W2 已建立 VitePress 工程、六个可阅读页面和公开网站仓库。完整快照不提交公开仓库，普通网站构建只消费公开投影。W0 的历史验收保留当时的基础设施状态，当前状态以 lock 与 W2 验收为准。

### 2.2 可以复用的宿主资产

下表的路径均相对于参考宿主仓库根目录。

| 资产 | 已发现的入口 | 网站中的用途 |
| --- | --- | --- |
| 总体架构 | `docs/Architecture.md`、`Survivalcraft/Dawnlight/PipeLine/README.md` | 平台约束、模块职责、公共能力与内部逻辑边界 |
| v3/v4 作者指南 | `docs/ShaderPackAuthorGuide.md` | Scene 路由、MRT、source owner、离线工具与完整示例 |
| v5 作者指南 | `docs/ShaderPackAuthorGuideP11V5.md` | 材质、typed custom data、公共输入和数据 ABI |
| Manifest 拆分说明 | `docs/ShaderPackManifestComposition.md` | 多文件组织、组合规则、诊断来源与 canonical hash |
| 设置 UI | `docs/ShaderPackSettingsUiReference.md` | option、界面布局、条件、翻译与 UI 行为 |
| 通用命令 | `docs/DawnlightGenericCommandTypes.md` | 七类 Command 及资源访问、顺序约束 |
| 资源与语义 | `docs/DawnlightResourceContentAndFactoryServices.md`、`docs/DawnlightSemanticProviderCatalog.md` | 内容来源、Service、Provider、绑定和公共目录 |
| 时序与光源几何 | `docs/DawnlightTemporalViewABI.md`、`docs/DawnlightLightFrustumGeometryABI.md` | 高级效果合同、空间定义和生命周期 |
| Schema | `docs/schemas/`、`docs/schemas-v5/` | 结构参考、编辑器关联、版本化下载 |
| 生产侧分析器 | `tools/ShaderPackAnalyzer/` | Loader 校验、图导出、接口解释、诊断与文档一致性检查 |
| 作者字段合同 | `ShaderPackManifestAuthoringContract.cs`、`ShaderPackDataAuthoringContract.cs` | 可接受字段、版本门、类型和闭合 token 的来源 |
| 实例包 | SceneAbiLab、CustomDataLab、Dawnlight、ToonLab、MakeUp | 基础示例、功能示例和大型包案例分析 |

字段合同的完整源码位置：

- `Survivalcraft/Dawnlight/PipeLine/Shaders/Configuration/Domain/ShaderPackManifestAuthoringContract.cs`。
- `Survivalcraft/Dawnlight/PipeLine/Shaders/Configuration/Domain/Data/ShaderPackDataAuthoringContract.cs`。

### 2.3 实施前必须处理的历史差异

1. 部分资料以 v3 编写，当前合同和实例已经包含 v4/v5；例如拆分文档的早期字段说明不能直接代表 v5。
2. 部分评估文档保留了当时的“计划中”结论，后续阶段已实现相应能力；引用时必须核对当前代码和 Catalog。
3. 时序合同文档记录过 `runtimeReady=false` 的冻结时点，同时后续章节记录了 Provider 接入；网站必须呈现所选基线的当前状态。
4. Analyzer README 仍记录 P11 正式性能门和发布证据边界；示例能运行与生产发布验收完成需要分别说明。
5. Schema 列出的 token 不等于任意资源类型、Manifest 版本和宿主组合都支持；实际约束由生产 Loader/resolver 及运行时验证决定。
6. SceneAbiLab 定位为 Terrain ABI/MRT 教学样例，需要明确场景覆盖范围。
7. BuiltIn Minimal 的内部 descriptor 与外置包的加载规则存在区别，不能仅复制几个空数组就宣称获得等价的外置最小包。

上述差异进入 W0 核对清单，在内容迁移时逐项处理，不通过复制整份旧文档解决。

## 3. 范围、优先级和完成定义

### 3.1 首次可预览版本

- VitePress 基础站点、本地运行和 GitHub Pages 部署流程。
- 入门说明、管线概念、经过校验的外置起步包。
- 首次后处理、资源与绘制目标、场景接入的连续教程。
- 基础字段参考、验证命令和排错入口。
- 明确标注教程覆盖范围，未完成页面不进入正式导航和搜索。

### 3.2 v1 完整作者文档

- 连续教程覆盖独立光影包制作、选项与设置、材质与自定义数据、打包验证。
- 覆盖所选基线所有公开 JSON 配置表面及其适用条件。
- 提供资源、Program、Command、Scene ABI、公共输入、设置 UI 和诊断参考。
- 至少一款完整的教学光影包，以及可独立运行的功能示例。
- 实现基线锁定、上游导入、示例校验、下载包生成和持续部署。
- 关键示例具备真实游戏内验证记录，静态结果与运行时结果清晰分开。

### 3.3 后续增强

- 从 Analyzer 输出构建交互式资源依赖图和命令详情面板。
- 基于固定截图的前后效果对比、代码差异展示。
- 更多效果实践、独立风格案例、多语言和多维护版本。
- 可选离线文档压缩包。

### 3.4 本轮网站工程不承担的工作

- 重构 DawnlightCore 渲染管线或重新设计公共 ABI。
- 在浏览器中复现 Survivalcraft 场景、执行包代码或提供等价的 GPU 编译环境。
- 将未验证的实验能力标注为稳定能力。
- 在普通文档构建中执行游戏发布事务或覆盖安装目录。
- 将官方原版、重构前稳定版和现有宿主混合为同一个作者合同。

## 4. 技术方案与主要决策

| 决策 | 采用方案 | 理由与实施约束 |
| --- | --- | --- |
| 网站框架 | VitePress + TypeScript | Markdown 为主，少量 Vue 组件补充版本和示例展示 |
| 依赖管理 | npm + 提交的 lockfile | 减少额外工具，CI 使用 `npm ci` |
| Node | 实施时选择满足所锁定 VitePress 要求的受支持 LTS | 记录精确版本；本规划不猜测实施时的最新版本 |
| 部署 | GitHub Pages，通过 GitHub Actions 上传静态产物 | 无后端服务，适合公开文档 |
| 搜索 | VitePress 本地搜索，补充中文分词或搜索索引配置 | 必须用中文、英文标识符和诊断码验证召回 |
| 代码展示 | Markdown 代码块、代码组、源码区域导入 | 代码由示例源码生成或引用，避免手工复制 |
| 图表 | Mermaid 的兼容集成或构建期生成 SVG | 锁定集成版本；生成失败应可定位，图示必须有文字解释 |
| 视觉 | 默认主题基础上定制颜色、导航和少量组件 | 优先可读性、代码空间和移动端体验 |
| 内容语言 | 简体中文主站，保留英文标识符和术语映射 | 预留英文路由，不在 v1 建立大量空白翻译页 |
| 上游同步 | 精确 commit + 文件清单 + SHA-256 + 显式导入 | 普通构建不自动跟随远程分支 |
| Analyzer | 固定构建的 Windows x64 自包含工具包 | 静态检查放在 Windows runner，前端构建可使用 Linux runner |
| 仓库关系 | 独立网站仓库，显式引用宿主 | 当前项目作为网站工程；保持文档发布与游戏发布分离 |

优先使用框架现成能力。只有版本状态、代码来源、示例下载和支持矩阵需要补充专用组件。复杂交互编辑器延后。

## 5. 版本、支持状态与证据模型

### 5.1 版本选择

新教程优先面向 Manifest v5 / Scene ABI v2，前提是 W0 已核对该基线的完整作者路径。v3/v4 作为兼容和迁移专题，保留对应指南和示例。

若 v5 某项功能尚有发布或性能待验收项，保留该功能的实际可用说明并标注边界，不自动把整个版本判为不可用，也不将其所有能力整体标为稳定。

需要分别记录：

- 宿主源码 commit、宿主发布标识及平台范围。
- Manifest 版本、Scene ABI 版本、materials/customData ABI 版本。
- Analyzer 工具版本及二进制哈希。
- Analyzer protocol、Catalog contract、graph contract、Program interface contract。
- Schema bundle、completion 和 schema index 的版本及哈希。

这些版本服务于不同合同，不用一个“v5”代替全部版本。

### 5.2 支持与证据分离

网站层的能力状态建议为 `implemented`、`experimental`、`planned`、`unsupported`；每项状态附适用版本、平台和说明。它们是网站元数据，不是新增运行时 API token。

证据保留宿主现有分级：

| 证据 | 可以说明什么 | 不能替代什么 |
| --- | --- | --- |
| authored | 作者声明、Schema 和源码事实 | Loader 解析、驱动编译 |
| resolved | 生产 Loader/resolver 的路由、闭包、目标和绑定决策 | GPU 执行、画面结果 |
| staticReflection | include、define 和静态接口检查 | 真实驱动 compile/link |
| driverObserved | 身份匹配的运行时 Program/FBO 等观测 | 未覆盖场景的画面、性能与生命周期 |

额外维护画面、生命周期和性能记录。驱动报告中的 `notProvided`、`partial`、`stale`、`invalid` 不转换成成功。

### 5.3 基线文件

新增 `upstream.lock.json`，至少记录：

- `repositoryUrl`：实施时从真实宿主 remote 或已发布来源解析，不填写虚构地址。
- `commit`：精确 40 位 commit。
- `baselineId`：网站内部不可变的基线标识。
- 宿主与 Analyzer 的实际发布来源、SHA-256、运行平台。
- 所选合同版本、Schema 和 Catalog 指纹。
- 导入资产清单的路径和哈希。

可复现的导入时间放在导入收据中，避免普通构建因时间戳变化产生差异。基线一旦对外发布便保持不可变；升级创建新记录。

### 5.4 页面元数据

规划增加网站专用 frontmatter。以下是格式示意，所有待验收状态均保持未验证：

~~~yaml
title: 添加第一个后处理
description: 用一个独立 Program 和 Command 完成场景调色
dawnlight:
  publication: draft
  baseline: candidate-f8aaa5c4
  manifestVersions: [5]
  sceneAbiVersions: [2]
  example: course/01-first-post
  sourceRefs:
    - path: docs/ShaderPackAuthorGuideP11V5.md
      commit: f8aaa5c4218f54536ccf994a2d512aed2e3678b7
  verification:
    loader: notRun
    staticReflection: notRun
    driverStatus: notProvided
    visual: notRun
~~~

`candidate-f8aaa5c4` 在本例中仅表示调研候选基线。最终名称和状态由 W0/W1 生成的锁定记录决定。

## 6. 网站信息架构与页面清单

路由使用稳定英文 slug，标题使用中文。初版不启用会依赖特殊服务器重写规则的 URL 方案，直接生成可由 Pages 访问的静态页面。

| 栏目 | 规划路径 | 首要页面 |
| --- | --- | --- |
| 首页 | `/` | 项目定位、开始学习、查阅参考、获取示例 |
| 开始使用 | `/start/` | 适用范围、环境准备、工具安装、目录结构、加载与重载 |
| 从零开发 | `/tutorial/` | 连续课程、章节源码、章节成果与练习 |
| 管线原理 | `/concepts/` | 数据流、术语、执行时机、资源访问、所有权与生命周期 |
| 接口参考 | `/reference/` | Manifest、资源、程序、命令、绑定、Scene、材质、数据、UI |
| 效果实践 | `/recipes/` | 调色、雾、AO、水、Bloom、曝光、阴影、时序 |
| 工具与排错 | `/tools/`、`/troubleshooting/` | Analyzer、报告、诊断码、症状到原因 |
| 示例 | `/examples/` | 起步包、功能示例、完整作品、进阶案例 |
| 兼容性 | `/compatibility/` | 当前基线、支持矩阵、v3/v4/v5 差异、升级步骤 |
| 贡献与更新 | `/contributing/`、`/changelog/` | 本地编写、示例规范、文档版本和接口变更 |

### 6.1 管线原理页面

至少覆盖以下主题：

1. JSON、GLSL 和宿主 C# 各负责什么。
2. Phase、Pass、Stage、Command、Program、Resource 的关系。
3. Service、Provider、Semantic、system binding 与 custom data 的区别。
4. Manifest 声明到组合、解析、候选 generation、发布与执行的全过程。
5. 资源写入、采样、依赖、hazard 与 memory barrier。
6. named target topology、fragment output location 与 active draw buffers。
7. 线性色彩与输出色彩、深度、矩阵和坐标空间。
8. source owner、include 边界、BuiltIn fallback 与包自有源码。
9. 重载、回滚、resize、device reset、history 失效与退役。
10. 最小能力闭包与可选功能的资源成本。

阶段和执行时机以当前 Catalog/实现为准，不把早期文档中的固定 Phase 数量写成永久合同。

### 6.2 接口参考覆盖矩阵

| 参考组 | 必须覆盖的配置表面与约束 |
| --- | --- |
| Manifest 根与组合 | 元数据、版本、ID、shaderRoot、settings、fragments、根/fragment 字段归属、顺序、路径、hash 与诊断来源 |
| options 与条件 | 类型、默认值、范围、allowed、impact、enabled/enabledWhen、活动分支与依赖闭包 |
| resources | kind、size、format、content、sampling、buffer、lifetime、history、view、fallback、支持组合 |
| programs | graphics/compute、编译模式、source owner、include、defines、variants、接口与生效条件 |
| passes 与 Stage | host、template、phase、ordering、requires、services、输入输出和执行顺序 |
| commands | fullscreen、compute、copy、clear、present、engineDraw、historyCommit 的字段与差异 |
| targets 与 state | colors/depth、location、drawBuffers、load/store/clear、viewport、blend/depth/rasterizer |
| bindings 与 semantics | sampler/image/UBO/SSBO、slot、access、频率、symbol 冲突、required、公共语义及版本 |
| Scene ABI | 四类 Terrain 路由、override/builtin/disabled、Provider、顶点 ABI、sceneBindings、frameTarget |
| materials | properties、tags、definitions、contentGroups、mappings、priority、fallback、内容身份与 SSBO 布局 |
| customData | 类型、输入、表达式、引用、option、频率、单位、空间、default/onError、预算和上传约束 |
| 设置 UI | Empty/AutoGenerated/Authored、控件、页面、条件、翻译、option 单一来源、UI hash |
| 公共能力目录 | Service、Provider、Semantic、数据输入、格式、Capabilities 的 ID/version、约束和依赖 |
| 工具合同 | CLI、协议选择、输入输出、退出码、诊断、快照与报告身份 |

对每个可接受字段记录“已解释 / 自动生成结构事实 / 示例覆盖 / 仅兼容 / 不支持组合”。v1 完成时，每个公开字段都有去向；不通过字段数量相等推断行为说明完整。

## 7. 连续教程与示例设计

### 7.1 教程章节

教学包采用独立命名空间，例如 `course:`；最终名称在实现时统一确定。章节快照均可独立下载、验证和加载。

| 章节 | 目标 | 主要知识 | 规划示例 ID |
| --- | --- | --- | --- |
| 00 | 从空目录加载外置起步包 | 目录、版本、必需宿主合同、fallback、日志 | `course/00-starter` |
| 01 | 第一个场景调色效果 | graphics Program、fullscreen/present、基本采样 | `course/01-first-post` |
| 02 | 添加独立渲染资源 | 格式、尺寸、目标、load/store、读写关系 | `course/02-resources` |
| 03 | 接入场景与 Terrain | frameTarget、Scene category、深度、fallback 范围 | `course/03-scene` |
| 04 | 添加 MRT 数据 | 输出位置、drawBuffers、法线/材质的示例编码 | `course/04-mrt` |
| 05 | 增加可关闭的效果与设置 | option impact、条件、defines、设置 UI、活动闭包 | `course/05-options` |
| 06 | 使用时间、天气与自定义参数 | 公共输入、typed expression、frequency、customBindings | `course/06-custom-data` |
| 07 | 根据材质改变表面表现 | 内容 ID、材质 mapping、tag/property、SSBO helper | `course/07-materials` |
| 08 | 组织一条实际后处理链 | 独立输入输出、多阶段效果、资源成本、条件分支 | `course/08-post-chain` |
| 09 | 完成独立风格与包结构 | 视觉一致性、fragment 拆分、预设、Mod 内容与回退 | `course/09-complete-pack` |
| 10 | 验证、打包和分发 | Analyzer、驱动报告、运行时检查、版本和说明文件 | `course/10-distribution` |

起步包的具体命令和 fallback 组合需先通过生产 Loader 与真实游戏验证；上表不构成任何尚未实现的“任意后处理包”能力承诺。若所选版本有必要的 host 声明，教程必须完整展示。

MRT 章节的法线、材质编码属于示例包约定，必须解释编码与解码，不能暗示宿主提供未发布的固定 G-buffer 格式。

### 7.2 高级分支

完整主线之后提供 history、时序 view、jitter、TAA、曝光、阴影、CSM、体积光、天空和云的独立专题。专题说明前置章节、增加的资源和成本、支持边界，以及失败或禁用时的行为。

完整包的定义是场景接入、效果组合、设置、资源与生命周期、回退和分发流程完整；不要求读者在第一款包中启用所有高级效果。

### 7.3 每章固定结构

1. 本章目标、预期画面和适用基线。
2. 前置知识与上一章下载入口。
3. 修改文件清单和完整源码入口。
4. 关键改动及逐段说明。
5. 管线、资源或绑定关系图。
6. 验证命令、关键输出字段和实际画面。
7. 常见错误及定位顺序。
8. 一个能改变效果的小练习。
9. 本章完整下载、源码来源和下一章。

避免仅给出带省略号的 Manifest 并要求新手自行补齐。用于概念说明的片段必须标记“片段”，同时链接完整包。

### 7.4 教学包与上游实例的关系

- `examples/course/`：网站独立维护的新教学包，是课程示例的唯一源码。
- 上游 SceneAbiLab/CustomDataLab：按固定 commit 导入只读快照，网页和下载由该快照派生，不维护另一个可编辑的同名样例。
- Dawnlight/ToonLab/MakeUp：按功能切片分析，记录原始来源、版本和资源归属。
- 网页展示副本、临时验证目录和 ZIP 解压目录都是生成物，不能作为新的源码入口。

## 8. 参考页面与排错页面规范

### 8.1 每个字段或对象的说明结构

- 名称、JSON 路径、类型、必需性、默认行为。
- 适用 Manifest/ABI/宿主版本和允许出现的位置。
- 单位、坐标空间、频率、取值范围、预算或设备约束。
- 与其他字段、Service、Program、资源和命令的关系。
- 一份最小合法配置及完整可运行示例链接。
- 常见非法组合、实际诊断码和最短修复步骤。
- Loader 校验与运行时校验分别能说明什么。
- source owner、hash、重载或生命周期上的影响。

代码字段表只提供字段名与结构时，人工补全默认行为和语义。无法从 Schema 推导的内容不自动编造。

### 8.2 症状驱动排错

至少建立以下入口：

- 光影包未显示、加载失败、重载后仍为旧效果。
- 全黑、全白、天空缺失、透明物体消失。
- MRT 数据错误、输出位置不匹配、sampler/SSBO slot 冲突。
- 同一纹理读写、没有 writer、顺序不明确、barrier 错误。
- resize 后资源异常、切包后残留、history 拖影或未失效。
- Mod 材质未匹配、内容快照缺失、离线 mapping deferred。
- 静态校验通过但驱动 compile/link 或 FBO 失败。

排错顺序统一为：加载与版本 → 路由/活动闭包 → 资源与绑定 → 静态接口 → 对应运行时报告 → 画面和生命周期。每页引用真实诊断 family，不从错误消息文本猜测稳定合同。

## 9. 页面体验、搜索与可访问性

### 9.1 导航与视觉

- 首页提供“开始制作”“查配置”“找示例”“排查问题”四个直接入口。
- 顶部导航控制在主要栏目，侧边栏按任务顺序组织。
- 正文显示章节目录、适用基线、验证摘要、源码链接和前后章节。
- 代码区允许横向滚动；窄屏不把整页宽度撑开。
- 同时提供浅色与深色模式，保证代码、表格和状态颜色可读。
- 状态以文字和图标共同表达，不能只依靠颜色。
- 插图有说明文字，键盘可以访问导航、搜索、代码切换和下载按钮。

### 9.2 搜索验收词

固定验证：`绘制缓冲`、`drawBuffers`、`材质`、`customBindings`、`historyCommit`、`frameTarget`、`DLABI1002`。

每个查询建立预期目标页列表。中文召回不足时配置分词或查询展开；标识符和诊断码需要精确匹配能力。历史文档、草稿和旧版本页面默认不混入当前基线搜索。

### 9.3 专用组件

v1 仅实现必要组件：

- `BaselineBadge`：适用版本和基线详情。
- `EvidenceSummary`：验证层级、时间与证据链接。
- `ExampleDownload`：下载、源码、工具版本和 SHA-256。
- `CapabilityTable`：当前基线的支持状态、限制和来源。

代码组和目录优先使用 VitePress 现有能力。资源图和图片对比组件安排在后续增强阶段。

## 10. 建议工程目录

以下为目标结构；W0 已创建规划、ADR、基线验收与初始元数据，网站工程、示例、导入和生成脚本仍待实施。

~~~text
dawnlight-core/
  docs/
    WebsiteImplementationPlan.zh-CN.md
    adr/
    baseline/
      W0BaselineAudit.zh-CN.md
  site/
    .vitepress/
      config.mts
      theme/
        index.ts
        styles/
        components/
    index.md
    start/
    tutorial/
    concepts/
    reference/
      generated/
    recipes/
    tools/
    troubleshooting/
    examples/
    compatibility/
    contributing/
    changelog/
    public/
      images/
      downloads/
      schemas/
  examples/
    course/
    features/
    registry.json
  vendor/
    dawnlight/
      source-inventory.json
      authoring/
      examples/
      source-excerpts/
  metadata/
    pages.json
    capabilities.json
    source-map.json
    w0-verification.json
    manual-semantics/
  scripts/
    import-upstream.mjs
    verify-upstream.mjs
    generate-reference.mjs
    generate-snippets.mjs
    validate-content.mjs
    validate-examples.mjs
    package-examples.mjs
    check-links.mjs
    verify-public-assets.mjs
  .github/workflows/
    docs-check.yml
    docs-deploy.yml
  .cache/
  artifacts/
  upstream.lock.json
  package.json
  package-lock.json
  README.md
  .gitignore
~~~

目录职责：

- `docs/` 保存实施方案与维护决策，默认不作为公开站点正文。
- `site/` 保存作者可见文档；`reference/generated/`、`public/downloads/`、`public/schemas/` 由脚本生成。
- `vendor/` 保存经过清单和哈希锁定的必要上游文本快照，不复制整个游戏仓库。
- `examples/` 保存网站自有示例；上游样例的可编辑来源仍属于宿主。
- `metadata/` 保存页面登记、来源映射、支持状态和人工补充语义。
- `.cache/` 存放工具下载和 staging；`artifacts/` 存放检查报告，两者不进入 Pages。
- 工具二进制不进入普通源码提交，通过实际发布资产下载并校验哈希。

生成目录和缓存通过 `.gitignore` 排除；从干净 checkout 和锁定输入可以重新生成。若某项工具尚无远程发布资产，W1 先建立真实可访问的版本化获取方式。

## 11. 上游导入与文档生成流程

### 11.1 唯一事实来源

~~~mermaid
flowchart TD
  A[固定 commit 的宿主与作者合同] --> B[固定版本 Analyzer]
  A --> C[白名单文档与实例快照]
  B --> D[Schema / Catalog / 诊断 / 分析报告]
  C --> E[导入清单与哈希校验]
  D --> E
  E --> F[生成参考与代码展示]
  G[网站维护的教学包] --> H[Loader 与接口验证]
  H --> F
  G --> I[生成下载 ZIP]
  F --> J[VitePress 静态站点]
  I --> J
  K[绑定身份的运行时记录] --> J
~~~

生成器只消费锁定输入。普通 `docs:build` 不访问开发者的 `E:/sc/` 路径，不下载上游最新分支，不调用游戏发布命令。

### 11.2 显式导入步骤

1. 在本地通过 `--source-root` 指定宿主路径，或取得锁定 commit 的可访问源码快照。
2. 验证 commit 和工作区状态。若导入未提交改动，必须单独记录 patch 和内容指纹；正式基线优先使用干净 commit。
3. 按白名单读取作者文档、Schema、合同摘要和指定示例。
4. 使用相同构建的 Analyzer 导出 Catalog，验证 Schema bundle，保留原始输出。
5. 比对 Schema/completion 中记录的 Catalog 身份与实际构建；有差异时调查来源，不直接替换哈希掩盖差异。
6. 写入 staging，计算文件路径、长度和 SHA-256，生成导入收据。
7. 展示字段、ID、类型、版本、示例内容和支持状态差异。
8. 校验通过后替换受管理的快照目录；无关文件不参与替换。
9. 更新 `upstream.lock.json`、来源映射和相应页面，提交同一个变更。

本地宿主路径放在命令参数或未提交的本地配置中。远程地址和发布资产仍需在实施时解析，本方案不假设它们已经存在。

### 11.3 自动生成与人工内容

| 内容 | 维护方式 |
| --- | --- |
| 版本、字段名、结构、类型、闭合 token | 从锁定 Schema/authoring contract 导出 |
| Catalog ID、版本、依赖、公开元数据 | 从对应构建的 Catalog/完成数据导出 |
| 诊断 code、family、severity、基础说明 | 使用现有诊断生成结果 |
| 字段用途、场景、默认行为和限制 | 人工补充，并关联实现或合同来源 |
| 教程代码、下载包、文件清单 | 从已登记示例生成 |
| 接口和资源图 | 保存 Analyzer 原始结果，再转换展示 |
| 支持状态、验证结论 | 由实际证据和维护者说明组成，禁止仅根据字段存在推导 |

生成字段参考采用“结构事实 + 人工语义”合并方式。人工数据以稳定 JSON Pointer/对象路径关联；上游字段删除或改名后，失效的人工记录应触发检查失败。

### 11.4 原始指南的保留方式

`ShaderPackAuthorGuide.md`、`ShaderPackAuthorGuideP11V5.md` 和生成诊断表按原始字节导入 `vendor/`。现有 `file=...` 标记和生成区边界继续交给 Analyzer 检查。

网站可以从它们派生新页面，但不将拆分后的 VitePress 页面直接传给只接受既有完整指南格式的 `docs verify`。新课程示例走独立登记与验证流程。

## 12. 示例注册、源码展示和下载

### 12.1 示例登记内容

`examples/registry.json` 为每个示例记录：

- 唯一 ID、标题、来源类型和源码根目录。
- 宿主基线、Manifest/ABI 版本和入口文件。
- 关联章节、使用的公共能力、有效 Program ID。
- 适用的静态验证命令和选项/能力组合。
- 是否需要 world content snapshot、driver report 或特殊硬件能力。
- 默认、关闭效果和关键分支的预期行为。
- 文件清单、源码指纹、下载包位置和资源归属。
- 已完成的运行时检查和证据记录。

所有 path 均为仓库相对路径，下载页面使用站点 base 生成 URL。生成器拒绝缺失入口、重复 ID 和来源不明的示例。

### 12.2 代码展示

- 关键片段使用源码区域或可验证行段引用，同时显示文件名。
- 完整文件查看、源码下载和“本章改动”由同一输入生成。
- snippet 来源不存在或区域重复时，构建失败。
- 为代码说明增加的标记不得改变 GLSL/JSON 的有效语义；严格 JSON 不插入非法注释。
- diff 由相邻章节的源码计算，不手工维护独立补丁。
- 同一章节快照可独立运行；章节间的复用关系由生成脚本或明确源码规则维护，避免隐式依赖读者机器上的上一章。

### 12.3 ZIP 生成

1. 从登记目录构建显式文件清单。
2. 排除缓存、临时报告、运行时日志和开发者本地路径。
3. 按稳定路径排序并规范化 ZIP 元数据，使相同输入生成相同产物。
4. 将下载包解压到全新临时目录，运行适用的 Analyzer 检查。
5. 比较解压文件与源码清单，防止网页与下载内容不一致。
6. 输出 SHA-256 和清单，绑定宿主基线及 Analyzer 指纹。

下载 URL 包含基线和源码指纹；`latest` 只能作为显式指向某份固定产物的便利入口，不能覆盖已发布的不可变下载。

### 12.4 编辑器 Schema 关联

优先提供 `.vscode/settings.json` 中的 `json.schemas` 关联示例或工具安装说明。是否允许在 Manifest 根增加 `$schema` 必须以 Loader 合同为准，不能因编辑器惯例插入宿主拒绝的字段。

网页托管的 Schema 保持上游字节与 `$id`，下载地址和标识符分别记录。对 `$ref` 解析和离线编辑器使用做实际检查；域名不一致时不擅自改写上游 Schema。

## 13. 实施脚本与命令合同

### 13.1 拟提供的 npm 入口

下表是待实现的网站脚本，不是当前已经存在的命令。

| 入口 | 职责 | 成功产物 |
| --- | --- | --- |
| `npm run docs:dev` | 准备必要生成内容并启动 VitePress | 可访问的本地站点 |
| `npm run upstream:import -- --source-root ...` | 显式导入固定宿主 | 快照、清单、差异和收据 |
| `npm run upstream:verify` | 验证锁定文件和导入资产 | 哈希一致报告 |
| `npm run docs:generate` | 生成参考、代码展示和下载页面数据 | 确定性生成文件 |
| `npm run examples:check` | 调用固定 Analyzer 验证登记示例 | 每个示例的结构化结果 |
| `npm run examples:package` | 打包、解压重验、生成哈希 | ZIP、文件清单和哈希 |
| `npm run docs:check` | 元数据、来源、覆盖、链接和资源检查 | 汇总检查报告 |
| `npm run docs:build` | 生成并构建静态网站 | `site/.vitepress/dist/` |
| `npm run docs:preview` | 本地预览生成产物 | 与部署 base 一致的预览 |

各脚本用结构化参数启动子进程，记录命令、退出码和 stderr；JSON stdout 与日志分开保存。退出码 1 的业务失败与退出码 2 的命令误用分别呈现。

### 13.2 可复用的现有 Analyzer 命令

以下命令在宿主仓库根目录运行，`$packRoot` 指向要验证的完整包。实施时可替换为固定自包含 Analyzer，保持相同 CLI 合同：

~~~powershell
$packRoot = '完整示例包的实际路径'

dotnet run --project tools/ShaderPackAnalyzer -- catalog list --contract 2 --format json
dotnet run --project tools/ShaderPackAnalyzer -- pack validate $packRoot --format json
dotnet run --project tools/ShaderPackAnalyzer -- scene explain $packRoot --include-inactive --format json
dotnet run --project tools/ShaderPackAnalyzer -- graph dump $packRoot --contract 2 --include-inactive
~~~

Program interface 按示例登记的实际 ID 分别检查。v5 相关调用显式选择对应合同：

~~~powershell
$programId = '示例中实际声明的命名空间:程序ID'

dotnet run --project tools/ShaderPackAnalyzer -- program interface $packRoot --program $programId --contract 2
dotnet run --project tools/ShaderPackAnalyzer -- materials layout $packRoot
dotnet run --project tools/ShaderPackAnalyzer -- materials explain $packRoot
dotnet run --project tools/ShaderPackAnalyzer -- data explain $packRoot
dotnet run --project tools/ShaderPackAnalyzer -- data graph $packRoot
dotnet run --project tools/ShaderPackAnalyzer -- data interface $packRoot
~~~

只有使用对应能力的示例才运行相应材料/数据命令。没有世界快照时允许出现合同规定的 deferred/null；没有驱动报告时必须保留 `notProvided`，不把这些状态直接计为运行时失败或成功。

上游资产校验：

~~~powershell
dotnet run --project tools/ShaderPackAnalyzer -- schema verify --manifest-version 4 --output ./docs/schemas
dotnet run --project tools/ShaderPackAnalyzer -- schema verify --manifest-version 5 --output ./docs/schemas-v5
dotnet run --project tools/ShaderPackAnalyzer -- docs verify --guide ./docs/ShaderPackAuthorGuide.md --diagnostics ./docs/ShaderPackDiagnosticReference.md --temp ./artifacts/website-guide-v4
dotnet run --project tools/ShaderPackAnalyzer -- docs verify-v5 --guide ./docs/ShaderPackAuthorGuideP11V5.md --diagnostics ./docs/ShaderPackDiagnosticReference.md --temp ./artifacts/website-guide-v5
~~~

文档校验使用独立、全新的空临时目录。网站 CI 对导入快照运行时，参数改为对应 `vendor/` 路径；不自动调用 `schema approve` 或游戏包 `release publish`。

### 13.3 首次构建工具与宿主

固定 Analyzer 可依据已存在的 profile 发布：

~~~powershell
dotnet publish ./tools/ShaderPackAnalyzer/ShaderPackAnalyzer.csproj -p:PublishProfile=win-x64 --output ./artifacts/shaderpack-analyzer/win-x64
~~~

需要更新宿主或进行运行时验证时，使用已给定构建入口：

~~~powershell
dotnet build ./Survivalcraft.Windows/Survivalcraft.Windows.csproj -c Debug
~~~

以上为构建入口。W0 已执行 Debug Analyzer 构建以核对实际合同，结果见阶段验收记录；自包含工具发布和普通 Windows 游戏项目构建本阶段未执行。普通网站文字修改复用锁定工具，无需每次重建游戏。

## 14. CI、部署和产物边界

### 14.1 检查工作流

`docs-check.yml` 在 pull request、主分支更新和手动触发时执行：

| Job | 环境 | 主要检查 |
| --- | --- | --- |
| metadata | Linux + 锁定 Node | 安装依赖、基线文件、来源清单、页面登记、引用与必填信息 |
| analyzer | Windows + 锁定 Analyzer | 原始指南/Schema、示例 Loader、graph/interface、必要的数据接口 |
| package | 可复现的固定工具环境 | 示例 ZIP、解压校验、产物与源码哈希一致性 |
| build | Linux + 锁定 Node | 生成参考、构建网站、内部链接、静态资源和 base 路径 |
| summary | 汇总前述结果 | 保存报告、源码/工具/构建指纹和待验证项 |

前端生成内容与 Analyzer 报告通过 Actions artifact 传递，并验证 baseline 与输入哈希一致。检查同一份产物后再部署，不在部署阶段重新拉取最新上游。

初版对登记示例执行完整 GL-free 检查。后续只有在能够证明输入指纹一致时才增加缓存或变更范围优化。

### 14.2 部署工作流

`docs-deploy.yml` 仅对约定发布分支或显式手动发布部署通过检查的产物：

1. 完成源码 checkout、`npm ci`、基线验证和必要生成。
2. 从真实 GitHub 仓库地址确定站点 URL 与项目 `base`。
3. 运行完整检查和正式构建。
4. 保存本次构建的 commit、baseline、工具和产物清单。
5. 使用 GitHub Pages 官方 artifact/deploy Actions 发布同一份静态产物。
6. 对公开 URL 做首页、一个深层页面、搜索入口和一个下载文件的冒烟检查。

检查 Job 使用读取权限；部署 Job 才配置 Pages 写入与 OIDC 所需权限及 Pages environment。普通 PR 不执行部署。

### 14.3 GitHub Pages 路径

- 用户/组织站与项目站分别支持 `/` 和 `/<repository>/`。
- 通过配置读取部署 base，内部资源、下载、Schema 和组件链接统一使用 base helper。
- 验证深层页面直接打开、刷新和复制链接。
- 保留正常 404 页面，不依赖 SPA fallback 掩盖错误链接。
- v1 使用默认 GitHub Pages 域名；未来配置自定义域名时单独更新 canonical、sitemap 和 Schema 获取说明。

### 14.4 发布产物

允许进入 Pages：公开页面、样式、脚本、搜索索引、经登记的截图、示例 ZIP、Schema 和公开元数据。

不进入 Pages：整个宿主源码树、Analyzer 二进制缓存、个人目录、日志转储、完整 RDC 和未筛选的运行时报告。需要提供大型证据时，放入版本化 Release 资产并在页面记录身份。

历史基线的下载路径保持不可变。站点回滚使用先前通过检查的 commit/产物，不修改游戏安装目录。

## 15. 验证策略与运行时检查

### 15.1 文档工程验证

- 检查正式页面均有标题、描述、来源、适用基线和登记状态。
- 检查站内页面、锚点、示例、源码区域、图表和静态资源引用。
- 检查自动生成的字段覆盖与人工语义记录，发现失效条目即报错。
- 用同一输入连续生成两次，比较清单和下载哈希，验证确定性。
- 验证项目 base 下的下载、图片、搜索和深层路由。
- 在桌面与窄屏预览关键页面，人工检查代码、表格、目录和键盘操作。

对基线漂移、失效 snippet、ZIP 漏文件、错误 base 等生成流程的真实风险建立必要校验。无需为简单文案或颜色调整编写镜像实现的测试。

### 15.2 示例静态验证

按示例类型执行 Schema、Loader、Scene explain、graph、Program interface 及必要的数据命令，并保存结构化结果。

至少验证默认配置、关闭新增效果、关键 option/capability 分支。默认可选效果关闭后，检查其活动 Pass、Program、Service 和资源闭包是否符合实际合同，不仅观察画面。

### 15.3 示例运行时验证

对主线章节和核心功能示例执行以下适用项：

1. 在指定宿主与工具基线加载，记录实际生效包和 generation。
2. 检查日间、夜间、水下、透明物体和使用到的天气场景。
3. 修改 option，确认 uniform/program/pipeline/resource 类变化按合同生效。
4. 验证重载、切包、resize；涉及 history 时检查失效、跳过和恢复。
5. 通过受控非法候选确认已发布 generation 不被失败更新破坏。
6. 对设备恢复相关声明使用项目已支持的实际测试方式验证。
7. 导出适用的 driver report/content snapshot/data report，并检查身份匹配。
8. 记录画面、发现的问题和未覆盖边界。

不使用未公开的猜测命令指导新手。当前已知导出入口包括：

- `/switchshader export-driver-report`。
- `/switchshader content-export`。
- `/switchshader export-data-driver-report`。

使用前核对所选版本的适用条件；v5 数据报告需要当前 published generation 与最终世界内容。旧报告不能直接复用于变更后的包。

### 15.4 证据记录

每条运行时记录包含：

- 示例 ID、源码清单哈希、宿主 commit、Manifest/Catalog/ABI 身份。
- 工具哈希、平台、GPU/驱动、选项、分辨率、场景条件。
- 验证时间、步骤、结果、截图和对应报告的哈希。
- 已覆盖范围、跳过原因、失败项和复现方法。

示例源码或相关基线变化后，旧结果标为需要重验。静态 CI 不能自行把它升级为已通过。

正式性能结论需要单独可复现的测量；逻辑资源估算和主观帧率感受不作为实测显存/FPS。v1 可以明确保留待验收项。

## 16. 分阶段实施步骤

本节 W0～W10 是网站实施阶段，与宿主的 P8/P9/P10/P11 阶段编号无关。各阶段按产物和验收完成，不按固定天数推断完成度。

### W0：冻结范围与候选基线

执行状态：2026-10-23 已完成。范围、版本和 6 项待处理事项见 [W0 验收记录](baseline/W0BaselineAudit.zh-CN.md)，不将候选冻结等同于 W1 资产和运行时验收。

前置：能够读取参考宿主及其 Git 历史。

步骤：

1. 阅读当前架构、两份作者指南、Schema index 和 Analyzer CLI 合同。
2. 记录调研 commit、平台范围、合同版本和实际工具获取方式。
3. 对第 2.3 节历史差异建立来源与结论清单。
4. 核对当前 Catalog、Schema、作者合同和计划主线的能力是否一致。
5. 确定首次预览、v1 和后续增强的页面范围。
6. 确定 GitHub 仓库、默认分支和 Pages 项目 base；尚未存在的基础设施记录为待配置项。

产物：

- `docs/adr/0001-site-architecture.md`。
- `docs/adr/0002-authoring-baseline.md`。
- `metadata/source-map.json` 初稿。
- `metadata/capabilities.json` 初稿。
- 候选 `upstream.lock.json`。
- `metadata/w0-verification.json` 与 `docs/baseline/W0BaselineAudit.zh-CN.md`。

验收：能明确回答“教哪个宿主版本、哪些能力可用、哪些仍待验收、工具从哪里取得”；未知项逐项有处理步骤。

### W1：建立锁定输入与工具链

执行状态：2026-10-23 已完成。见 [W1 验收记录](baseline/W1ToolchainAudit.zh-CN.md) 与 [维护说明](maintenance/LockedInputs.zh-CN.md)。精确字节快照、固定工具 Release、空目录远程恢复和 6 项回归测试已验收；19 项工具检查中 18 项成功，1 项确认原始指南的已知失败，网站独立变体通过。W2 已完成公开网站 CI 与部署；完整私有工具链 CI 仍需专用读取凭据，尚未执行。

前置：W0。

步骤：

1. 为宿主 commit 构建或取得固定 Analyzer，并记录哈希。
2. 建立白名单导入脚本、导入收据和只读核对脚本。
3. 导入必要指南、Schema、Catalog、诊断和上游示例。
4. 使用既有 `schema verify`、`docs verify`、`docs verify-v5` 核对原始资产。
5. 将工具建立为 CI 可获取的版本化资产，验证外部工作目录运行。
6. 确认普通构建无需访问开发者本机的绝对路径。

产物：`vendor/`、完整 lock、工具资产清单、`scripts/import-upstream.mjs`、`scripts/verify-upstream.mjs`。

验收：在全新目录可恢复锁定输入；修改任一受管文件会被哈希检查发现；所有未提供的运行时证据保持原状态。

### W2：建立网站骨架与首轮部署

执行状态：2026-10-23 已完成。公开仓库与 `main`、Pages 项目路径、新 checkout 构建、Linux CI 的 12 项浏览器检查、线上双视口 12 项浏览器检查及 HTTP/资产/404 验收通过。实现与部署证据见 [W2 验收记录](baseline/W2WebsiteAudit.zh-CN.md)。

前置：W0；页面可使用 W1 尚在导入的占位数据，但不能伪装为完成页面。

步骤：

1. 初始化前端 package、锁定 Node/VitePress 和依赖版本。
2. 建立 `site/`、导航、侧边栏、主题和基础页面布局。
3. 配置中文、代码高亮、搜索、站点 base 和 404。
4. 建立 GitHub Actions 的检查和部署骨架。
5. 用少量真实概念页验证桌面、移动端、深层路由和项目路径。
6. 草稿保留在工程中，正式导航仅列出可阅读页面。

产物：可本地运行和静态构建的站点、Pages 工作流、README。

验收：新 checkout 可安装构建；预览路径与部署路径一致；至少一份可核实的深层页面能直接访问。

### W3：建立示例与内容生成基础

状态：已完成。实现与边界见 [W3 验收](baseline/W3ContentFoundationAudit.zh-CN.md) 和 [ADR 0005](adr/0005-example-generation.md)。

前置：W1、W2。

步骤：

1. 实现示例 registry、页面登记和 frontmatter 规则。
2. 为课程创建第一个合法外置起步包。
3. 实现 snippet、下载包和源码清单生成。
4. 实现 Analyzer 调用封装、结构化报告和确定性检查。
5. 接入原始指南验证和新课程验证两条流程。
6. 用失效源码引用、缺失文件和错误基线验证检查能定位问题。

产物：`examples/registry.json`、起步包、生成/校验脚本、首个可下载 ZIP。

验收：网页代码、下载 ZIP 和 Analyzer 输入指纹一致；生成不覆盖唯一源码；失败报告能指向示例与文件。

### W4：完成从入门到场景接入的主线

前置：W3。

实施状态：课程与工程主线已交付；实机范围限于一台 Windows / NVIDIA 设备和一个创意世界。五个快照完成加载、重载、resize、切回 BuiltIn 和驱动匹配；代理从新目录重走首个效果。第 6 步的独立真人试读尚未完成，因此不将本阶段记为全部验收关闭。见 [W4 记录](baseline/W4CourseAudit.zh-CN.md)。

步骤：

1. 编写环境准备、工具安装、GLSL 基础入口和加载说明。
2. 完成第 00～04 章及对应独立章节快照。
3. 补齐数据流、资源、target topology、drawBuffers 和 source owner 概念。
4. 在实际游戏中逐章验证，并增加画面和排错说明。
5. 修正起步包与完整场景覆盖之间的限制说明。
6. 让不了解项目内部结构的读者按说明完成首个效果，记录卡点。

产物：第一条可走通的学习路径、至少五个章节快照、核心概念页。

验收：读者可从空目录加载包、修改效果并解释基本资源流；关键章节具有实际运行记录。

### W5：完成公开 JSON 与 ABI 参考

前置：W1、W3；可以与 W4 在共享基础完成后交错推进。

步骤：

1. 按第 6.2 节建立字段/对象覆盖清单。
2. 生成结构事实、Catalog 和诊断页面。
3. 补充默认行为、版本门、支持组合、单位和坐标空间。
4. 为各 Command、绑定类别、Scene 路由和资源类别关联完整例子。
5. 核对 settings UI、materials 和 customData 的嵌套字段。
6. 将历史 v3/v4 行为与主线 v5 分开说明。

产物：全部公开配置表面的参考入口、公共能力目录和兼容性表。

验收：每个公开字段都有文档归属；生成事实与锁定输入一致；所有可运行配置能链接到登记示例。

### W6：完成独立光影包制作课程

前置：W4、W5 中所需参考。

步骤：

1. 完成第 05～10 章。
2. 接入 option、UI、typed custom data、材质和后处理链。
3. 将教学包组织为清晰的 fragment，展示顺序与依赖。
4. 形成独立视觉风格、预设、回退路径和 README。
5. 完成静态分支验证及实际加载、重载、resize、切包检查。
6. 从最终 ZIP 按全新作者流程重走一次教程。

产物：完整主线、最终教学包、分发说明及运行时证据摘要。

验收：读者能修改包的风格和结构；关闭可选效果后的活动闭包符合说明；最终下载包可复现课程结果。

### W7：补齐工具、排错与效果实践

前置：W5、W6。

步骤：

1. 完成 Analyzer、Schema、content snapshot、driver report 的使用指南。
2. 完成第 8.2 节的主要故障入口。
3. 为常见效果提供独立功能示例及成本说明。
4. 从 Dawnlight、ToonLab、MakeUp 提取功能关系图和案例。
5. 记录 history、时序、阴影等高级专题的适用边界。

产物：工具闭环、症状排错页、基础效果实践和大型包案例索引。

验收：能够通过 code/file/pointer/graph/interface/report 定位至少一类真实配置错误；进阶案例不依赖隐式私有接口。

### W8：完成发布质量检查

前置：W4～W7 的 v1 内容。

步骤：

1. 核对正式页面元数据、导航、来源和版本状态。
2. 对全部示例执行静态校验、打包和解压重验。
3. 复验关键运行时记录与当前源码哈希是否一致。
4. 检查中文搜索、诊断码搜索、移动端和键盘操作。
5. 检查项目 base、深层链接、图片和下载哈希。
6. 记录首版页面资源大小和搜索索引大小，建立后续性能基线。
7. 移除正式导航中的空白页面、占位文案和无效链接。

产物：`artifacts/site-acceptance.json`、待处理清单、v1 发布说明。

验收：第 17 节所有 v1 必需项通过；未通过的实验项明确标注且不支撑超范围结论。

### W9：发布 v1 并建立维护流程

前置：W8。

步骤：

1. 固定站点发布 commit、宿主 baseline 和所有下载指纹。
2. 部署已检查的产物，完成线上冒烟检查。
3. 发布文档更新记录、适用版本和示例下载说明。
4. 演练回滚至先前站点产物。
5. 建立内容问题、示例问题和基线升级的反馈模板。
6. 用一次小规模变更演练上游差异检查与页面更新。

产物：正式站点、可追溯发布清单、维护说明。

验收：站点可访问、下载可校验、版本可追溯、回滚方法可执行。

### W10：按实际需求增强

前置：稳定运行的 v1。

优先顺序：

1. 从 graph dump 显示可点击的资源与命令图。
2. 为复杂效果增加图片对比与文件差异展示。
3. 补充高级功能与作者案例。
4. 根据真实读者需求增加英文页面。
5. 当同时维护多个宿主版本确有必要时，再建立版本目录或重新评估框架。

每个增强项单独定义输入、产物和验收，不影响既有静态教程和下载功能。

### 16.1 依赖顺序与发布节点

~~~text
W0 → W1
W0 → W2
W1 + W2 → W3
W3 → W4
W1 + W3 → W5
W4 + W5 的所需参考 → W6
W5 + W6 → W7
W4～W7 的 v1 内容 → W8 → W9 → W10
~~~

依赖以各阶段“前置”说明为准。首次预览可在 W4 完成后发布已完成子集；v1 需要完成 W5～W9。

## 17. v1 验收清单

| 编号 | 验收内容 | 所需证据 |
| --- | --- | --- |
| A01 | 干净 checkout 可构建，无本机绝对路径依赖 | CI 构建与锁定输入报告 |
| A02 | 宿主、工具、合同和 Schema 版本明确 | lock、资产清单、基线页 |
| A03 | 主线可从空目录完成独立包 | 章节、下载、逐章运行记录 |
| A04 | 公开 JSON 表面均有归属与解释 | 字段覆盖清单、来源映射 |
| A05 | 网页、源码、ZIP 和验证输入一致 | 文件清单、解压验证、哈希 |
| A06 | 结构/语义/静态接口/驱动证据区分准确 | 页面状态与原始报告对应 |
| A07 | 关键选项和禁用路径有验证 | 分支分析与运行记录 |
| A08 | 生命周期声明有相应覆盖 | reload/switch/resize/history 等适用记录 |
| A09 | 搜索能找到中文主题、标识符与诊断码 | 固定查询验收表 |
| A10 | 深层路由和项目 base 正确 | 构建链接检查与线上冒烟 |
| A11 | 移动端、代码和键盘交互可使用 | 人工视觉与操作检查记录 |
| A12 | 更新、部署和回滚可追溯 | 发布清单、工作流和维护演练 |

以下情况不算完成：仅有目录没有正文；只提供局部配置没有完整示例；把 Schema 通过标为驱动通过；把实验室示例覆盖范围写成完整世界支持；示例修改后继续沿用旧运行证据。

## 18. 主要风险与处理方法

| 风险 | 处理方法 | 发现阶段 |
| --- | --- | --- |
| 阶段文档与当前实现不同 | 冻结 commit，核对合同/Catalog/Loader，页面记录来源 | W0/W5 |
| 工具尚无 CI 可获取资产 | 先建立带哈希的真实发布来源，再接入跨仓库检查 | W1 |
| 外置起步包假设不成立 | 先制作最小垂直切片并验证 host/fallback/场景目标 | W3/W4 |
| 仅凭 Schema 推导运行能力 | 维护能力组合与 Loader/运行时证据 | W5/W8 |
| 教程、下载和源码逐渐分叉 | 单一源码、代码生成、ZIP 解压重验 | W3 起持续 |
| 新能力增加后人工说明遗漏 | 字段覆盖与失效语义记录检查 | W5 起持续 |
| 中文搜索召回不足 | 固定查询集，配置分词并检查标识符精确匹配 | W2/W8 |
| GitHub Pages 子路径失效 | base helper、深层路由和公开 URL 冒烟 | W2/W8/W9 |
| GPU 验证无法在普通 CI 执行 | Windows 人工/专用环境验证，静态 CI 保留真实边界 | W4/W6/W8 |
| 大型包体量影响学习与站点 | 主线保持小示例，进阶功能切片，大文件走 Release | W6/W7 |
| 过早维护多语言和多版本 | v1 聚焦中文与一个主基线，后续按需求扩展 | W0/W10 |

## 19. 上游升级与持续维护

每次宿主升级采用同一流程：

1. 选择新 commit/发布版本，保留旧 baseline。
2. 导入候选快照与相同构建的工具。
3. 比较字段、token、Catalog ID/version、输入类型/空间、资源与命令约束。
4. 对所有登记示例执行生产 Loader 与接口检查。
5. 更新受影响页面、兼容性说明、下载和元数据。
6. 对受影响的运行时场景重验；其余记录能否复用以身份和变更范围为依据。
7. 将移除或改变的能力写入迁移说明，提供前后配置和替代路径。
8. 完成站点验收后切换主基线，保留旧下载和历史说明。

文案修改只运行适当检查；字段、示例、基线和生成脚本修改触发相应完整验证。普通构建不能悄悄批准新的 Schema、宿主包或发布账本。

维护者每次合并应能回答：

- 此变更适用于哪个基线？
- 哪些页面、示例和下载受到影响？
- 哪些结论来自代码、静态工具或真实运行？
- 哪些旧证据需要失效或重验？

## 20. 开始实施时的具体顺序

建议首先完成以下任务，再投入大规模正文迁移：

1. 建立 W0 的来源映射和能力表，确认 v5 主线实际范围。
2. 固定 Analyzer 获取方式，并从仓库外目录验证原始指南与一个实例包。
3. 实现一个真正可加载的外置起步包，验证首次后处理的数据流。
4. 初始化 VitePress，完成首页、概念页、首章和一个下载页。
5. 接通同源代码展示、ZIP 和 Analyzer 检查。
6. 完成 Pages 子路径部署和搜索的最小闭环。
7. 按 W4～W9 扩展课程、参考和发布质量，不先批量生成空白页面。

实施交付建议分为五个可评审批次：

| 批次 | 内容 | 对应阶段 |
| --- | --- | --- |
| B1 | 基线、导入、工具获取、工程骨架 | W0～W2 |
| B2 | 起步包、代码/下载生成、前半课程、首个预览 | W3～W4 |
| B3 | 完整字段参考、公共 ABI、兼容性 | W5 |
| B4 | 完整教学包、工具排错、效果实践 | W6～W7 |
| B5 | 全量验收、正式部署、维护与回滚 | W8～W9 |

每个批次同时交付内容、自动检查和简短验收记录。网站的最终判断标准是读者能够完成自己的包、解释数据流并定位实际错误，而不只是页面数量。

## 21. 参考资料与本规划的有效范围

外部资料：

- [VitePress 官方文档](https://vitepress.dev/)。
- [VitePress 部署指南](https://vitepress.dev/guide/deploy)。
- [GitHub Pages 官方文档](https://docs.github.com/en/pages)。

宿主资料入口见第 2.2 节，并以文首 commit 为本次调研来源。实施时应再次核对当前版本；本规划中的网站脚本、目录、元数据格式和工作流均为拟实现方案。

本文件的初始交付是实施规划。W0/W1 已交付基线、精确字节输入和工具链；W2 建立网站骨架、真实概念页和部署流程；W3 建立起步包与内容生成。W4 已建立前半段连续课程和有范围的真实游戏观察，独立真人试用仍待完成。W5 已交付公开 JSON 与 ABI 的双语参考、字段/字典归属、固定 Catalog/诊断及版本差异，见 [W5 验收](baseline/W5ReferenceAudit.zh-CN.md)。后续继续 W6～W9，不将当前内容预览视为完整 v1 发布。
