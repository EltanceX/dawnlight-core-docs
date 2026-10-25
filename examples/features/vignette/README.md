# Feature · Vignette / 独立效果 · 暗角

Standalone Manifest v5 / Scene ABI v2 pack for host f8aaa5c4218f54536ccf994a2d512aed2e3678b7.

Extract directly to shaderpacks/w7-vignette/shaderpack.json. In a creative world use /switchshader w7-vignette; /switchshader builtin restores BuiltIn. Press U → Options → Effect practice, toggle the effect and apply. Switching to the same pack reloads it.

practice:grade defaults true; false removes the post texture and effect Program/command. practice:strength is a 0–1 Program define (default 0.65). No extra Mod, data, history or private API is required. All four Terrain routes use BuiltIn.

This operates on the existing RGBA8 scene image. It does not add HDR, a physical camera, geometry edges or full scene coverage guarantees. Luminance outlines can mark texture detail and miss equal-luminance silhouettes.

Full instructions and cost model: https://core.eltancex.top/recipes/vignette

Validate with the pinned Analyzer; scene/program interface use option overrides and graph branches require JSON-RPC dawnlight/dumpGraph inputs.options. Static receipts do not prove device behavior. Runtime evidence on the website is bound to exact source bytes.

Website-authored source: https://github.com/EltanceX/dawnlight-core-docs/tree/main/examples/features/vignette
Public host: https://gitea.com/EltanceX/DawnlightCore
