## 行为与约束 {#behavior}

| 表面 | v3 | v4 | v5 |
| --- | --- | --- | --- |
| 传统资源/Program/命令与 source composition v1 | 支持适用组合 | 支持 | 支持 |
| 显式 Scene category 与 sceneBindings | 不接受这些新增字段 | Scene ABI v2 | Scene ABI v2 |
| materials/customData/customBindings/materialTable | 不支持 | 不支持 | ABI v1 |
| sampler2DShadow comparison v1 | 不支持 | 不支持 | 仅支持的 graphics 边界 |
| 主线 Schema bundle / completion | legacy v1 | legacy v1 | v2 |
| 主教程地位 | 兼容资料 | 兼容资料 | 主线 |

数字 3/4/5 是 Manifest 领域版本，不是光影包作者 version，也不等于 Scene ABI、Provider 或工具协议版本。不要向 v3/v4 配置粘贴 v5 字段；升级先选择新 Schema，再迁移显式 route、资源与调用所有权，重跑 Loader/graph/interface 和需要的运行验证。

下面独立生成 v3/v4 的完整结构定义，保留同名对象在版本间的真实差异。v3 Schema 中存在某些共享定义，不表示其 manifest/command 入口可引用它们；能否到达及版本门要看完整根与条件规则。

固定 Catalog.supportedFormats.manifest 保留 [3,4] 历史投影，v5 Schema、Loader 和已验证课程仍明确接受 v5。旧指南“11 个输入”和 temporal 早期 runtimeReady=false 同样保留历史身份；当前 23 项注册、后续接入与实际运行证据另行解释。兼容表不将这些资料整批改名为新发布状态。
