# Reads API value review

Objective:
Decide whether the current read, snapshot and subscription architecture warrants
a change, and identify one next owner from source-backed alternatives.

Completion threshold:
Trace the canonical owners and materially different consumers, compare keeping,
changing, adding, deleting, moving and replacing their contracts, record one
Stop/Pursue/Defer verdict in the existing review ledger, and state the decisive
evidence, regression risks and proof limits.

Verification surface:
Plite read execution, state views, snapshot indexes, commit subscriptions, React
node selectors, and Plate facade consumers. Use focused existing proof or a
small diagnostic only when it can change the verdict. Source inspection cannot
establish performance or native parity.

Constraints:
Assessment and local review artifacts only. No product implementation, downstream
implementation plan, commit, push, PR, publication, or external message.
Keep unrelated checkout work. Branch: next.

Boundaries:
One reads question; transactions, runtime, React, and performance are inspected
only where their ownership or lifetime changes this verdict.

Blocked condition:
A missing decision-critical source or executable observation prevents choosing
a verdict. Continue independent investigation and name the exact gap.

Work Checklist:

- [x] Read prior queue/history, Task routing and current durable law.
- [x] Inspect owner, public contract, actual consumers and selected proof inputs.
- [x] State ideal behavior and hard laws before choosing current symbols.
- [x] Compare all material design lanes and maximum-value deletion alternatives.
- [x] Resolve scale applicability; keep unmeasured runtime targets provisional.
- [x] Record decisive observations, risks, source fingerprints and prior relation.
- [x] Persist immutable review, reconcile summary, render and check the ledger.
- [x] Verify the single next-owner invocation and complete the goal-plan audit.

Method obligations:
[Best API Review](../../.agents/skills/best-api-review/SKILL.md) owns verdict,
alternatives, cited evidence, prior relation and next owner.
[Plate routing](../../.agents/rules/task/references/best-api-review.md) owns
history, source inputs and ledger verification.
[Best API](../../.agents/skills/best-api/SKILL.md#two-pass-decision) owns ideal
call shapes, hard cuts and the executable scale gate.
[Plite Plan](../../.agents/skills/plite-plan/SKILL.md#ownership) supplies ownership
law without starting adoption.
[Task](../../.agents/rules/task/references/workflow.md) and
[Autogoal](../../.agents/skills/autogoal/references/method.md#checklist-retention)
own authority and closure. No Autoreview on next. Browser/release gates apply
only to corresponding claims; this review makes no such claim.

Throughput checkpoint:
N/A, read-only investigation. The competing probes use Show Me Your Work's
[decision trail](artifacts/reads-api-review/decisions.tsv). Rows were checked
against the actual command outputs and evidence; no independent panel was run.

Decisions:
The queue has no previous reads verdict. Related React and performance history
is context; its findings require current-source reconciliation. Initial bulk
output was oversized; further reads use exact files and bounded sections.

Verification evidence:
- `bun test ./packages/plitejs/test/read-view-lifecycle-contract.test.ts ./packages/plitejs/test/node-key-view-contract.test.ts`: 19 pass.
- `bun test ./packages/plitejs/test/read-middleware-contract.test.ts`: 10 pass.
  The original command also named a nonexistent commit test and Bun ignored
  that path; the real commit owner was located and run separately below.
- `bun test ./packages/plitejs/test/commit-metadata-contract.ts`: 21 pass.
- `pnpm --filter plitejs exec vitest run --config ./vitest.config.mjs test/react/node-selector-context-contract.test.tsx test/react/use-editor-runtime-state.test.tsx`: six pass.
- `bun --preload ./config/plite-source-aliases.ts docs/plans/artifacts/reads-api-review/path-membership-probe.mjs`: cached prototype passes exact parity, 70 guard-key observations, all work budgets and cached follow-up bounds.
- [Cached packet](artifacts/reads-api-review/path-membership-cached.json) source
  fingerprints match final source. The [direct packet](artifacts/reads-api-review/path-membership-direct.json)
  retains the rejected uncached comparator; its exact source is archived.
- [Immutable review](../research/review-records/2026-09-11-reads-demand-driven-invalidation.json)
  recorded; [current decision](../research/decisions/reads-demand-driven-invalidation.md)
  and generated ledger reconciled. Inventory inspection found no added/removed
  group IDs; refreshed observations do not promote unrelated review/proof state.
- `node tooling/scripts/review-ledger.mjs check`: pass, 789 groups, 3,631 files,
  61 scopes, 16 records. The first check caught concurrent browser-proof source
  drift; one sequential refresh/render/check passed.
- No changed product source, public API, registry output, release artifact or
  browser claim: product typecheck, source lint, barrels, registry generation,
  changeset and public-API doctrine regeneration are N/A for this assessment.

Open risks:
The isolated warm primary-root comparison does not prove the complete proposed
runtime. Cold/lazy indexes, named roots, all mutation kinds, mounted sparse/dense
dispatch, DOM path bindings, retained memory and native ordering need adoption
proof. The generic-selector rewrite remains deferred. Concurrent source edits
may later stale this dated review; no whole-checkout or release claim is made.

Next action:
Hand off Pursue to the verified `.agents/skills/plite-plan/SKILL.md` owner:
`$plite-plan make commit invalidation queries demand-driven across changed.hasNodeKey, React selector dispatch and DOM path bindings; use docs/research/decisions/reads-demand-driven-invalidation.md`.
The review is complete; downstream execution is outside this request.

Architecture probe contract:
Use Benchmark's embedded probe method, scoped to path membership after a
structural insertion. Current: one canonical commit membership check builds the
aggregate path set. Disposable target: compare the requested key's before/after
paths at the same canonical snapshot owner. No new store or public noun.
Document cohorts: 32, 1,024, and 8,192 paragraphs; listener cohorts: 0, 1, 32,
and every paragraph. Also test unchanged, inserted, removed, moved and absent
keys on small fixtures. Both arms use the same source, frozen snapshots, key
identities and operation. Indexes are materialized before comparison so this
probe isolates membership/dispatch work, not cold index construction.
Budget frozen before results: exact boolean parity; target at most two index
queries per watched key and no entries/keyAt traversal; at least 90% fewer index
queries for one listener at 1,024 and 8,192 paragraphs. Dense cohorts must retain
linear query counts. Collect five alternating samples, report raw milliseconds
and median only; a speed claim requires both 20% and 0.1 ms median improvement.
Timing near that threshold is inconclusive. First evaluation and cached follow-up
are separate. This unlocks only the isolated membership direction; cold indexes,
multiple roots, React DOM ordering and end-to-end route latency remain unproved.

Probe checkpoint:
The direct prototype passes boolean parity and cuts one-query index work from
32,788 calls to two at 8,192 paragraphs. It loses cached follow-up work: the
dense repeated read was 1.308 ms versus 0.173 ms. Preserve this packet in
`artifacts/reads-api-review/path-membership-direct.json`; do not promote that
uncached algorithm. Its exact source is retained in `path-membership-direct.mjs`
(originally run as `path-membership-probe.mjs`). The first console result was
truncated, so it was rerun once to retain the complete packet.

Revised probe contract, frozen before second result:
Cache each queried boolean inside the disposable commit reader; no parallel
change owner. Keep all previous cohorts and first-read budgets. Require zero
index calls on repeated reads and no dense follow-up regression greater than
both 20% and 0.1 ms. The implementation owner would put this cache on the
canonical commit's changed queries, alongside their existing immutable caches.
