# ADR 0002：作者合同与候选基线

- 状态：W0 已冻结候选基线；W1 已冻结并验收工具与输入，运行时待处理项保留。
- 日期：2026-10-23。
- 基线 ID：`candidate-f8aaa5c4`。
- 机器记录：[upstream.lock.json](../../upstream.lock.json)。
- 验证摘要：[w0-verification.json](../../metadata/w0-verification.json)。
- 验收说明：[W0 验收记录](../baseline/W0BaselineAudit.zh-CN.md)。
- 后续结果：[W1 验收记录](../baseline/W1ToolchainAudit.zh-CN.md)。下文第 1～10 节保留 W0 时点的决策与观察，W1 续记见第 11 节。

## 1. 选择的源码

| 项目 | 值 |
| --- | --- |
| 宿主 remote | `https://github.com/EltanceX/DawnlightCore` |
| 精确 commit | `f8aaa5c4218f54536ccf994a2d512aed2e3678b7` |
| 当前本地分支 | `codex/api-1.9.5.1` |
| 远程默认分支 | `codex/api-1.9.3.1` |
| 工作树 | 本次开始和检查后均无未提交修改 |
| 远程可获取性 | 当前认证账户能够读取该 commit；仓库为 private |

选择精确 commit 作为作者语义身份。Catalog 的 host 元数据显示 `version=3.1`、`build=unknown`，不足以识别这次宿主源码，因此不能用该展示版本代替 commit。

官方原版与重构前稳定光影版本仍作为用户提供的历史参照，不混入本基线的 Loader、Schema、Catalog 或示例源码。

## 2. 作者主线

- 主教程：Manifest v5、Scene ABI v2。
- materials ABI：1。
- customData ABI：1。
- Manifest source composition 格式：1。
- 兼容专题：Manifest v3/v4，保留它们原本的路由和 source owner 规则。
- 首版运行基线：Windows x64、.NET 10、OpenGL ES 3.2、单主 view。
- Android ARM64：已有构建准备资料，真机待验收，不作为首版教学运行平台。
- VR 完整光影路径与分屏：不在支持范围。

v5 材质、自定义数据和已接入的高级公共合同可以讲解。支持说明同时保留实验边界、性能和发布证据待验收项，不将整个 v5 写成已经完成生产发布认证。

## 3. 合同版本

| 合同 | 选择与约束 |
| --- | --- |
| Analyzer protocol | 支持 1/2/3；v5 客户端选择 3 |
| Catalog contract | 2 |
| Scene ABI | 2 |
| Scene explain | 1 |
| Graph 输出合同 | 2 |
| v5 Graph IR | 本次数据解释输出为 7 |
| Program interface | v5 显式选择 2；省略仍为旧 v1 |
| Schema bundle RPC 请求 | v3/v4 为 1；v5 为 2 |
| Schema CLI 执行结果 envelope | 当前 verify 结果为 contractVersion 1，与所选 bundle 版本分别记录 |
| completion/schema index | v3/v4 使用 1；v5 使用 2 |
| Data ABI Catalog | contractVersion 1、abiVersion 1 |
| Schema draft | Draft 2020-12 |

不要将 Analyzer protocol、Graph IR、Schema index 和 Manifest 的数字互相替代。

## 4. 冻结的主要指纹

| 指纹 | SHA-256 |
| --- | --- |
| 当前 Catalog v2 | `4bffe7124912432af9101957ae54405f962d2b9bcd6e545bd6902e0941aae0e4` |
| v3/v4 Schema 兼容 Catalog 投影 | `751f68d2928f48ba49e1c6d56bcc01b5cd5c08f08b263ed6fca55e024eed0f00` |
| Scene ABI | `4bc28c17beffea2311a422fff9f633d2e4f03784460d0254adda8af2e766d84c` |
| Data ABI | `cc014b0fb2e578da45b5c96bcb15ec4c03a211f0260a2624862687057a382cb0` |
| v5 Schema | `afc9ad7c137379a98a6ba99e9daeffeb836b84eb41fdded060904e32c712b133` |

全部 Schema、completion、index、源码入口和工具文件的长度及 SHA-256 已写入机器记录。

v3/v4 与 v5 的 Catalog 哈希差异已经解释：`SchemaBundleApplicationService.GetBundle` 对旧版本调用 `CatalogApplicationService.RemoveV5SkyEntries`，移除仅向新版本公开的 sky、jitter、light geometry 等增量再计算投影哈希。两套 `schema verify` 都通过；不应把旧 hash 直接替换成当前 hash。

## 5. 本次已确认的能力事实

当前 Catalog v2 包含：

- 7 个 Stage template、9 个 Service、41 个 Semantic。
- 26 个 EngineDraw Provider、2 项 Capability、9 种资源格式。
- 4 个 Scene category、8 个 SceneDraw Provider、1 个 Scene vertex ABI。
- 41 个 Scene system binding、4 个 fallback。

v5 Data ABI Catalog 包含 9 种类型、35 个函数、23 项公共输入。指南中的“11 项”是早期基础输入清单，当前完整参考应从 completion 的 `dataAbiCatalog` 生成。

这些数量只描述本基线，不作为未来 API 上限或永久合同。

### 5.1 可进入 v1 的基础能力

Manifest 组合、Program/define/variant、七类 Command、资源与绑定、Scene category 路由、frameTarget、drawBuffers、选项与 UI、材质与 typed custom data、Analyzer 解释与诊断。

本次四份代表性包通过 Loader；Scene 路由、数据接口、材质布局和资源图也完成了指定 GL-free 检查。具体证据按 check ID 查询，不把一份案例的结果推广到任意配置。

### 5.2 实现存在且需标注边界的能力

公共时序 view、显式 jitter、光源视锥几何、G9 比较采样及 P11 正式发布接口。参考各自 version、Provider/Service 和设备限制。

例如 G9 v1 仅在对应 graphics 执行边界使用 direct persistent depth texture2D，LEQUAL、nearest/linear，有明确的 sampler slot 与类型约束。

### 5.3 预留或不支持的能力

- Frame/Transient：token 存在，但资源转换器明确拒绝，别名分配仍是计划。
- texture3D/Array 的通用声明：不在当前 resourceKind 内。
- Geometry/Tessellation Program stage：不提供未公开的配置方法。
- 多 view/分屏和完整 VR：不作为本基线的承诺。

## 6. 示例角色

| 示例 | 版本 | W0 用途 | 边界 |
| --- | --- | --- | --- |
| Dawnlight_v3.1 | v3 | legacy 大型包 Loader 兼容样本 | 不直接迁为 v5 新手模板 |
| SceneAbiLab_v0.1 | v4 | Terrain ABI、MRT、fallback 路由样本 | sorted translucent 显式 disabled，有对应诊断 |
| CustomDataLab_Both | v5 | 材质和自定义数据样本 | 调试实验包，不等于完整作者成品 |
| MakeUpUltraFast_SC_v0.21 | v5 | 组合文件和综合能力 Loader/路由样本 | 位于 candidate 目录，静态通过不等于 release-ready |

W0 不创建第二份上游权威样例。可下载课程起步包留到 W3/W4 另行制作和验证。

## 7. 工具获取与构建身份

本次使用当前源码重新构建的 framework-dependent Debug Analyzer，SDK 为 10.0.301，构建 0 errors / 66 warnings。已冻结 Analyzer、Survivalcraft、Engine、EntitySystem 及相关 deps/runtimeconfig 文件指纹。

当前工具只用于本轮检查，不视为已发布的自包含作者工具。

宿主仓库没有可见 GitHub Release 资产。W1 使用仓库已有的 `win-x64.pubxml` 发布 profile 构建自包含工具，建立实际可取得的版本化资产，并记录完整目录清单、SHA-256、合同和来源。

获取方案不能依赖匿名 checkout 私有宿主仓库，也不能直接把未登记的本机 bin 目录作为公开下载。

## 8. 源码字节域

冻结来源优先使用精确 commit 的 Git blob 字节，保持不可变资源本来存在的 LF/CRLF 混合字节。来源记录同时保存本轮实际工作树指纹。

本次 Windows checkout 中，`CustomDataLab_Both` 七份文件和 v5 指南是 CRLF；Git index/blob 为 LF。`.gitattributes` 对旧正式包又明确采用 `-text` 保留字节，因此不能对所有源文件统一转换换行。

v5 诊断抽取的七份文件与该 commit 的 Git blob 精确匹配；与本地 CRLF 工作树不逐字节相同。该差异已记录，不算源码内容发生变更。

W1 需在选定的 Git blob 字节域完成实际导入，并重新运行对应检查和冻结工具输入/输出身份。W0 本地工作树的 shader/source fingerprint 不能直接冒充未来导入包的运行时身份。

## 9. 原始 v5 指南失败

原始 `docs verify-v5` 当前退出码为 1，stderr：

~~~text
DLTOOL2001: Every fenced guide block must have exactly one language and file=<relative-path> marker.
~~~

原因是指南 G9 说明中的普通 JSON fence，没有 `file=...`；校验器按可重建指南合同检查所有三反引号代码块。

本次仅在忽略的 `artifacts/` 下创建“完整可重建文件”章节的诊断副本。副本通过校验、七文件匹配 Git blob，证明故障位于说明代码块与抽取合同之间。原始指南仍按失败记录，宿主文件保持不变。

W1 关闭此项有两条有效路径：

1. 在上游将说明片段移到不属于可重建指南的文档，或明确完善文档合同并增加相应验证；固定实际修复后的来源。
2. 若确实采用网站专用指南变体，单独登记补丁、来源、身份和验证结果，同时保留上游原始失败，不能把变体结果写成原始指南结果。

不通过全局忽略错误、删除失败记录或悄悄改写原始字节完成验收。

## 10. 待处理项与本次结论

机器记录中的 W0-01～W0-06 分别对应：原始指南、工具资产、部署基础设施、外置起步包、P11 发布证据和字节域复验。

本阶段完成“冻结范围与候选基线”。候选状态为 `candidate-with-open-items`，允许开始 W1 的工具与导入工作；不表示 W1 资产验收、课程实机验证或生产光影包发布完成。

## 11. W1 续记

2026-10-23 完成锁定输入与工具链。宿主 commit 与基线 ID 不变；当前 lock 状态为 `locked-inputs-verified-with-runtime-open-items`。

432 个 Git blob 已按精确字节导入，完整快照含 438 个文件；自包含 win-x64 Analyzer 含 278 个文件。固定工具与作者快照发布于私有仓库的 `docs-tools-f8aaa5c4-w1.1` prerelease，已在空缓存新目录实际下载、核对并通过外部 cwd 验收。

原始 v5 指南仍失败；独立 `dawnlight-v5-guide-site-v1` 变体通过并重建出与锁定示例一致的七个文件。W0-01、W0-02、W0-06 已按记录关闭网站工具链阻塞；W0-03、W0-04、W0-05 保留。W0 的原始失败与历史检查不改写。

网站远程仓库、CI secret 和 Pages 留给 W2；课程实机、驱动和性能证据维持原状态。
