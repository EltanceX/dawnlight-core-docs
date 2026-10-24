## Behavior and constraints {#behavior}

The pinned tool is docs-tools-f8aaa5c4-w1.1. Explicit CLI writes selected JSON/text to stdout and diagnostics to stderr. Exit 0 means command success, 1 a contract/business failure and 2 invalid usage. Without an explicit command it is Content-Length-framed JSON-RPC 2.0 over stdio, not line-delimited JSON.

| Operation | Contract and evidence |
| --- | --- |
| catalog list --contract 2 --format json | Catalog v2; host labels are not release identity |
| pack validate PACK --format json | Production Loader semantics without driver compilation |
| scene explain PACK --include-inactive --format json | Scene explain v1, retaining declared/active routes and owners |
| graph dump PACK --contract 2 --include-inactive | Graph v2 and v5 IR v7, with activity/provenance |
| program interface PACK --program ID --contract 2 | v5 data-interface contract; static rather than actual driver evidence |
| program interface PACK --program ID --driver-report FILE | Default Scene contract 1, used with W4 Scene reports |
| driver-report inspect FILE --pack-root PACK | Verifies report/pack identity rather than mere file existence |
| materials explain/layout PACK | Mapping deferred without WorldFinal |
| data explain/graph/interface PACK | Offline runtimeEvaluated=false; supported data-report contract applies |
| schema export/verify --manifest-version 5 --output DIR | v5 bundle/request/index/completion v2 |

RPC initialization with no version list retains protocol 1. Protocol v3 advertises new data methods, Program interface [1,2] and Schema bundle [1,2]. Unsupported-only negotiation returns selectedVersion=null and compatible=false rather than silently claiming compatibility. Manifest, Analyzer protocol, Catalog, Scene ABI, graph IR and report contracts have distinct versions.

Cross-check manifest/source/include, options/capabilities, Catalog, content snapshot, generation/device and report identities. W4 Scene reports do not belong in the --contract 2 data-report reader. release publish requires its independent acceptance ledger, complete evidence and performance gate. Reference pages and static examples do not authorize a production v5 release. The original v5 guide's DLTOOL2001 failure remains separate from the website variant's success.
