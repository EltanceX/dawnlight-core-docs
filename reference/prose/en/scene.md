## Behavior and constraints {#behavior}

Scene ABI v2 explicitly routes four Terrain categories: opaque, alpha_tested, transparent and sorted_translucent. Exact category ID/version, target/phase and permitted modes come from the Catalog. Each category needs one valid owner. override selects an active pack-owned Stage and compatible sceneProvider; builtin materializes that category's recipe; disabled is allowed only by the category and may hide matching world content.

Provider v1/v2 is not an alias for the Scene ABI number. Select exact ID/version pairs and check category, vertexAbi, targetCapability, stateCapability, systemBindings and required/permittedServices. Terrain categories cannot exchange arbitrary Providers. Pack Programs use shaderRoot; fallback retains BuiltIn source ownership. Do not copy or redirect filenames to mix owners.

terrain_chunk uses stream 0 stride 20 and stream 1 stride 8. [Vertex metadata](./catalog#catalog-scenevertexabis) lists locations 0–7, offsets, types, integerInput, normalized and spaces. Identifier at location 3 is an integer input. Location 4 carries three unnormalized oct-normal bytes, not XYZ. Symbols, semantic comments, origin and matrix conventions must match the shader.

frameTarget owns the whole frame, including interactions with sky, models and later renderers. Four Terrain declarations do not prove complete scene coverage. Opaque depth clearing and color load follow this ABI. Fallback currently writes RT0 only, even with multiple named attachments. Teaching encodings are separate from host ABI; incomplete auxiliary surfaces are not a complete visible-surface G-buffer.

World positions use blocks. Raw Engine row-vector matrices uploaded to GLSL are consumed as Projection × View × world, without another transpose. OPENGL_POSITION_FIX adjusts clip z; sampled depth remains host [0,1], so reconstruction must not apply another 2d−1. Custom data documents logical/render projection, auxiliary-camera and VR limits.
