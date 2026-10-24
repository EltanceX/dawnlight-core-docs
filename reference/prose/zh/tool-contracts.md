## 行为与约束 {#behavior}

固定工具是 docs-tools-f8aaa5c4-w1.1。显式 CLI 把选定 JSON/text 写 stdout，诊断写 stderr；退出码 0 为命令成功，1 为合同/业务失败，2 为用法错误。没有显式子命令时是 Content-Length framed JSON-RPC 2.0 stdio，不是逐行 JSON。

| 操作 | 合同与证据 |
| --- | --- |
| catalog list --contract 2 --format json | Catalog v2，不能把 host 标签当 release 身份 |
| pack validate PACK --format json | 生产 Loader 语义，仍不编译驱动 |
| scene explain PACK --include-inactive --format json | Scene explain v1，区分声明、活动路由与 source owner |
| graph dump PACK --contract 2 --include-inactive | graph v2；v5 IR v7，节点保留活动性与 provenance |
| program interface PACK --program ID --contract 2 | v5 data interface 合同；静态接口而非实际驱动 |
| program interface PACK --program ID --driver-report FILE | 默认 Scene 合同 1，适用于 W4 Scene 驱动报告 |
| driver-report inspect FILE --pack-root PACK | 核对报告身份与包，不能只看 report 文件存在 |
| materials explain/layout PACK | 无 WorldFinal 时 mapping deferred |
| data explain/graph/interface PACK | offline runtimeEvaluated=false；按支持合同处理 data driver report |
| schema export/verify --manifest-version 5 --output DIR | v5 bundle/request/index/completion v2 |

RPC initialize 不提供版本列表时保留 protocol 1 默认；v3 才公布新增 data methods、Program interface [1,2] 和 Schema bundle [1,2]。协商 unsupported-only 时 selectedVersion=null、compatible=false，不把最高版本偷偷当作共同支持。Manifest、Analyzer protocol、Catalog、Scene ABI、graph IR 与报告 contract 都有各自版本号。

跨检查需绑定 manifest/source/include、options/capabilities、Catalog、内容快照、generation/device 和 report hash。W4 Scene 报告不能交给 --contract 2 的 data 报告读取器。release publish 使用独立 acceptance ledger，要求完整证据与性能门；本参考或静态样例不构成正式 v5 发布授权。原始 v5 指南 DLTOOL2001 与独立网站变体的通过仍分别保留。
