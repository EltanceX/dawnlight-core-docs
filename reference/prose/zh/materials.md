## 行为与约束 {#behavior}

fallback 对应 definition 的 shaderId 必须为 0，其他 definition 的 shaderId 必须非零。materialTable 的所有命令消费者必须是指定 Program 的 readOnly storageBuffer；即使只读 header，也不允许 uniformBuffer。额外声明一条合法 SSBO 不会使非法 UBO 合法。

仅 Manifest v5。materials 声明 abiVersion=1、properties、tags、definitions、contentGroups、mappings、fallback。property 的 id/type/default/glsl 定义布局，range/unit/space 补充数值合同；tag 的 id/glsl 决定 64-bit 标志域。definition 的 id 与 shaderId 是不同身份，values 以已声明 property ID 为键，可引用兼容 option。fallback 必须指向合法定义。

logicalId 是内容声明，effectiveId/effectiveOwner 是最终覆盖者，geometry/RenderIdentifier 是几何身份，材质 record index 和作者 uint32 shaderId 又是两个域。不得从 2050 一类旧几何数字反推树种或动态 BlockIndex。aliases/replacement chain 只来自宿主世界快照。

selector 的 ids 选择 logical ID/alias，geometryIds/groups 扩展候选，effectiveIds/owners 再约束最终身份；contentGroups 自身也有 ids/effectiveIds/geometryIds/groups/owners。mappings 使用 match/material/priority/enabledWhen/onMissing，同级最高 priority 冲突应失败；onMissing 为 error、warnAndSkip、skip，未匹配内容走 fallback。没有同世界 WorldFinal 快照时 mappingStatus=deferred，不能假装已经解析运行时槽位。

materialTable buffer 从最终布局算大小。头部 16 B，lookup 从 byte 16 开始，record 起点取决于最终 identifier count；每条 record 有 16 B 身份/tag 区，每个 property 另占 16 B。宿主虚拟 include /dawnlight/materials-v1.glsl 提供 LookupMaterial、MaterialShaderId、MaterialHasTag；block 名和 binding 来自当前 invocation。使用 readonly/std430、高精度 uvec4，identifier varying 用 flat highp uint，tag 保留完整 64 bits。

definitions/layout hash、mapping hash 和 payload hash 分别描述定义/ABI、当前世界映射和精确 words，不能互换。option 或 Mod 内容改变需重新解析对应 generation。离线 materials layout/explain 不证明 SSBO 已被真实驱动消费；W4 的教学材质字节也不是本 ABI 的材质表。
