## Behavior and constraints {#behavior}

targets.colors uses location/resource/view/framesAgo for color attachments; depth defines the depth attachment. Both declare loadOp/storeOp and use clearValue under the matching clear contract. location is a fragment output location, not a texture binding slot. Attachment dimensions and formats must form a supported target; color and depth formats cannot exchange roles.

load preserves contents, clear writes clearValue and dontCare leaves contents undefined. store retains values for later consumers; later readers cannot rely on dontCare. Use dontCare only when the valid area is fully overwritten. Do not sample and write the same image in a draw. An attached image does not imply an enabled output.

drawBuffers is command-local and must match fragment outputs and target locations. Per-target blendTargets has additional layout rules. blend/depth/rasterizer use generated closed tokens. inherit does not mean every Provider accepts omission: Scene Providers can require explicit state, as recorded in Catalog.sceneDrawProviders.

Viewport target/frame, restoration and scissor synchronization determine the execution region. frameTarget owns whole-frame color/depth rather than Terrain-only MRT. Chapter 04 keeps frameTarget at RT0+depth with three-color Scene topology, opaque outputs 0/1/2 and RT0-only BuiltIn fallback activity.
