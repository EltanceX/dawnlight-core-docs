## Behavior and constraints {#behavior}

An option's id/type/default/impact is authoritative; name/description are presentation. Types are boolean, integer, number and string. Defaults and overrides must match the type and satisfy min/max or allowed. A JSON boolean is not an integer; string enum values are case-sensitive. See the full Schema for valid range/allowed combinations. An omitted bound is not zero.

impact is uniform, program, pipeline or resources and declares the invalidation domain. It does not guarantee that a change can always avoid compilation: data, defines, resources and active branches still need validation. UI cannot redefine the type, hard bounds, default or impact.

Pass enabled is explicit. enabledWhen and binding/semantic/service conditions reference an option with equals or oneOf. Values must satisfy the referenced option's type and bounds; condition arrays jointly constrain activity. Settings UI has a separate equals/notEquals/in contract.

Analyze the same options/capabilities intended for runtime. After disabling a Pass, inspect the active Program, Resource, Service and ordering closure. A declared node retained in a graph does not prove allocation. Invalid conditions and dependencies fail loading/resolution rather than being hidden by execution-time skipping.
