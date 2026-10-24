## 行为与约束 {#behavior}

仅 Manifest v5，customData.abiVersion=1。variable 的 id/type/frequency/default/onError/expression 为显式合同；unit/space 在适用时标注并与输入一致。类型为 bool、int、uint、float、vec2/3/4、mat3/4。所有浮点 lane 必须有限；int/uint 保留 32-bit 精确 words，不经过 float；bool 为 0/1，矩阵为 9/16 个 column-major float32 lane。

expression 的七类形状由完整 Schema 展开：带 type 的 literal、ref、input/version、option/as/map、materialProperty/material、call/args、select/whenTrue/whenFalse。只允许公开输入与函数名/arity，见 [Catalog](./catalog#data-inputs)。ref 的依赖不能有环，类型/单位/空间与频率须兼容。generation/frame/view 不能低于依赖最低频率；隐式类型转换、矩阵逐分量乘与 matrixMultiply 不可混同。

所有分支和未消费变量先参与原始 AST、引用深度及预算校验，再做常量折叠。固定上限包含 256 variables、4096 AST nodes、64 AST/reference depth、128 custom bindings/command；加权 operations 为 generation 32768、frame/view 各 8192。materials 还限制 4096 definitions、32 properties、64 tags、1024 groups、4096 mappings。不能通过包配置放大宿主预算。

首版 onError 仅 useDefault，default 必须类型精确且有限。customBindings 的 symbol/variable 连接已有变量，required 缺省语义以 Loader 为准；required=false 只允许驱动优化掉声明，不允许类型错误、数组或跨 owner symbol/location 冲突。offline runtimeEvaluated=false 表示计划分析，不是求值结果。

当前固定 completion 注册 23 个 version 1 输入，旧指南列出的 11 个不是完整列表。逻辑 projection_matrix 与实际 render_projection_matrix 分开；previous_* 只来自同主 view 的成功提交。history_valid 不替代 GPU history 有效性；unavailable 与 available+invalid 不同。render delta 最大有效间隔 0.25 秒，需同时检查 valid；完整 temporal history 与该旧 delta 也不是同一合同。机器 temporal 文档保留早期 runtimeReady=false，而当前 completion/后续接入文档已记录 Provider，须按时间与证据域解释。

主 view 的 temporal extent 是物理像素，jitter 也以像素计，未 opt-in jitter 时偏移为零。position 使用 world blocks，矩阵源/目标空间逐项见 Catalog；辅助 camera、分屏和 VR 不借用主 view timeline。本参考不新增时序实机或性能验收。
