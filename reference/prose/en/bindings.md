## Behavior and constraints {#behavior}

[Registered examples](./examples) identify each binding category. This pinned set has no positive uniformBuffer runtime evidence. The separate [complete UBO/materialTable negative fixture](./examples#uniform-buffer) verifies DLMAT1002's combination restriction. It is not a working preset; the UBO token does not allow material tables to be read as UBOs.

Resource kind/symbol/binding/resource selects a GLSL interface and resource slot. sampler2D, samplerCube and sampler2DShadow use texture units; image2D uses image units; uniformBuffer/storageBuffer use their block-binding namespaces. image2D and storageBuffer require access; ordinary samplers/UBOs do not accept it. Arrays, types, device slot limits and actual driver interfaces still need validation.

view/framesAgo selects direct, history or Service views, with valid distance and fallback contracts for previous history. Symbols must not collide across resource, semantic, Scene and custom binding owners. semantics connects semantic/version; Scene uses contract/version/frequency; customBindings connects variable/required to typed data. These owners cannot redefine one another's values.

Scene frequency is frame/view/batch/draw and must match the Catalog. Texture/block slots follow slotKind; adding a slot to a numeric value does not make it a texture. See [Catalog](./catalog#catalog-scenesystembindings) for types, source/target spaces and required metadata.

v5 sampler2DShadow comparison v1 uses version=1, compare=lessEqual and nearest/linear filter, with clampToEdge and mip 0. It accepts only direct persistent depth texture2D backed by D24/UInt or D32F/Float. Color, cube, history, fallback and Service views are rejected. The uniform must be active, scalar and exactly typed; even length-one arrays fail. Raw/compare consumers of the same image use distinct symbols/units and share the texture-unit namespace with Scene textures.

Comparison requires a graphics boundary with ComparisonSampling support: command-list graphics or the manifest fullscreen host. Compute and unsupported legacy hosts reject it. Sampler objects belong to the candidate; bindings restore on exit/failure, and device recovery rebuilds the generation. Structural acceptance does not replace driver-limit or FBO checks.
