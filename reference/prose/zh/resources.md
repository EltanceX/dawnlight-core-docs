## 行为与约束 {#behavior}

普通 buffer 在此基线只支持 persistent，usage 为 staticDraw / dynamicDraw / streamDraw；content 只接受 undefined、generated 或 service，v5 另有 materialTable。asset/clear/external 不能用于普通 buffer，即使通用 Schema 的 content 分支包含它们。undefined 的活动读者仍需要生产者。materialTable 的每个消费者必须是只读 SSBO，不能作为 UBO，详见[完整反例](./examples#uniform-buffer)。

资源 id 在候选内解析。kind 为 texture2D、textureCube 或 buffer。纹理 size 使用 absolute 的 width/height、viewport 或 output 及适用 scale；buffer 使用 byteSize 和 usage，不套用纹理 format/size。颜色/深度格式、bytesPerPixel 与版本见 [Catalog](./catalog#catalog-resourceformats)；容量估算不含驱动开销。

lifetime 为 persistent、frame、transient、history、external。history 可用对象 kind/capacity 或适用的 historyCapacity，容量至少 2；环槽的 current/previous 和 framesAgo 需满足容量及 view 合同。historyCommit 是提交事件；帧边界推进一次，禁用 producer 不伪造新历史。resize、generation/device 等失效不能靠采样旧槽恢复。

content 可为 undefined/external，或 clear、asset、generated、service；v5 增加 materialTable。undefined 不保证初值为零。clear 的 value 形状须匹配资源；asset 的 path 与 cube 六面 faces 二选一，encoding 为 image/raw，实际格式和尺寸还受 Loader/初始化器约束。generated 的 generator/version、service 的 service/version 必须与活动 Service 的内容提供能力一致；仅写一个 Catalog ID 不会创建任意 C# 工厂。materialTable 只能用于支持的 buffer，容量由最终布局计算，不手填 byteSize。

未声明 sampling 时保留 nearest、repeat、单 mip 默认。显式 minFilter/magFilter、wrapS/wrapT、mipLevels 仍需资源类型、格式及实际上传支持；image asset 的解码尺寸必须与声明一致。comparison sampling 另有[严格组合](./bindings)，不会改写纹理采样合同。

事务顺序是活动闭包 → 分配候选资源/view/FBO → allocator clear/asset → 创建和初始化 Services → generated/service content → Program 验证 → 整体发布。回滚先反序退出 Services 再释放候选资源；不能从旧活动 generation 借一半资源来补齐候选。
