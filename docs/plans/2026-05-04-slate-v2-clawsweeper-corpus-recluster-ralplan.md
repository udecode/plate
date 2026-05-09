---
date: 2026-05-04
topic: slate-v2-clawsweeper-corpus-recluster-ralplan
status: ready-for-user-review
skill: slate-ralplan
execution_skill: clawsweeper
source:
  - docs/slate-issues/gitcrawl-rebuild-report.md
  - docs/slate-issues/gitcrawl-live-open-ledger.md
  - docs/slate-issues/gitcrawl-clusters.md
  - docs/slate-v2/ledgers/fork-issue-dossier.md
---

# Slate v2 ClawSweeper Corpus Recluster Ralplan

## Verdict

Run ClawSweeper on the full live issue corpus, but do not brute-force `630`
issues one by one.

The best shape is:

```txt
refresh gitcrawl mirror
+ rebuild machine clusters
+ create a human architecture cluster overlay
+ process clusters by value/risk
+ append one fork-local dossier section per reviewed issue
+ sync only exact claims into PR docs
```

Machine clusters are candidate discovery. Human architecture clusters are the
truth we use for Slate v2 planning.

## Intent And Boundary

- intent: convert live Slate issue history into fork-local v2 issue accounting
  without commenting on upstream issues.
- desired outcome: every important live issue family has a reviewed
  ClawSweeper decision, and every reviewed issue has a section in
  `docs/slate-v2/ledgers/fork-issue-dossier.md`.
- in scope: live gitcrawl mirror, live open issue ledger, gitcrawl cluster
  rebuild, human re-clustering, fork issue dossier, PR issue claim references.
- non-goals: no upstream GitHub comments, labels, closes, or `Fixes #...`
  claims without exact repro proof.
- decision boundary: ClawSweeper may classify, re-cluster, and document. It may
  not turn architecture pressure into exact closure.

## Current Corpus Facts

From `docs/slate-issues/gitcrawl-rebuild-report.md`:

| Fact                               | Value |
| ---------------------------------- | ----: |
| Live open issues                   |   630 |
| Live open PRs included in gitcrawl |    29 |
| Live open threads total            |   659 |
| Hydrated comments/reviews          |  1856 |
| Gitcrawl clusters                  |   617 |
| Multi-member gitcrawl clusters     |    28 |
| Singleton clusters                 |   589 |

The current fork dossier has `10` issue sections. That means the next work is
not “finish the document polish.” The next work is the corpus pipeline.

## Decision Brief

Principles:

- Use live open issues as current truth.
- Ignore old v2 ledger notes as evidence unless the user explicitly names them.
- Treat gitcrawl clusters as discovery, not final taxonomy.
- Route issues by raw Slate architecture owner, not product wishlists.
- Write fork-local issue sections instead of upstream comments.

Decision drivers:

- `589 / 617` gitcrawl clusters are singletons, so machine clustering alone is
  too conservative.
- Live gitcrawl output is enough to rebuild the corpus; the old v2 ledger does
  not need to participate in the pass.
- The fork needs a full PR/audit story, not official upstream issue actions.

Chosen option:

- Re-cluster into human architecture families on top of gitcrawl output, then
  process by family and issue confidence.

Rejected options:

- Brute-force every issue in order: too slow and produces noisy prose.
- Trust only gitcrawl clusters: misses singleton families and splits one
  architecture pressure across many singletons.
- Require non-live legacy evidence for every row: stale overhead; it slows the
  live corpus pass without improving current truth.
- Write upstream comments: wrong for a fork.

## Re-Clustering Strategy

Use three layers.

### Layer 1: Fresh machine corpus

Refresh and rebuild:

```bash
GITHUB_TOKEN="$(gh auth token)" gitcrawl refresh ianstormtaylor/slate --include-comments --state open --json
gitcrawl cluster ianstormtaylor/slate --threshold 0.80 --min-size 1 --max-cluster-size 40 --k 16 --cross-kind-threshold 0.93 --json
gitcrawl clusters ianstormtaylor/slate --json
```

Store outputs under `tmp/gitcrawl/` with timestamped filenames and summarize
them into `docs/slate-issues/gitcrawl-rebuild-report.md`.

Use `gitcrawl clusters` and `cluster-detail` for multi-member clusters. Use
`gitcrawl neighbors` and `gitcrawl search` for singleton expansion.

### Layer 2: Human architecture families

Create/update:

```txt
docs/slate-issues/gitcrawl-recluster-map.md
```

Each human family must have:

- family id
- architecture owner bucket
- source gitcrawl cluster ids
- singleton issue refs pulled in by search/neighbors
- direct PR-linked refs
- decision: `keep`, `docs`, `stale`, `pr-only`, `split`, or `needs-repro`
- why it is one family
- why excluded neighbors are not in the family

Start from these known families:

- DOM point/path/selection crashes
- Android/mobile IME and beforeinput
- inline/void boundary selection
- history and undo selection state
- React external-store/focus/subscription runtime
- decoration/projection/caret jumps
- clipboard/HTML/fragment serialization
- large-document performance and virtualization tradeoffs
- docs/examples/support noise
- stale browser-support rows

### Layer 3: ClawSweeper issue sections

Append reviewed issues to:

```txt
docs/slate-v2/ledgers/fork-issue-dossier.md
```

Use one section per issue with the ClawSweeper shape:

```txt
Status
Bucket
Confidence
Issue summary
Evidence
Decision
PR-description text
```

Do not duplicate the long form in `pr-description.md`.

## Batch Order

### Batch 0: Rebuild and sanity check

Goal:

- prove the live mirror is fresh
- regenerate machine clusters
- record drift from the last report

Outputs:

- refreshed `tmp/gitcrawl/*`
- updated `docs/slate-issues/gitcrawl-rebuild-report.md`
- updated `docs/slate-issues/gitcrawl-clusters.md`
- new/updated `docs/slate-issues/gitcrawl-recluster-map.md`

Gate:

- counts reconcile: live issues, open PRs, total threads, cluster count,
  singleton count, multi-member count.

### Batch 1: High-signal multi-member clusters

Process `keep` clusters before singleton noise:

- cluster 1: DOM point resolution crashes
- cluster 5: inline boundary cursor movement
- cluster 6: history set_selection errors
- cluster 7: ReactEditor focus after programmatic change
- cluster 9: Android mark-toggle keyboard dismissal
- cluster 10: async decoration caret jump
- cluster 11: Android empty-node voice input duplication
- cluster 12: mobile inline void selection keyboard
- cluster 13: Android IME empty-node composition
- cluster 14: refocus autoscroll

For each cluster:

- run `gitcrawl cluster-detail`
- run `gitcrawl neighbors` on representative and suspicious members
- split mixed rows
- append issue dossier sections
- sync ledger status only when the claim changes

### Batch 2: Finish weak and split clusters

Immediate target:

- finish cluster 3 by triaging `#3777`

Then process:

- weak clusters where one machine family hides multiple runtime owners
- PR-linked clusters where the PR may change claim posture
- docs/stale clusters that should be excluded with reasons

Gate:

- no machine cluster marked `keep` remains unreviewed or unassigned to a human
  family.

### Batch 3: Singleton expansion by architecture family

Because `589` singleton clusters exist, search by human family, not by issue
number.

Use this loop:

```bash
gitcrawl search ianstormtaylor/slate --query "<family phrase>" --mode hybrid --limit 50 --json
gitcrawl search issues "<family phrase>" -R ianstormtaylor/slate --state open --json number,title,state,url,updatedAt,labels --limit 50
gitcrawl neighbors ianstormtaylor/slate --number <representative> --limit 20 --json
```

Suggested family phrases:

- `Cannot resolve a Slate point from DOM point`
- `Cannot resolve a Slate node from DOM node`
- `Android composition beforeinput`
- `Samsung keyboard Firefox Android`
- `inline void selection keyboard`
- `placeholder composition`
- `ReactEditor focus parent state`
- `useSelected stale path`
- `decorate async caret jump`
- `history set_selection undo`
- `copy paste inline void`
- `large document paste cut performance`

Gate:

- every high-signal singleton either joins a human family, becomes
  `needs-repro`, or is explicitly skipped with a reason.

### Batch 4: Docs/examples/stale/noise sweep

Goal:

- remove noise from core architecture accounting
- keep useful docs/example gaps separate

Outputs:

- dossier sections only for rows that need future PR explanation
- ledger updates for triage-closed/stale/docs outcomes when needed

Gate:

- docs/example/support rows do not pollute raw Slate runtime plans.

### Batch 5: Exact claim audit

Goal:

- verify whether any reviewed issue deserves `fixes-claimed`
- keep every other issue as `improves-claimed`, `cluster-synced`,
  `issue-reviewed`, `not-claimed`, `triage-closed`, or `needs-repro`

Rules:

- exact closure requires exact repro proof
- mobile/IME claims require device/browser proof matching the report
- performance claims require benchmark evidence
- DOM selection claims require browser proof, not only unit tests

Outputs:

- updated `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- updated `docs/slate-v2/references/pr-description.md`
- updated `docs/slate-v2/ledgers/fork-issue-dossier.md`

## Confidence Score

| Dimension                          | Score | Evidence                                                                                 |
| ---------------------------------- | ----: | ---------------------------------------------------------------------------------------- |
| React/runtime performance          |  0.92 | cluster order prioritizes React focus/subscription/runtime families and performance rows |
| Slate-close unopinionated DX       |  0.94 | keeps docs/product/ecosystem rows out of raw Slate claims                                |
| Plate/slate-yjs migration backbone |  0.88 | uses architecture buckets but does not yet run downstream-specific migration proof       |
| Regression-proof testing           |  0.90 | exact claims require unit/browser/device/benchmark proof by issue type                   |
| Research/evidence completeness     |  0.94 | live gitcrawl, fork dossier, and current v2 proof refs are required                      |
| Simplicity/composability           |  0.92 | one dossier, one recluster map, no upstream comment machinery                            |

Total: `0.92`

Verdict: ready for user review. Execution should start with Batch 0, then Batch

1.

## Required Outputs

- `docs/slate-issues/gitcrawl-rebuild-report.md`
- `docs/slate-issues/gitcrawl-clusters.md`
- `docs/slate-issues/gitcrawl-recluster-map.md`
- `docs/slate-issues/gitcrawl-live-open-ledger.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/references/pr-description.md`
- session completion file under `tmp/completion-checks/`

## Completion Gates

The corpus/re-clustering lane is complete only when:

- fresh gitcrawl refresh and cluster outputs are recorded
- every `keep` multi-member cluster has a human-family decision
- every weak cluster is split or marked `needs-human`
- every PR-linked issue cluster is reviewed
- high-signal singleton searches are processed by architecture family
- every reviewed issue has a fork dossier section
- every exact `Fixes #...` claim has matching proof
- `pr-description.md` includes only short claim/count summaries
- no upstream GitHub issue comment, label, or close was made
- `bun run completion-check` passes with this lane marked `done`

## Next Ralph Owner

Start with Batch 0:

```txt
current_pass: clawsweeper-recluster-batch-0
current_pass_skill: .agents/skills/clawsweeper/SKILL.md
current_pass_owner: docs/slate-issues + docs/slate-v2/ledgers
current_pass_scope: refresh gitcrawl, rebuild clusters, create recluster map skeleton
```

Then move to Batch 1 high-signal multi-member clusters.

## Execution Ledger

| Time                 | Pass                           | Status      | Evidence                                                                                                                                  | Next owner                                  |
| -------------------- | ------------------------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 2026-05-04T14:53:01Z | clawsweeper-recluster-batch-0  | in_progress | `tmp/continue.md` refreshed; completion state set to `pending` for Batch 0 gitcrawl corpus work.                                          | Run gitcrawl doctor/refresh/cluster         |
| 2026-05-04T15:00:00Z | clawsweeper-recluster-batch-0  | complete    | Live refresh synced `659` threads; cluster output reconciled to `617` clusters, `28` multi-member clusters, and `589` singleton clusters. | Batch 1: high-signal multi-member clusters  |
| 2026-05-04T15:08:00Z | clawsweeper-recluster-batch-1  | in_progress | Cluster 1 reviewed; dossier sections appended for #4564, #3723, #4789, #3836, #5711, #3834, and #4984 with no exact closure claims.       | Continue Batch 1 with cluster 5             |
| 2026-05-04T15:14:00Z | clawsweeper-recluster-batch-1  | in_progress | Cluster 5 reviewed; dossier sections appended for #4074, #4618, and #3429 with no exact closure claims.                                   | Continue Batch 1 with cluster 6             |
| 2026-05-04T15:20:00Z | clawsweeper-recluster-batch-1  | in_progress | Cluster 6 reviewed; dossier sections appended for #3705, #3756, and #3921 with no exact closure claims.                                   | Continue Batch 1 with cluster 7             |
| 2026-05-04T15:26:00Z | clawsweeper-recluster-batch-1  | in_progress | Cluster 7 reviewed; dossier sections appended for #3634, #5537, and #4961 with no exact closure claims.                                   | Continue Batch 1 with cluster 9             |
| 2026-05-04T15:32:00Z | clawsweeper-recluster-batch-1  | complete    | Clusters 9, 10, 11, 12, 13, and 14 reviewed; Android/IME, decoration, inline void, and refocus-scroll PR-linked clusters classified.      | Batch 2: mixed and browser selection splits |
| 2026-05-04T15:32:00Z | clawsweeper-recluster-batch-2  | complete    | Clusters 3, 19, 20, 22, and 23 reviewed; #3777 routed to input runtime, browser/mobile selection clusters split with no exact claims.     | Batch 3: singleton search expansion         |
| 2026-05-04T15:45:00Z | clawsweeper-multicluster-sweep | complete    | Remaining multi-member clusters 2, 4, 8, 15, 16, 17, 18, 21, 24, 25, 26, 27, and 28 reviewed; all 28 have human-family decisions.         | Batch 3: singleton candidate decisions      |
| 2026-05-04T15:50:00Z | clawsweeper-recluster-batch-3  | complete    | 34 high-signal singleton candidates reviewed, routed by architecture family, and recorded in dossier/matrix with no new exact fixes.      | Batch 4/5: docs-noise and claim audit       |
| 2026-05-04T15:50:00Z | clawsweeper-recluster-batch-5  | complete    | Docs/stale/noise sweep and exact-claim audit complete; fixed claims remain #6013, #5605, and #5709 only.                                  | Completion-check                            |
