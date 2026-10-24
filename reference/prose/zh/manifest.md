## 行为与约束 {#behavior}

单文件根提供包的 id、name、version、可选 author/description，以及 options/resources/programs/passes。id 是 namespaced 作者身份，目录名是外置来源选择器，version 是作者版本文本；三者不互换。shaderRoot 缺省为 shaders，文件和 include 冻结在对应 source owner 内。settings 是包内 JSON 路径，与 shaderRoot 分开解析。

组合根同时声明 sourceFormatVersion=1 与显式 fragments 数组。元数据、settings、frameTarget、sceneAbiVersion 和 expectedCatalogSha256 属于根；options/resources/programs/passes/sceneCategories 属于 fragment，v5 还允许 materials/customData。materialsFragment 只要求 abiVersion，但合成后的完整 materials 仍须满足 fallback/definitions 等要求。fragment 不递归包含其他 fragment。不要直接套用只描述 v3 的旧组合指南白名单。

路径拒绝绝对路径、盘符、空段、点/双点、自引用、重复规范化路径、目录和逃出包根的链接。fragments 按声明顺序、数组按各文件内部顺序合并；引用在合并后解析，可前向引用，ID 冲突不会被“后写覆盖”。任一文件失败，整个候选失败；诊断保留作者文件与局部 pointer。

Loader 允许 JSON 注释和尾逗号，但拒绝重复键、未知字段与非法组合。编辑器 Schema 不能替代 Loader。canonical manifest hash 排除物理文件名、fragment 边界、空白和注释，保留逻辑声明及数组顺序；它与 ZIP、源码清单、UI、generation 和驱动报告哈希各有身份域。expectedCatalogSha256 只核对对应 Catalog 身份，不是 release approval。

v4/v5 通过 Scene ABI 版本与路由声明决定场景所有权。v3 的传统隐式行为单列在[兼容页](./manifest-versions)，不得补写成 v5 默认。
