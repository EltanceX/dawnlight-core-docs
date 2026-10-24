## Behavior and constraints {#behavior}

The fallback definition must use shaderId 0; every other definition must use a nonzero shaderId. Every materialTable command consumer must be a readOnly storageBuffer attached to a Program. Even header-only uniformBuffer access is rejected; an additional valid SSBO cannot legalize an invalid UBO.

Manifest v5 only. materials declares abiVersion=1, properties, tags, definitions, contentGroups, mappings and fallback. A property's id/type/default/glsl defines layout, with range/unit/space for numeric contracts. Tag id/glsl names a 64-bit flag domain. Definition id differs from shaderId; values is keyed by declared property IDs and may reference compatible options. fallback must resolve to a valid definition.

logicalId identifies declared content, effectiveId/effectiveOwner its final replacement, and geometry/RenderIdentifier geometry. Material record index and author uint32 shaderId are two more domains. Never infer a species or dynamic BlockIndex from a legacy geometry number such as 2050. Aliases and replacement chains come only from the host's world snapshot.

Selector ids matches logical IDs/aliases; geometryIds/groups expands candidates; effectiveIds/owners constrains final identity. contentGroups has the same identity selectors plus its own group ID. Mappings uses match/material/priority/enabledWhen/onMissing. Equal highest-priority conflicts fail. onMissing is error, warnAndSkip or skip; unmatched content uses fallback. Without the same world's WorldFinal snapshot, mappingStatus stays deferred rather than inventing runtime slots.

materialTable buffer size comes from final layout. The header is 16 B, lookup starts at byte 16, and record offset depends on final identifier count. Each record has 16 B identity/tag data plus 16 B per property. Virtual /dawnlight/materials-v1.glsl supplies LookupMaterial, MaterialShaderId and MaterialHasTag, using the invocation's block name/binding. Use readonly/std430, high-precision uvec4 and flat highp uint identifiers; retain all 64 tag bits.

Definition/layout, world mapping and exact-word payload hashes identify different domains. Option/Mod changes require generation-specific resolution. Offline materials layout/explain does not prove actual SSBO consumption. W4's teaching material bytes are separate from this table ABI.
