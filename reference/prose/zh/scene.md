## 行为与约束 {#behavior}

主线 Scene ABI v2 为四类 Terrain 显式声明 route：opaque、alpha_tested、transparent、sorted_translucent。category 的精确 id/version、target/phase 和允许 mode 见 Catalog；每类必须有唯一合法归属。override 指向活动 pack-owned Stage 与兼容 sceneProvider，builtin 物化该类别的内置 recipe，disabled 仅在类别允许时可用，并可能让相应世界内容不可见。

Provider v1/v2 不是 Scene ABI 数字的简单别名；选择完整 id/version 对，并核对其 category、vertexAbi、targetCapability、stateCapability、systemBindings、required/permittedServices。四类不能因为同属 Terrain 而共用任意 provider。包自有 Program 使用 shaderRoot，内置 fallback 保持 BuiltIn source owner；不能复制或重定向文件名来混合两个 owner。

公开 terrain_chunk 顶点是 stream 0 stride 20、stream 1 stride 8，location 0～7 的类型、offset、integerInput、normalized 与 coordinateSpace 见 [顶点表](./catalog#catalog-scenevertexabis)。location 3 的 identifier 为整数输入；location 4 是未归一化的 oct 编码三字节，不是 XYZ 法线。符号、语义注释、origin 与矩阵约定必须与实际 shader 一致。

frameTarget 拥有整帧目标，所以天空、模型与后续世界输出仍需考察；声明四条 Terrain 不构成所有场景 renderer 已验证。opaque 深度清理和颜色 load 遵循当前 ABI，内置 fallback 当前只写 RT0，即便 named topology 有多附件。材质/法线教学编码与宿主正式 ABI 分开；覆盖不足的辅助图不能称作完整可见表面 G-buffer。

世界位置单位为 blocks。Engine 行向量矩阵原始数据上传后，GLSL 使用 Projection × View × world，不再次手工转置。OPENGL_POSITION_FIX 调整 clip z；采样深度仍保留 host 的 [0,1]，重建时不能再做 2d−1。时序 view 的逻辑/实际投影、辅助 camera 和 VR 边界见 Custom data 的时序说明。
