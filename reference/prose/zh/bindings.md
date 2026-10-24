## 行为与约束 {#behavior}

完整例子按类别登记于[参考索引](./examples)。uniformBuffer 在本锁定示例集合中没有正向运行证据；单独提供 [UBO/materialTable 完整反例](./examples#uniform-buffer)，验证 DLMAT1002 的组合限制。不能把这一反例标成可用预设，也不能从 UBO token 推断材质表允许 UBO 读取。

资源 binding 的 kind/symbol/binding/resource 指明 GLSL 接口与资源槽。sampler2D、samplerCube、sampler2DShadow 对应纹理 unit；image2D 对应 image unit；uniformBuffer/storageBuffer 使用各自 block binding 命名空间。image2D 与 storageBuffer 必须声明 access；不把 access 套到普通 sampler/UBO。数组、类型、slot 上限与实际驱动接口仍需检查。

view/framesAgo 选择 direct、history 或 Service view；previous 需要合法帧距与 fallback 合同。symbol 在同一调用内不得与资源、semantic、Scene system binding、custom binding 冲突。semantics 用 semantic/version 连接公开数值，Scene 用 contract/version/frequency 连接系统值，customBindings 用 variable/required 连接 typed data；三者的数据所有权不同，不能互相重新赋义。

Scene frequency 为 frame/view/batch/draw，必须匹配 Catalog。纹理或 block 的 binding 按 slotKind 需要填写，普通数值不会因随意写 slot 而变成纹理。完整类型、源/目标空间和 required 元数据见 [Catalog](./catalog#catalog-scenesystembindings)。

v5 的 sampler2DShadow 比较合同 v1：comparison.version=1、compare=lessEqual、filter=nearest/linear，固定 clampToEdge 和 mip 0。只接受 direct、persistent 的 depth texture2D，实际分配支持 D24/UInt 或 D32F/Float；拒绝 color/cube/history/fallback/Service view。uniform 必须活跃、标量、类型精确，长度 1 数组也拒绝。raw 与 compare 读取同一图时用不同 symbol/unit；它们与 Scene texture 共享纹理 unit 域。

比较采样仅在具备 ComparisonSampling 执行能力的 graphics 边界使用（command-list graphics 与 manifest fullscreen host）；compute 和不支持的旧 host 拒绝。sampler object 属于候选，失败/退出后恢复绑定；device 恢复需重建 generation。结构接受不替代驱动限制与 FBO 检查。
