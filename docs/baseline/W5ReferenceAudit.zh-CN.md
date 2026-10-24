# W5：公开 JSON 与 ABI 参考验收

- 日期：2026-10-24（America/New_York）。
- 基线：`candidate-f8aaa5c4` / `f8aaa5c4218f54536ccf994a2d512aed2e3678b7`。
- 状态：参考内容、结构生成、示例关联与网站验收已交付；不增加游戏、性能或正式 v5 发布结论。
- 机器记录：`metadata/w5-verification.json`、`metadata/reference-inputs.json`、`metadata/reference-examples.json`。

## 交付与来源

18 组双语页面覆盖 Manifest 根/组合、Options、Resources、Programs、Pass/Stage、七类 Command、Targets/state/drawBuffers、Bindings/semantics、Scene ABI、Materials、Custom Data、Settings UI、Catalog、诊断、工具合同、版本兼容及完整示例。顶栏、侧栏、首页和阅读路线均可进入参考；两个语言保留相同结构锚点。

结构由三版固定 Schema 生成，含展开后的完整条件规则；Catalog/23 个 Data ABI 输入、函数、预算和 closed tokens 从固定导出生成。默认行为、ID 所有权、条件闭包、单位/空间、版本门和支持组合由手写双语正文说明，链接到精确 commit 的公开合同与 Loader。

字段清单覆盖 1052 个命名属性出现位置及 16 个字典位置，逐条关联结构锚点、行为锚点和登记示例，包括 materials/customData 嵌套对象、if/then/not 条件出现位置及 UI 的 locale/key 字典。UI 七类对象来自实际 Loader 白名单的复核投影，记录原始文件和哈希，不称为官方 JSON Schema。字段数量用于检测结构遗漏，不证明全部运行行为。

v3/v4 在兼容页独立生成，不将共享定义存在解释为根可达。Catalog 的历史 supportedFormats.manifest=[3,4]、旧指南的 11 个输入和早期 temporal.runtimeReady=false 原样保留，分别解释当前 v5 Loader/Schema、23 项注册及后续接入的证据身份。

## 完整示例及限制

四份完整上游示例来自同一 commit：SceneAbiLab_v0.1、CustomDataLab_Both、Dawnlight_v3.1、MakeUpUltraFast_SC_v0.21，共 369 个文件。公开逐文件清单、SHA-256 与精确 Gitea 源码链接；完整宿主快照继续留在本地/私有资产。

生产 Analyzer 对四份目录执行 15 次 pack/scene/graph/materials/layout/data interface 检查，均符合预期。SceneAbiLab 的 disabled sorted_translucent 引发 DLABI2005 警告，原样展示，不宣传完整世界可见性。

绑定覆盖核对发现锁定集合缺少正向 UBO 示例，因此增加完整 UBO/materialTable **反例**：结构 pack validate 通过，但 scene/graph/interface 必须退出 1 并包含 DLMAT1002。每个 materialTable 消费者必须是只读 SSBO，额外合法 SSBO 不能使 UBO 合法。源码与全新 ZIP 各执行四项检查，共 8 次，输出哈希完全一致。公开索引保留 expected-rejected-combination，下载明确标为反例，不将它视为可运行预设或 UBO 正向证据。

这也核实了普通 buffer 的 persistent 限制、asset/clear/external 拒绝、undefined 生产者需求及 materialTable 的独立初始化/消费合同。W5 没有修改宿主源码、课程包或 W4 游戏证据。

## 验证

| 项目 | 结果 |
| --- | --- |
| 内容回归 | 43/43，含 16 项参考回归：过期输入、缺失归属/页面/示例、反例误标、负向诊断遗漏、字节变化和生成确定性 |
| 锁定输入回归 | 6/6 |
| Analyzer | 23 次；15 次正向检查及 8 次反例源码/ZIP 预期结果；复验与已提交收据一致 |
| 网站构建 | 78 HTML：76 内容页与 2 个 404；全部链接、锚点、资源、双语 canonical/alternate 和根路径检查通过 |
| 浏览器 | 本地 72/72；覆盖全部参考双语页、深层语言切换、Schema 下载 SHA、23 项输入、字段/诊断搜索、展开 JSON 和窄屏 |
| 视觉复核 | 桌面 Catalog、手机 UI/参考页已查看；320/768/1024px 页面无横向溢出 |
| 公开边界 | 只新增网站源码、固定公开合同、公开清单和反例；无宿主源码片段、工具、完整快照或世界上传 |

生成器统一课程和参考的 output-manifest；普通构建不需要私有资产。CI 检查已提交收据和输入身份，重建全部派生内容并运行浏览器验收，不声称执行 Windows Analyzer 或游戏。具有固定私有工具资产的手动 Windows 工作流另可复现参考收据。

W0～W4 冻结记录和 W3 起步包/五份课程 ZIP 身份保持不变。域名、DNS、HTTPS 和 CNAME 保持原状态。兼容页因保留完整 v3/v4 结构具有较大的页面模块，记录为后续 W8 性能审查输入；本阶段不把静态内容通过解释为性能验收。部署工作流及线上浏览器结果另保留于本次 main 运行和忽略的 `artifacts/w5/`。
