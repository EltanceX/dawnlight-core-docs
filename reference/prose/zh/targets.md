## 行为与约束 {#behavior}

targets.colors 的 location/resource/view/framesAgo 描述颜色附件，depth 描述深度附件。两者均声明 loadOp/storeOp，clearValue 仅按相应清理合同使用。location 是 fragment output location，不是纹理 binding slot。所有附件尺寸和格式需支持同一目标；颜色不能挂深度格式，深度不能挂颜色格式。

load 保留已有值，clear 写 clearValue，dontCare 不保证初值；store 保留后续消费值，dontCare 不应被后续读者依赖。只在整个有效区域确实被覆盖时使用 dontCare。不要同一绘制采样与写入同一图像；附件存在也不表示当前 draw 已启用输出。

drawBuffers 是 command-local 的活动输出布局，需匹配 shader 的 fragment outputs 以及目标 location。每目标 blendTargets 与布局有独立规则。state 的 blend/depth/rasterizer 使用生成闭集，inherit 不等于所有 Provider 都接受省略；Scene Provider 可以要求显式状态，具体限制见 Catalog.sceneDrawProviders。

viewport 的 target/frame、恢复与 scissor 同步控制执行区域。frameTarget 表示整帧颜色/深度所有权，不是 Terrain 专属 MRT。课程 04 保持 frameTarget 为 RT0+depth，Scene named topology 为三颜色附件，opaque 激活 0/1/2，而 BuiltIn fallback 仅激活 RT0。
