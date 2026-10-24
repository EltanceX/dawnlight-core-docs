## 行为与约束 {#behavior}

以下集合来自固定 Catalog v2 和 v5 completion，完整元数据保留依赖、频率、空间、格式和目标/状态限制。ID/version 必须精确匹配；字段存在或注册成功不能证明有运行时 Provider、设备支持或已经在游戏执行。空缺单位/空间保留空缺，不从名称猜测。

stageTemplates 描述创建入口，services 描述可信资源/生命周期能力，semantics 描述 uniform 数值，engineDrawProviders 描述宿主绘制，capabilities 提供构建捕获值。scene* 集合共同冻结类别、Provider、顶点、系统绑定和 fallback；同 ID 不同版本分别保留。

Catalog.hash、sceneAbiHash、dataAbiHash 是不同投影身份。supportedFormats.manifest 的历史值 [3,4] 不能覆盖已验证的 v5 Schema/Loader 事实；本页原样保留导出内容并在兼容页解释。数据输入以 completion.dataAbiCatalog 的 23 项为准，函数 arity 与预算也从同一输入生成。

元数据仅导出公开合同，不包含宿主回调、私有方法、shader 源码或原生对象。包可选择已发布能力，不能在 JSON 中新增 Service、任意调用 C# 或扩大 GL 上限。
