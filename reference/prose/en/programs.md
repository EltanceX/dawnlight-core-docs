## Behavior and constraints {#behavior}

graphics supplies vertex/fragment; compute supplies compute. Stage files cannot be mixed. Pass programs and command program reference the ID, and invocation Programs must be visible to their Pass. Sources, includes, defines, option/capability inputs and compile context form a frozen closure. Files edited later cannot mutate a queued candidate.

compileMode is legacyCustom, officialCompatible or manifestDriven. Check the resolved host/Program context for defaults and restrictions; an accepted token does not imply support on every host. officialCompatible follows published host vertex/macro conventions, including Terrain semantic comments and OPENGL_POSITION_FIX. Pack includes cannot cross into the BuiltIn owner. The materials virtual include is an explicit ABI entry, not arbitrary built-in file access.

defines accepts fixed values or option/capability maps; variants supplies IDs and define sets. Mapping and null behavior follow Schema/resolver rules without executing author code. Uniforms, blocks, vertex inputs and fragment outputs must agree with bindings, sceneBindings, targets and drawBuffers.

Program bindings/targets/drawBuffers/state/engineDrawState describe their supported invocation boundary. Check command-owned invocation metadata in the resolved result; duplicated declarations do not imply automatic merging of every owner. Static reflection may lack compilation context. A frozen source closure alone does not prove driver compilation or an executable generation.
