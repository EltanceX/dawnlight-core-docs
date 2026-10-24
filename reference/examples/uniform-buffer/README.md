# Rejected UBO/materialTable combination / UBO 与 materialTable 完整反例

Complete website-authored negative fixture for host f8aaa5c4, Manifest v5 and Materials ABI v1.
Do not install this as a working preset. Run pack validate, then scene explain or graph dump.
The structural Loader check passes; semantic resolution rejects the UBO with DLMAT1002.

完整网站自有反例，不能作为可用预设安装。先运行 pack validate，再运行 scene explain 或 graph dump。
结构 Loader 检查通过；语义解析以 DLMAT1002 拒绝 materialTable 的 UBO 绑定。

The present shader reads the first 16 bytes of a CPU-initialized materialTable buffer as a std140 highp uvec4.
Even reading only the header as UBO is forbidden: every materialTable consumer must be a readOnly storageBuffer binding.
The additional valid SSBO binding does not make the UBO binding legal.
This fixture deliberately retains complete GLSL so a partial file cannot hide the unsupported combination.

最终 present 着色器以 std140 highp uvec4 读取 CPU 初始化的 materialTable 前 16 字节。
只读取 header 也不允许：materialTable 的每个消费者都必须是 readOnly storageBuffer。
另一个合法 SSBO 绑定不能让 UBO 变合法。本反例保留完整 GLSL，避免局部文件隐藏非法组合。

Ordinary buffers reject asset/clear content and undefined buffers require a producer.
This companion uses the v5 materialTable initializer rather than inventing another public initializer or a uniform-barrier token.
Source and fresh-ZIP receipts assert the same rejection. This is not positive UBO runtime evidence.

普通 buffer 不支持 asset/clear，undefined buffer 需要生产者。本例使用 v5 materialTable 初始化，不新增公开初始化器或屏障 token。
源码与全新 ZIP 的收据核对同一拒绝；本记录不提供 UBO 正向运行证据。
