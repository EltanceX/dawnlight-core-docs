## Behavior and constraints {#behavior}

A single-file root supplies id, name, version, optional author/description and options/resources/programs/passes. The namespaced id is an author identity, the directory names an external source selection and version is author text; these are different domains. shaderRoot defaults to shaders. Files and includes freeze within their source owner. settings is a pack-relative JSON path resolved separately from shaderRoot.

A composition root declares both sourceFormatVersion=1 and an explicit fragments array. Metadata, settings, frameTarget, sceneAbiVersion and expectedCatalogSha256 belong to the root. Definition arrays and sceneCategories belong to fragments; v5 also permits materials/customData. materialsFragment requires abiVersion, while the composed materials object still needs its complete fallback/definitions contract. Fragments cannot recursively include fragments. The older v3-only composition guide is not the v5 field whitelist.

Reject absolute paths, drive names, empty/dot/parent segments, self-inclusion, normalized duplicates, directories and links escaping the pack. Preserve fragment order and each definition array's local order. Resolve references after composition, including forward references; duplicate IDs are errors rather than replacements. Any file failure rejects the whole candidate. Diagnostics retain authored filenames and local pointers.

The Loader permits comments and trailing commas but rejects duplicate keys, unknown fields and invalid combinations. Editor Schema validation cannot replace it. The canonical manifest hash excludes physical filenames, fragment boundaries, whitespace and comments while retaining logical declarations and array order. ZIP, source inventory, UI, generation and driver hashes identify other domains. expectedCatalogSha256 checks Catalog identity; it does not approve a release.

v4/v5 use explicit Scene ABI versions and routes for ownership. [Compatibility](./manifest-versions) documents v3's legacy behavior separately.
