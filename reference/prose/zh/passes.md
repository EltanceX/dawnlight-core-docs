## 行为与约束 {#behavior}

Pass 的 id/enabled 标识声明，enabledWhen 控制条件。stage 使用精确 template/version/target/phase；传统 host 入口的可接受组合在兼容结构中单列，不把 host 与 stage 随意同时使用。主线 command_list 按 commands 的作者顺序执行，跨 Pass 顺序由 ordering.after/before/requires 和访问关系解析。

inputs/outputs 是资源访问合同，programs 是本 Pass 可调用 Program 集合；它们不替代命令绑定和附件。ordering 的 ID 必须可解析，requires 不是弱排序提示。反向 phase、循环、未满足依赖与读写 hazard 应在候选图拒绝。phase 名称以生成 Catalog/token 表为准，不宣称永远固定数量。

Services 使用 id/version，可声明 required/optional，条件与 unavailable=disablePass 影响活动闭包。所需 Service 的依赖要由固定 Catalog 和真实工厂共同满足；元数据登记不等于可执行 provider。optional 不是允许一个活动 command 无视缺失的必需功能。

通过 graph dump 查看声明与活动节点、command occurrence、访问和依赖。Program-less 的 clear/copy/historyCommit 仍参与相应资源或生命周期关系，不应被只遍历 Program 的分析遗漏。
