# W0：范围与候选基线冻结验收记录

- 日期：2026-10-23。
- 阶段结果：W0 完成，候选基线保留明确待处理项。
- 基线 ID：`candidate-f8aaa5c4`。
- 源码 commit：`f8aaa5c4218f54536ccf994a2d512aed2e3678b7`。
- 范围决策：[ADR 0001](../adr/0001-site-architecture.md)。
- 作者基线：[ADR 0002](../adr/0002-authoring-baseline.md)。

## 1. 本阶段交付

| 文件 | 内容 |
| --- | --- |
| [0001-site-architecture.md](../adr/0001-site-architecture.md) | 网站技术选择、首次预览 20 页、v1 范围、仓库与部署参数 |
| [0002-authoring-baseline.md](../adr/0002-authoring-baseline.md) | 精确 commit、版本、哈希、能力边界和候选基线结论 |
| [source-map.json](../../metadata/source-map.json) | 63 处来源入口、Git blob 与工作树指纹、用途和计划页面 |
| [capabilities.json](../../metadata/capabilities.json) | 29 项能力、支持状态、约束、来源与本轮证据关联 |
| [w0-verification.json](../../metadata/w0-verification.json) | 构建结果、15 条检查、输出哈希、网络观察和诊断七文件对照 |
| [upstream.lock.json](../../upstream.lock.json) | 候选版本锁、合同与工具指纹、Schema bundle、部署候选和 6 项待处理事项 |
| [.gitignore](../../.gitignore) | 排除本地 artifacts 与缓存 |

本阶段未创建网站前端、未创建远程仓库、未执行部署或光影包发布。宿主只产生正常构建输出，受 Git 跟踪的工作树保持干净。

## 2. 冻结范围

主线使用 v5 / Scene ABI v2，保留 v3/v4 兼容专题。Windows x64 / .NET 10 / GLES 3.2 为首版作者运行基线。

首次预览完成入门、前五章课程、资源与所有权概念、基础工具和示例入口。v1 补齐 00～10 章、全部公开配置参考、工具排错、完整教学包和可复现分发。

高级效果完整课程、多语言、交互资源图和多维护版本放在后续增强。公开 ABI 参考仍需覆盖已纳入基线的高级合同与限制。

网站仓库名 `dawnlight-core-docs` 由用户明确选择，项目 base 为 `/dawnlight-core-docs/`。owner 候选 `EltanceX` 来自宿主 remote；`main` 是网站计划分支。当前仓库查询返回 404，按“未找到或当前账户不可访问”记录。

## 3. 源码与工具身份

### 3.1 源码

- 宿主 remote 为 `EltanceX/DawnlightCore`，GitHub API 返回 private。
- API 可以读取选定 commit，当前源码工作树干净。
- 本地选定分支为 `codex/api-1.9.5.1`。
- 远程默认分支为 `codex/api-1.9.3.1`，W1 不跟随它导入。
- 当前认证上下文没有看到 GitHub Release 资产。

### 3.2 构建

实际执行：

~~~powershell
dotnet build ./tools/ShaderPackAnalyzer/ShaderPackAnalyzer.csproj -c Debug --no-restore -v minimal
~~~

结果：退出码 0，0 errors / 66 warnings。使用 .NET SDK 10.0.301，运行环境为 Windows x64 / .NET runtime 10.0.9。

警告包含既有编译和依赖审计提示。本阶段不修改宿主依赖，也不把 Debug 成功视为 ReleaseCandidate 发布门通过。

实际检查使用本次构建的 framework-dependent Analyzer，其关键 DLL 和配置文件已记录 SHA-256。W1 的自包含发布资产尚未生成。

普通 Windows 游戏项目本轮没有重新构建，也没有启动图形上下文。

## 4. GL-free 检查结果

全部命令在网站项目目录调用 Analyzer，清除子进程环境中的 `DAWNLIGHT_*` 覆盖，原始 stdout/stderr 保存到 `artifacts/w0/`。

| Check ID | 检查对象 | 退出码 | 结果与含义 |
| --- | --- | --- | --- |
| `catalog-v2` | 当前生产注册目录 | 0 | 获取当前 Catalog v2 |
| `schema-v4` | 已提交的 v3/v4 bundle | 0 | 精确字节 verify 通过 |
| `schema-v5` | 已提交的 v5 bundle | 0 | 精确字节 verify 通过 |
| `pack-v3-dawnlight` | Dawnlight_v3.1 | 0 | 生产 Loader valid=true |
| `pack-v4-sceneabi` | SceneAbiLab_v0.1 | 0 | 生产 Loader valid=true |
| `pack-v5-customdata` | CustomDataLab_Both | 0 | 生产 Loader valid=true |
| `pack-v5-makeup` | MakeUpUltraFast_SC_v0.21 | 0 | 生产 Loader valid=true |
| `guide-v4` | 原始 v3/v4 作者指南 | 0 | 重建七文件与诊断表检查通过 |
| `guide-v5` | 原始 v5 作者指南 | 1 | DLTOOL2001，原始指南门未通过 |
| `guide-v5-diagnostic` | 仅 file= 文件章节的诊断副本 | 0 | 仅用于定位问题，不能代替上一条 |
| `scene-v4` | SceneAbiLab 路由 | 0 | 解析四类路由，保留 disabled 类别诊断 |
| `scene-v5` | MakeUp v0.21 路由 | 0 | 解析四类路由，无驱动报告 |
| `data-v5` | CustomDataLab 数据接口 | 0 | 静态数据和声明接口解释成功 |
| `materials-v5` | CustomDataLab 材质布局 | 0 | 离线布局解释成功 |
| `graph-v5` | CustomDataLab Graph contract 2 | 0 | 资源图解析成功，保留 disabled 类别诊断 |

合计 15 条命令，14 条退出码为 0，1 条失败；其中 1 条成功命令使用明确标记的诊断派生输入。不能将该合计描述成“原始输入全部通过”。

SceneAbiLab 和 CustomDataLab 部分路由显式禁用，工具保留 `DLABI2005` 等相应诊断。这是示例的设计边界，不能将其画面覆盖描述为完整成品包。

没有传入世界快照或驱动报告，结果保留 `driverStatus=notProvided`、`liveWorldVerified=false`、`runtimeEvaluated=false` 和适用的 `mappingStatus=deferred`。

## 5. 主要核对结论

### 5.1 两个 Catalog 哈希均有效

当前 v2/v5 Catalog：

~~~text
4bffe7124912432af9101957ae54405f962d2b9bcd6e545bd6902e0941aae0e4
~~~

旧版 Schema 兼容投影：

~~~text
751f68d2928f48ba49e1c6d56bcc01b5cd5c08f08b263ed6fca55e024eed0f00
~~~

实现对 v3/v4 移除仅向新版本提供的增量后重新计算哈希，两套 Schema 验证成功。此项已解释，不作为 Schema 漂移缺陷。

### 5.2 公共输入清单应从当前数据目录生成

当前 v5 Data ABI Catalog 为 23 项输入、9 种类型、35 个函数。旧指南的“11 项”不能当作完整清单。公共输入的类型、频率、空间、单位和依赖随当前 completion 导入。

### 5.3 基础字段字典不是全部 v5 增量的唯一入口

v5 sky、sampler2DShadow/comparison 等增量由版本化 Schema 生成器和 Loader 补充。因此字段覆盖以最终 Schema、Catalog 和生产语义共同核对，不能只扫描基础 token 字典。

### 5.4 资源 token 与分配能力分开

当前资源转换器支持其声明的 persistent 2D/cube/buffer 与 2D history 组合。Frame/Transient 虽出现在结构 token 中，转换路径仍明确拒绝；别名分配保持计划状态。

### 5.5 时序历史标记需要按阶段解释

历史机器合同保留 `runtimeReady=false` 的冻结状态，后续代码与文档记录了 Provider 接入。网站会结合当前实现与目录说明，避免将历史标记误读成当前完全没有实现。

### 5.6 Minimal 与外置起步包

BuiltIn Minimal 零扩展闭包有合同和测试来源。本轮没有执行该组测试，也未构造新的外置最小包。W3/W4 需要实际验证外置 host、fallback 和 frameTarget 的组合。

## 6. v5 原始指南故障与字节域

原始指南 G9 说明在 file-marked 七文件之前增加了普通 JSON fence。既有抽取器要求所有三反引号 fence 带 `file=...`，所以原始命令失败：

~~~text
ShaderPackAnalyzer failed: DLTOOL2001: Every fenced guide block must have exactly one language and file=<relative-path> marker.
~~~

诊断步骤：

1. 保持宿主原始文件不变。
2. 在被忽略的 artifacts 下，从“完整可重建文件”章节构建诊断副本。
3. 使用同一 Analyzer 执行 `docs verify-v5`，该副本通过。
4. 将抽取的七文件与所选 commit 的权威 Git blob 比对，七份均精确匹配。
5. 保留原始指南失败，不将诊断副本升级为原始通过证据。

还发现 Windows 工作树使用 CRLF，而 CustomDataLab 的 Git blob 是 LF。因此诊断文件与本地工作树不逐字节相同，文本只差换行；与 Git blob 的精确字节一致。

来源清单已同时记录 Git blob 和工作树指纹。W1 导入默认使用精确 Git blob，保留 `-text` 冻结资源的原始混合换行，不执行全局规范化，再对实际导入结果复验。

## 7. 待处理项

| ID | 问题或待配置项 | 处理阶段 | 对验收的影响 |
| --- | --- | --- | --- |
| W0-01 | 原始 v5 指南不符合可重建代码块合同 | W1 | W1 原始指南检查门必须处理，不可悄悄忽略 |
| W0-02 | 私有宿主没有可见作者工具 Release 资产 | W1 | 建立真实、版本化、带哈希的工具与必要文档获取方式 |
| W0-03 | 网站远程仓库、owner/main、Pages 尚未配置 | W2 | 部署前核实并配置；当前目标 URL 不代表已上线 |
| W0-04 | 外置教学起步包尚未制作和实机验证 | W3/W4 | 课程运行声明发布前完成 |
| W0-05 | P11 性能与正式发布证据仍待验收 | 按对应实机工作推进 | 保留限制，不影响准确标注范围的作者参考 |
| W0-06 | W1 需在选定字节域完成实际导入与复验 | W1 | 工具输入、来源和下载指纹必须属于同一字节域 |

旧版 Schema 投影差异、旧输入数量、历史 temporal 标记、资源 token 和 source owner 差异已有核对结论，在内容迁移中按对应规则呈现。

## 8. W0 验收

| 方案要求 | 状态 | 说明 |
| --- | --- | --- |
| 能读取宿主与历史并记录精确版本 | 完成 | commit、分支、remote 与可访问性已记录 |
| 明确作者主线和平台范围 | 完成 | v5/Scene ABI2；Windows 单主 view；兼容与实验边界分别说明 |
| 核对作者合同、Schema、Catalog | 完成 | 实际构建与检查，兼容投影和 v5 文档故障已解释 |
| 确定预览/v1/后续范围 | 完成 | ADR0001 冻结页面与功能分界 |
| 确定仓库与 Pages 参数或待配置步骤 | 完成 | 用户选定仓库名，远程配置真实状态明确 |
| 所有未知项有后续处理动作 | 完成 | 6 项待处理事项均有阶段和验收影响 |

W0 已完成，可以进入 W1。候选基线状态保持 `candidate-with-open-items`，没有改写为所有验证均通过或生产发布完成。

下一步先解决原始指南合同，建立自包含 Analyzer/authoring 资产获取方式，再按固定 Git blob 字节导入并验证。原始故障的处理如果产生新上游 commit，需要更新候选记录和差异说明，不能悄悄跟随分支升级。

## 9. 交付文件完整性检查

- 4 份 JSON 均可解析，lock 引用的来源、能力和验证记录哈希及长度匹配。
- 29 项能力的 source ID 和 check ID 均指向现有记录。
- 15 条命令的本地 stdout/stderr 文件与记录的 SHA-256 匹配。
- 4 份 Markdown 的代码围栏配对，19 处本地文件链接存在。
- 最后再次检查宿主工作树，仍无受 Git 跟踪的修改。
