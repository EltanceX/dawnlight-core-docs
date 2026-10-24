## Using this reference {#behavior}

This reference targets host f8aaa5c4: Manifest v5, Scene ABI v2 and Materials / Custom Data ABI v1. Structural tables come from pinned Schemas; behavior was reviewed against the Loader, public contracts and examples. Schema checks, offline semantics, driver compilation, game images and performance are separate evidence. These pages retain W4's limited runtime scope.

| Task | Reference |
| --- | --- |
| Root fields, paths, composition and identity | [Manifest](./manifest) |
| Option types and active closure | [Options](./options) |
| Textures, buffers, content and history | [Resources](./resources) |
| GLSL, compile modes and defines | [Programs](./programs) |
| Hosts, Stages, ordering and Services | [Passes](./passes) |
| Seven execution commands | [Commands](./commands) |
| Attachments, drawBuffers and state | [Targets](./targets) |
| Resource bindings, semantics and comparison sampling | [Bindings](./bindings) |
| Terrain, vertices and frameTarget | [Scene ABI](./scene) |
| Content identity and material tables | [Materials](./materials) |
| Typed expressions, inputs and uploads | [Custom data](./custom-data) |
| Menus, translations and option coverage | [Settings UI](./settings-ui) |
| Public ID/version pairs, spaces and budgets | [Catalog](./catalog) |
| Diagnostics, CLI, protocols and identity | [Diagnostics](./diagnostics) / [Tool contracts](./tool-contracts) |
| Separate v3/v4 structures and version gates | [Compatibility](./manifest-versions) |
| Complete upstream source inventories | [Examples](./examples) |

The coverage inventory assigns every Schema property occurrence and all seven settings-UI Loader whitelist objects to a page. It proves structural coverage; field counts do not prove behavioral completeness. Unowned definitions and stale inputs fail generation checks.
