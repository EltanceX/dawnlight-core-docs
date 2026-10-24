# ADR 0001：文档网站架构与发布范围

- 状态：W0 已采纳。
- 日期：2026-10-23。
- 实施依据：[网站实现方案](../WebsiteImplementationPlan.zh-CN.md)。
- 关联决策：[作者基线](0002-authoring-baseline.md)。
- 执行记录：[W0 验收记录](../baseline/W0BaselineAudit.zh-CN.md)。

## 1. 决策

使用独立仓库维护中文作者文档，采用 VitePress、TypeScript、npm 和 GitHub Pages。文档围绕固定宿主基线组织，包含连续教程、概念解释、完整参考、功能示例和排错流程。

普通网站构建只消费锁定输入。宿主同步是显式操作，后续 W1 实现导入与校验，W2 创建前端工程。

网站采用静态内容，不在浏览器中执行光影包，不将浏览器预览视为 Survivalcraft GPU 验证环境。

## 2. 仓库与部署身份

| 项目 | 已冻结值 | 状态 |
| --- | --- | --- |
| 仓库名 | `dawnlight-core-docs` | 用户明确选择 |
| 仓库 owner 候选 | `EltanceX` | 从宿主 remote 推断，实施远程配置时核实 |
| 目标仓库 URL | `https://github.com/EltanceX/dawnlight-core-docs` | 目标配置，当前 API 返回 404 |
| 默认分支 | `main` | 网站的计划分支，尚未观察到远程分支 |
| Pages base | `/dawnlight-core-docs/` | 与用户选择的仓库名一致 |
| 目标站点 URL | `https://eltancex.github.io/dawnlight-core-docs/` | 计划地址，尚未部署 |
| 首版语言 | `zh-CN` | 已确定 |
| 自定义域名 | 无 | 首版使用 Pages 项目站 |

HTTP 404 表示当前认证上下文无法取得该仓库，不能单独证明仓库不存在。本阶段不创建远程仓库、不初始化本地 Git、不推送内容。

宿主远程默认分支为 `codex/api-1.9.3.1`，当前选定源码位于另一分支。网站导入只认精确 commit，不跟随该默认分支。

## 3. 工程职责

| 路径 | 职责 |
| --- | --- |
| `docs/` | 方案、ADR、阶段验收和维护说明 |
| `site/` | 后续建立的公开页面、主题和静态资源 |
| `metadata/` | 来源、支持状态、页面与示例关联、验证摘要 |
| `upstream.lock.json` | 当前候选基线、合同、工具、Schema 与待处理项 |
| `vendor/` | W1 导入的必要上游快照；本阶段尚未建立 |
| `examples/` | W3 起维护的网站教学包；上游实例保留原始来源 |
| `artifacts/` | 本地命令原始输出与诊断副本，已通过 .gitignore 排除 |

Node/VitePress 的精确版本留到 W2 依据当时受支持的组合选择。当前观察到的本机 Node 26.7.0 不自动成为网站要求。

网站初期只有一个主基线。v3/v4 作为兼容专题；多版本完整镜像、英文站和交互图作为后续增强。

## 4. 首次预览范围

首次预览在 W4 完成后发布下列 20 个页面。路由以英文 slug 规划，实际静态 URL 由 VitePress 配置生成。

| 页面路径 | 必须回答的问题 |
| --- | --- |
| `index` | 网站教什么、适用什么版本、从哪里开始 |
| `start/index` | 新作者的学习顺序与前置知识 |
| `start/environment` | 宿主、平台、基础 GLSL 与运行环境 |
| `start/tools` | 工具如何取得、如何校验版本 |
| `start/pack-layout` | 完整包目录与入口文件是什么 |
| `start/load-reload` | 如何加载、重载并确认实际生效的包 |
| `concepts/pipeline` | JSON、GLSL、C# 和执行节点怎样协作 |
| `concepts/resources-targets` | 资源、目标、location、drawBuffers 与读写的区别 |
| `concepts/source-ownership` | 包源码、BuiltIn fallback 和 include 的边界 |
| `tutorial/index` | 本课程的章节、下载与最终目标 |
| `tutorial/00-starter` | 从空目录得到一个真正可加载的外置起步包 |
| `tutorial/01-first-post` | 完成第一个后处理 |
| `tutorial/02-resources` | 声明并消费独立渲染资源 |
| `tutorial/03-scene` | 接入 Scene 路由与整帧目标 |
| `tutorial/04-mrt` | 写出和读取包自定义的 MRT 数据 |
| `reference/index` | 当前已经完成的参考入口与适用版本 |
| `tools/analyzer` | 运行静态验证并读懂结果边界 |
| `troubleshooting/load-failures` | 从加载、版本、路由到诊断定位首个错误 |
| `examples/index` | 获得与网页代码一致的示例 ZIP |
| `compatibility/current-baseline` | 当前基线、支持状态和已知限制 |

正式导航只展示已经完成且验证范围明确的页面。尚未实现的条目留在工程登记中，不能作为空白页面发布。

起步包不直接复制内部 BuiltIn Minimal descriptor。必须先在 W3/W4 确定合法的 External Complete host、fallback、资源和场景目标组合。

## 5. v1 范围

### 5.1 连续课程

完成实施方案第 7 节的 00～10 章，包括选项、设置 UI、typed custom data、材质映射、后处理链、完整风格与打包验证。

最终包需要完整的场景接入、配置、资源管理、禁用路径、回退和分发说明。第一款作品不要求同时实现所有高级效果。

### 5.2 参考范围

所选基线的全部公开配置表面必须有归属：

- Manifest 根、组合文件、版本和路径规则。
- options、条件、Program、编译模式、defines 和 variants。
- 资源、格式、尺寸、内容、采样、view、lifetime 和 history。
- Pass/Stage、host、顺序、Service 与七类 Command。
- targets、drawBuffers、state、viewport、binding 与 semantic。
- Scene category、公共 Provider、顶点与系统绑定 ABI、frameTarget。
- materials、内容身份、mapping、SSBO 和 helper。
- customData、公共输入、表达式、类型、频率、空间与预算。
- 设置 UI、翻译、控件和 option 关系。
- Analyzer、Schema、Catalog、诊断、快照与报告。

覆盖以最终生成 Schema、Catalog、Loader 和实际补充合同共同核对。不能仅遍历基础 authoring-contract 字典，因为 v5 的 sky、comparison 等增量还存在于版本化生成与加载逻辑中。

### 5.3 效果与工具

v1 提供可下载的基础效果实践、工具闭环、症状排错和大型包案例索引。高级阴影、时序、体积效果的公共 ABI 在参考中说明，完整进阶教程可以后续逐项完成。

## 6. 内容与资产来源

来源清单见 [source-map.json](../../metadata/source-map.json)，支持状态见 [capabilities.json](../../metadata/capabilities.json)。

宿主仓库目前为私有仓库，不能把匿名访问宿主源码作为新作者的前置条件。W1 需要建立独立的、可访问且带哈希和 provenance 的作者工具与必要文档资产。是否公开整个宿主源码不属于本网站工程的前置决策。

网页代码、ZIP 和验证输入来自同一份源码。上游 SceneAbiLab/CustomDataLab 从固定 commit 精确导入；课程包另用独立命名空间，不维护另一个可编辑的同名上游样例。

原始指南、网页派生内容和诊断副本各有独立身份。当前 v5 原始指南校验失败，不能用已通过的诊断副本替代它的验证状态。

## 7. 质量门与实施边界

- 所有正式页面标注适用基线与证据范围。
- Schema 通过、Loader 通过、静态接口、driverObserved、画面、生命周期与性能分别记录。
- 下载包需要解压后重验并比对源码清单。
- 搜索验证中文、标识符和诊断码。
- 构建验证项目 base、深层页面、锚点、图片和下载。
- 运行时声明由真实宿主验证，普通 CI 保持 GL-free 边界。
- W0 接受的是范围与候选基线；W1 的资产冻结和后续课程运行验收仍需各自完成。

## 8. 后续实施

W1 首先处理原始指南代码块合同、工具资产获取和源码字节域；W2 创建网站骨架及远程部署配置；W3/W4 验证起步包和首条课程路径。

本 ADR 未选择前端依赖的具体版本，未创建网站工程，未批准任何光影包的正式生产发布。
