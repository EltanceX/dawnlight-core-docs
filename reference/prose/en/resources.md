## Behavior and constraints {#behavior}

Ordinary buffers support only persistent lifetime here; usage is staticDraw / dynamicDraw / streamDraw. Content permits undefined, generated or service, plus v5 materialTable. Ordinary buffers reject asset/clear/external even though the general content Schema lists them. Active undefined-content readers still need a producer. Every materialTable consumer must be a read-only SSBO; UBO access is rejected in the [complete negative fixture](./examples#uniform-buffer).

Resource IDs resolve inside a candidate. kind is texture2D, textureCube or buffer. Texture size uses absolute width/height, viewport or output and the applicable scale; buffers use byteSize and usage instead of texture format/size. See [Catalog](./catalog#catalog-resourceformats) for color/depth formats, versions and bytesPerPixel. Capacity estimates exclude driver overhead.

lifetime is persistent, frame, transient, history or external. History uses kind/capacity or the applicable historyCapacity, with capacity at least 2. current/previous views and framesAgo must satisfy ring capacity and view contracts. historyCommit is a lifecycle event; frame-boundary advancement happens once and skipped producers do not fabricate new history. Resizing and generation/device invalidation cannot be repaired by reading stale slots.

content is undefined/external or an object selecting clear, asset, generated or service; v5 adds materialTable. undefined does not guarantee zero initialization. clear value shape must match the resource. Asset path and six cube faces are alternatives; encoding is image/raw, with additional format/size restrictions. Generated generator/version and service/version require an active Service with matching content-provider support. A Catalog ID does not instantiate arbitrary C# code. materialTable requires a supported buffer and computes its capacity from the final layout instead of an authored byteSize.

Omitted sampling retains nearest filtering, repeat wrapping and one mip. Explicit filters, wraps and mipLevels still need resource, format and uploader support; decoded image size must match the declaration. [Comparison sampling](./bindings) has a separate strict combination contract.

Preparation is transactional: active closure → candidate resources/views/FBOs → allocator clear/asset → Service creation/initialization → generated/service content → Program validation → whole-generation publication. Rollback stops Services in reverse order before releasing resources. A candidate cannot borrow partial allocations from the live generation.
