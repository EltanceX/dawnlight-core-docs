## Behavior and constraints {#behavior}

| Surface | v3 | v4 | v5 |
| --- | --- | --- | --- |
| Legacy resources/Programs/commands and composition v1 | Applicable combinations | Supported | Supported |
| Explicit Scene categories and sceneBindings | New fields rejected | Scene ABI v2 | Scene ABI v2 |
| materials/customData/customBindings/materialTable | Unsupported | Unsupported | ABI v1 |
| sampler2DShadow comparison v1 | Unsupported | Unsupported | Supported graphics boundaries only |
| Main Schema bundle / completion | Legacy v1 | Legacy v1 | v2 |
| Tutorial role | Compatibility | Compatibility | Primary |

Manifest 3/4/5 differs from author version text, Scene ABI, Provider and protocol versions. Do not paste v5 fields into v3/v4. Select the new Schema, migrate explicit routes and invocation/resource ownership, then rerun Loader/graph/interface and required runtime checks.

The following independently generated v3/v4 definitions retain actual version differences. A shared definition in v3 does not imply that its manifest/command entry can reference it; inspect root reachability and conditional rules.

Pinned Catalog.supportedFormats.manifest retains historical [3,4], while the v5 Schema, Loader and tested course explicitly accept v5. The older guide's 11 inputs and early temporal runtimeReady=false likewise retain their historical identities. Current registration of 23 inputs, later integration and actual runtime observations are separate facts rather than a blanket new release claim.
