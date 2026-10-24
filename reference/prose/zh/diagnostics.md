## 行为与约束 {#behavior}

先看退出码，再看稳定 code、severity、family、evidence 与作者 provenance。修正首个有来源的错误后重新验证，避免把后续连锁错误逐一当成根因。warning 也需解释，例如 DLABI2005 的 disabled Terrain 可能隐藏世界内容；退出码 0 不等于无警告或完整画面。

原始诊断标题、原因与 shortest fix 从锁定工具输出保留，代码不翻译。下表是生成目录，不是本次触发了每一条诊断的声明。驱动、content snapshot 缺失时的 deferred/notProvided 不能自动改写成成功或错误。

## 结构化诊断形状 {#structured-diagnostic-shape}

JSON 结果保留 code/message/severity 与适用的 file、JSON pointer、Program、resource、identifier/version 等上下文。provenance 指向组合前作者文件，enginePath 可指向组合后的逻辑位置；两者不能混作同一个路径。旧 CLI/RPC 的具体 envelope 以其选择的合同版本为准。

DLMAN 是 Loader 配置域，DLABI 为 Scene/接口域，DLDATA 为材质/typed data 域，P9UI 为设置 UI 域，DLTOOL 为工具/文档合同域。schema 验证只覆盖结构，不能替代这些语义诊断。
