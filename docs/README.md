# Documentation map

Start a feature review with `node tooling/scripts/review-ledger.mjs lookup <scope>`
from the repository root, and read a scope's whole history with `show <scope>`.
The [review ledger](research/schema.md#review-history) owns the global queue:
`status` prints it. Each question has one scope file, for example
[Table](research/review-scopes/table.json),
[Suggestions](research/review-scopes/suggestions.json) and
[Comments](research/review-scopes/comments.json); its decisions, plans,
execution evidence, rejected alternatives and history stay where they are.

## Authority and history

[VISION.md](../VISION.md) and [scoped Vision](vision/) own durable product and
architecture law. Live source, public docs under [content/docs](../content/docs/),
and matching executable evidence establish implemented behavior. A design
decision selects a target; it does not establish adoption or passing proof.

The [research schema](research/schema.md) defines the storage and command
contract. Current conclusions live in [decision pages](research/decisions/).
Review pages under `docs/plans` carry each verdict in front matter, and the
[legacy records](research/review-records/) keep the reviews and executions
recorded before the front-matter cutover as history. `lookup` and `show` derive
the current state from both and from linked plans; do not maintain a second
status anywhere else.

A plan owns its lifecycle status. New associated plans declare `review_scopes`,
`review_basis`, and `work_kind`; cross-feature work names every affected scope.
Completing a design plan is not completing its implementation. A landed
implementation or workflow plan binds progress to the review its `review_basis`
names.
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
| analysis | Dated investigations the Refactoring playbook writes. Reuse their findings with their original scope and evidence limits. |
| [development](development/) | Contributor and agent-tooling notes; current agent rules live in [.agents](../.agents/). |
| [editor-audits](editor-audits/) | External-editor audit registry and durable report summaries, including source pins and rejected alternatives. An audit does not certify implementation. |
| [editor-behavior](editor-behavior/markdown-editing-spec.md) | The editor-behavior law in [markdown-editing-spec.md](editor-behavior/markdown-editing-spec.md) and its proof index in [current-evidence.md](editor-behavior/current-evidence.md), which maps spec families to their proof owners and lists the matrix-era evidence gaps. |
| [editor-benchmarks](editor-benchmarks/) | Earlier benchmark plans and scratch findings. Use `lookup <scope>` and bound receipts for current performance decisions. |
| [editor-issue-harvester](editor-issue-harvester/) | Source-specific issue/PR inventories, classifications, and refresh cursors. A cursor describes the recorded refresh, not live upstream state. |
| [editor-test-harvester](editor-test-harvester/) | Source-specific test inventories and portable behavior extraction. Reading or mapping an upstream test is distinct from executing it locally. |
| [maintainer](maintainer/) | Public-maintenance queues and dated run receipts; revalidate external state before acting. |
| [performance](performance/) | Benchmark contracts and historical narratives. Numbers belong to their captured workload, source, and machine. |
| [plans](plans/) | Dated execution/design plans and templates. Each plan owns one lifecycle status; scope associations connect it to review history. Raw `artifacts/` may be ignored or unavailable elsewhere. |
| [plite](plite/) | Mixed current runtime contracts, active research, historical migration plans, and proof inventories. Classify documents individually; the tree is not one archived or universally current authority. |
| [plite-draft](plite-draft/) | Prior rewrite drafts and their historical decisions. Their queue/status language is scoped to that draft program. |
| [research](research/schema.md) | Review scopes and queue, decisions, compiled source summaries, dated history and probes. Raw-source availability and evidence freshness remain separate. |
| [sync](sync/) | Dated upstream UI, doctrine, and source-sync provenance. Each receipt applies to its named source revision and destination. |
| [transplant](transplant/) | Preserved donor provenance, migration manifests, and deletion/readiness evidence. Not an instruction to restore retired APIs. |
| [vision](vision/) | Scoped durable law subordinate to [root Vision](../VISION.md), with its own doctrine history. |

Current documentation work follows [Plate Docs](../.agents/skills/plate-docs/SKILL.md).

## Evidence that survives another checkout

Keep historical paths and negative results. Link durable summaries rather than
making ignored artifacts the only account of a decision. The
[editor-audit index](editor-audits/index.json) points to versioned summaries for
its formerly artifact-only reports and preserves each original artifact path,
hash, source pins, and proof limits. The summaries preserve what was reported;
they do not re-run or upgrade its proof. Missing raw evidence stays explicit.

The Plate UI extraction receipt (`c70bacbd4a:docs/editor-audits/reports/2026-09-07-plate-ui-execution.md`)
also preserves the 46-family execution's final accounting and unclosed device,
service, and diagnostic limits. Its historical closure is evidence to reconcile
with later feature findings, not a blanket current-green flag.

## Retired and archived files

Retired stores (analysis, brainstorms, plite-browser, plite-issues, solutions, table and others), the legacy plans the review ledger does not index, raw source dumps and research runs from before 2026-09-23 left the repository on 2026-10-09. Their facts live in the homes under [research sources](research/sources/README.md). Each file still opens from git as `c70bacbd4a:<path>`, and a local copy with the same paths sits in `../plate-archive/` on the maintainer's machine, outside git, in case a search needs the originals.
