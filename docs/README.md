# Documentation map

Start a feature review with its generated [feature hub](research/features/) or
`node tooling/scripts/review-ledger.mjs lookup <scope>` from the repository root.
The [review ledger](research/reviews.md) owns the global queue and overview.
For example, [Table](research/features/table.md),
[Suggestions](research/features/suggestions.md), and
[Comments](research/features/comments.md) collect their decisions, plans,
execution evidence, rejected alternatives, and history without moving them.

## Authority and history

[VISION.md](../VISION.md) and [scoped Vision](vision/) own durable product and
architecture law. Live source, public docs under [content/docs](../content/docs/),
and matching executable evidence establish implemented behavior. A design
decision selects a target; it does not establish adoption or passing proof.

The [research schema](research/schema.md) defines the storage and command
contract. Current conclusions live in [decision pages](research/decisions/).
[Review and execution records](research/review-records/) are immutable: later
records retain, reopen, or supersede specific conclusions without rewriting
the original evidence. Generated hubs summarize these records and linked plans;
do not maintain a second status in a hub.

A plan owns its lifecycle status. New associated plans declare `review_scopes`,
`review_basis`, and `work_kind`; cross-feature work names every affected scope.
Completing a design plan is not completing its implementation. Execution
outcomes bind progress to the governing review, plan fingerprint, and proof.
Missing receipts, changed inputs, and an unreconciled decision summary remain
visible gaps. Historical “complete” or “verified” wording alone is unbound
evidence, not a current verification claim.

Before repeated work, read the current conclusion, material rejected options,
and execution since that review. Reopen only the question affected by a changed
requirement, contradictory evidence, source change, or materially better
argument. A newer paint finding does not silently reopen table topology.
Filename matches are search candidates until their contents are classified.

## Folder roles

| Folder | Role and authority |
| --- | --- |
| [analysis](analysis/) | Dated investigations and comparison reports. Reuse their findings with their original scope and evidence limits. |
| [brainstorms](brainstorms/) | Options and exploratory designs. Proposal wording is not adoption authority. |
| [development](development/) | Contributor and agent-tooling notes; current agent rules live in [.agents](../.agents/). |
| [editor-audits](editor-audits/) | External-editor audit registry and durable report summaries, including source pins and rejected alternatives. An audit does not certify implementation. |
| [editor-behavior](editor-behavior/README.md) | Behavior specifications and protocol history. [Current evidence](editor-behavior/current-evidence.md) identifies active proof owners; dated parity matrices retain their original limits. |
| [editor-benchmarks](editor-benchmarks/) | Earlier benchmark plans and scratch findings. Use a scope hub and bound receipts for current performance decisions. |
| [editor-issue-harvester](editor-issue-harvester/) | Source-specific issue/PR inventories, classifications, and refresh cursors. A cursor describes the recorded refresh, not live upstream state. |
| [editor-test-harvester](editor-test-harvester/) | Source-specific test inventories and portable behavior extraction. Reading or mapping an upstream test is distinct from executing it locally. |
| [maintainer](maintainer/) | Public-maintenance queues, standing orders, and dated run receipts; revalidate external state before acting. |
| [performance](performance/README.md) | Benchmark contracts and historical narratives. Numbers belong to their captured workload, source, and machine. |
| [plans](plans/) | Dated execution/design plans and templates. Each plan owns one lifecycle status; scope associations connect it to review history. Raw `artifacts/` may be ignored or unavailable elsewhere. |
| [plite](plite/overview.md) | Mixed current runtime contracts, active research, historical migration plans, and proof inventories. Classify documents individually; the tree is not one archived or universally current authority. |
| [plite-browser](plite-browser/overview.md) | Historical browser-proof design and comparisons. Current commands and proof selection belong to the live verification workflow. |
| [plite-draft](plite-draft/overview.md) | Prior rewrite drafts and their historical decisions. Their queue/status language is scoped to that draft program. |
| [plite-issues](plite-issues/) | Issue dossiers, source inventories, and extracted test shards. These preserve investigation context; inspect their dates and linked disposition before treating work as open. |
| [research](research/README.md) | Feature entrypoints, global review queue, current decisions, immutable review/execution history, compiled concepts and source summaries. Raw-source availability and evidence freshness remain separate. |
| [solutions](solutions/) | Reusable lessons and diagnosed failure patterns by category. Consult the relevant lesson before reopening the same mechanism; it does not override current law or proof. |
| [sync](sync/) | Dated upstream UI, doctrine, and source-sync provenance. Each receipt applies to its named source revision and destination. |
| [table](table/) | Historical table benchmark snapshots; the [Table hub](research/features/table.md) owns navigation to current decisions and evidence. |
| [transplant](transplant/) | Preserved donor provenance, migration manifests, and deletion/readiness evidence. Not an instruction to restore retired APIs. |
| [vision](vision/) | Scoped durable law subordinate to [root Vision](../VISION.md), with its own doctrine history. |

[docs-api.md](docs-api.md) is an unversioned API-doc migration prompt, not the
current public-doc style contract. Current documentation work follows
[Plate Docs](../.agents/skills/plate-docs/SKILL.md).

## Evidence that survives another checkout

Keep historical paths and negative results. Link durable summaries rather than
making ignored artifacts the only account of a decision. The
[editor-audit index](editor-audits/index.json) points to versioned summaries for
its formerly artifact-only reports and preserves each original artifact path,
hash, source pins, and proof limits. The summaries preserve what was reported;
they do not re-run or upgrade its proof. Missing raw evidence stays explicit.

The [Plate UI extraction receipt](editor-audits/reports/2026-09-07-plate-ui-execution.md)
also preserves the 46-family execution's final accounting and unclosed device,
service, and diagnostic limits. Its historical closure is evidence to reconcile
with later feature findings, not a blanket current-green flag.
