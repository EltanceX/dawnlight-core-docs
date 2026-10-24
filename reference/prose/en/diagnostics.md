## Behavior and constraints {#behavior}

Read exit status, then stable code, severity, family, evidence and authored provenance. Fix the first sourced error and rerun before treating cascading failures as independent causes. Explain warnings too: DLABI2005 on disabled Terrain can hide world content. Exit 0 does not mean warning-free or visually complete.

Original diagnostic titles, causes and shortest fixes are retained from pinned tool output; codes are not translated. The generated directory does not claim every diagnostic was triggered in this run. Missing driver/content evidence remains deferred/notProvided rather than being rewritten as success or failure.

## Structured diagnostic shape {#structured-diagnostic-shape}

JSON results retain code/message/severity and applicable file, pointer, Program, resource and identifier/version context. Provenance can identify the pre-composition authored file while enginePath identifies the composed logical location. These are different paths. Legacy CLI/RPC envelopes follow the selected contract version.

DLMAN covers Loader configuration, DLABI Scene/interfaces, DLDATA materials/typed data, P9UI settings and DLTOOL tool/document contracts. Schema checks cover structure rather than these semantic diagnostics.
