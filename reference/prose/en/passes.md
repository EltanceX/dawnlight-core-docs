## Behavior and constraints {#behavior}

Pass id/enabled identifies a declaration; enabledWhen constrains activity. stage selects exact template/version/target/phase. Legacy host combinations remain separately represented in compatibility structure; host and stage are not freely interchangeable or combinable. command_list executes commands in authored order. Across Passes, ordering.after/before/requires and accesses determine order.

inputs/outputs declare resource access and programs lists callable Programs. They do not replace command bindings or attachments. Ordering IDs must resolve; requires is more than a weak hint. Reject reversed phases, cycles, missing dependencies and hazards in the candidate graph. Use generated Catalog/token data for phase names rather than a permanent fixed count.

Services use id/version with required/optional mode. Conditions and unavailable=disablePass affect the active closure. Published dependencies and executable factories must both agree; metadata registration alone is not execution support. optional does not let an active command ignore a required feature.

Inspect declared/active nodes, command occurrences, accesses and dependencies with graph dump. Program-less clear/copy/historyCommit commands still contribute resource or lifecycle relations and must not disappear from Program-only analysis.
