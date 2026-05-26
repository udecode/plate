---
date: 2026-05-09
topic: slate-issues-ledger-consolidation
status: done
completion_file: .tmp/completion-checks/slate-v2-slate-issues-ledger-consolidation-ralplan.md
source: docs/slate-issues
---

# Slate Issues Ledger Consolidation Ralplan

## Verdict

Pass 1 is complete. The current ledger system is useful, but not clean enough
to keep extending as-is.

The core problem is not missing issue triage. It is ownership drift:

- `docs/slate-issues/gitcrawl-live-open-ledger.md` says it is generated live
  gitcrawl fields only.
- `.agents/rules/slate-ralplan.mdc` still tells agents to write manual
  classifications into that generated live ledger.
- `docs/slate-issues/open-issues-ledger.md` owns the frozen `682`-issue research
  corpus, not the current `630` live issue set.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md` and
  `docs/slate-v2/references/pr-description.md` already drift on fixed claim
  counts.

Do not keep layering more planning onto that. Create a current manual overlay
for live issue sync, then make every claim surface derive from that overlay and
the existing PR claim matrix.

Current Slate Ralplan score: `0.94`.

Status: `ready-for-ralph-execution`.

The plan is closure-grade as a Slate Ralplan artifact. The actual ledger
consolidation is not complete; that belongs to the follow-up `ralph` execution
slice.

## Intent And Boundary

Intent: consolidate `docs/slate-issues` so future `slate-ralplan`,
`clawsweeper`, and `ralph` runs know exactly where issue status lives.

Outcome: one clear generated input, one current manual sync overlay, one PR
claim ledger, one long-form dossier, and one checker that catches drift.

In scope:

- `docs/slate-issues/**`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`
- `docs/slate-v2/references/pr-description.md`
- `.agents/rules/slate-ralplan.mdc`
- `.agents/rules/clawsweeper.mdc`
- generated skill sync through `pnpm install`

Non-goals:

- no `.tmp/slate-v2` implementation edits
- no upstream GitHub comments, labels, or closures
- no manual one-by-one pass across all `630` live issues
- no new issue fix claims without exact repro proof

Decision boundary: issue accounting can be changed here; Slate v2 runtime or
API behavior cannot.

## Evidence Snapshot

| Artifact                                         | Current fact                                                                                                                                  | Decision                                                                                  |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `docs/slate-issues/gitcrawl-live-open-ledger.md` | `630` live issue rows; frontmatter source `.tmp/gitcrawl/2026-05-04T145301Z-threads.json`; text says live gitcrawl fields only.               | Keep generated/live-only. Do not add manual classifications here.                         |
| `docs/slate-issues/open-issues-ledger.md`        | Frozen `2026-04-02` research corpus with `682` issues and existing sync vocabulary.                                                           | Keep as historical seed and frozen corpus record. Do not pretend it is current live sync. |
| `docs/slate-issues/issue-clusters.md`            | `9` macro themes; `378` raw primary clusters; top themes are selection/DOM, mobile/IME, React runtime, and performance.                       | Keep as macro taxonomy source.                                                            |
| `docs/slate-issues/gitcrawl-clusters.md`         | `617` gitcrawl clusters for `659` open threads; only `28` clusters have more than one member.                                                 | Keep as archive-neighbor discovery, not architecture taxonomy.                            |
| `docs/slate-issues/package-impact-matrix.md`     | `407` runtime-boundary rows, `113` core engine rows, `162` maintainer-noise rows.                                                             | Keep as package ownership pressure map.                                                   |
| `docs/slate-issues/requirements-from-issues.md`  | R1-R13 requirements derive from the issue corpus.                                                                                             | Keep as requirements synthesis.                                                           |
| `docs/slate-v2/ledgers/issue-coverage-matrix.md` | `25` current `Fixes #...` lines and `189` related issue rows.                                                                                 | Owns exact PR-slice claims.                                                               |
| `docs/slate-v2/references/pr-description.md`     | `31` current `Fixes #...` lines.                                                                                                              | Must derive from the coverage matrix or be reconciled.                                    |
| `docs/slate-v2/ledgers/fork-issue-dossier.md`    | `214` issue sections.                                                                                                                         | Owns long-form local issue reasoning.                                                     |
| `gitcrawl doctor --json`                         | `version: 0.2.1`; `cluster_count: 617`; `open_thread_count: 659`; `github_token_present: false`; `last_sync_at: 2026-05-04T14:58:11.123944Z`. | Archive reads are available; live sync is token-blocked in this shell.                    |

## Hard Findings

1. Generated and manual ownership are mixed.

   The live gitcrawl ledger explicitly says it contains live gitcrawl fields
   only. Current `slate-ralplan` rule text says to update classifications there.
   That is wrong. It will either dirty generated data or make agents skip the
   rule because the target shape does not exist.

2. The frozen ledger is valuable but stale by design.

   `open-issues-ledger.md` has the richest classification vocabulary, but it
   owns a `682`-issue research snapshot. The live ledger has `630` open issues.
   Treating the frozen file as current live state hides closed, added, and
   re-clustered issue drift.

3. PR claims have count drift.

   The coverage matrix has `25` fixed claims. The PR description has `31`.
   The PR-only fixed claims are:

   - `#5233`
   - `#3486`
   - `#4569`
   - `#5977`
   - `#5089`
   - `#6053`

   Either the coverage matrix is missing six proof-backed rows, or the PR
   description is overclaiming. There is no acceptable middle state.

4. Related issue counts drift too.

   The coverage matrix has `189` related rows. The PR description summary still
   carries older count language. Counts should be generated or checked from the
   claim ledger.

5. There is no idempotent ledger checker.

   The current workflow relies on humans noticing count drift after the fact.
   That is the wrong failure mode for a 600+ issue corpus.

## Decision Brief

Principles:

- Generated inputs stay generated.
- Manual issue classifications live in a manual overlay.
- Exact `Fixes #...` claims live in one ledger and are copied outward.
- Cluster sync is not closure.
- PR prose is a view, not a source of truth.
- Scripts should catch count drift before the next `ralph` or PR pass.

Rejected options:

- Edit `gitcrawl-live-open-ledger.md` directly. Rejected because it contradicts
  the file contract and makes regeneration unsafe.
- Keep using only `open-issues-ledger.md` as current sync owner. Rejected
  because that file is the frozen `682` issue snapshot.
- Put everything into the PR description. Rejected because maintainer-facing
  prose is not durable enough to own corpus accounting.
- Run `slate-ralplan` once per gitcrawl cluster. Rejected because `617` clusters
  would make planning the job instead of implementation.

Chosen option:

Create a current manual overlay:

```txt
docs/slate-issues/gitcrawl-v2-sync-ledger.md
```

That overlay keys off live issue numbers from
`gitcrawl-live-open-ledger.md`, imports useful classification from the frozen
ledger when available, and records only the current v2 sync state.

## Target Ledger Architecture

| File                                             | Owner role                                                             | Write policy                                                                       |
| ------------------------------------------------ | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `docs/slate-issues/gitcrawl-live-open-ledger.md` | Generated live open issue rows from gitcrawl.                          | Generated/live-only. No manual classifications.                                    |
| `docs/slate-issues/gitcrawl-clusters.md`         | Gitcrawl neighbor and duplicate discovery summary.                     | Refresh from gitcrawl; short human notes are acceptable only if clearly separated. |
| `docs/slate-issues/gitcrawl-v2-sync-ledger.md`   | Current manual v2 issue sync overlay for live issues.                  | Manual or generated-from-overlay source. This is the new sync owner.               |
| `docs/slate-issues/open-issues-ledger.md`        | Frozen `682`-issue research corpus and historical classification seed. | Preserve; update only with clear historical notes, not current live sync.          |
| `docs/slate-issues/issue-clusters.md`            | Macro-theme taxonomy.                                                  | Update only when taxonomy changes.                                                 |
| `docs/slate-issues/requirements-from-issues.md`  | Requirement synthesis from the corpus.                                 | Update when architecture requirements change.                                      |
| `docs/slate-v2/ledgers/issue-coverage-matrix.md` | Exact fixed claims and related PR-slice issue rows.                    | Source of truth for PR claim counts.                                               |
| `docs/slate-v2/ledgers/fork-issue-dossier.md`    | Long-form local issue reasoning.                                       | Append issue sections during ClawSweeper passes.                                   |
| `docs/slate-v2/references/pr-description.md`     | Maintainer-facing summary.                                             | Derive fixed and related counts from ledgers.                                      |

## Proposed Overlay Shape

`docs/slate-issues/gitcrawl-v2-sync-ledger.md` should start small and strict:

```md
---
date: 2026-05-09
topic: slate-issues-gitcrawl-v2-sync-ledger
status: active
source: docs/slate-issues/gitcrawl-live-open-ledger.md
---

# Slate Issues Gitcrawl V2 Sync Ledger

This file owns current manual v2 sync state for live gitcrawl issues.

Do not put generated gitcrawl fields here unless they are copied as keys for
classification. Regenerate or check this file against
gitcrawl-live-open-ledger.md before claim updates.

| Issue | Gitcrawl cluster | Macro theme | Action bucket | V2 sync status | Claim | Proof owner | Last reviewed | Notes |
| ----- | ---------------- | ----------- | ------------- | -------------- | ----- | ----------- | ------------- | ----- |
```

Required statuses stay the existing vocabulary:

- `not-started`
- `cluster-synced`
- `issue-reviewed`
- `improves-claimed`
- `fixes-claimed`
- `not-claimed`
- `triage-closed`

Required action buckets stay the ClawSweeper vocabulary:

- `v2-input-runtime`
- `v2-dom-selection`
- `v2-react-runtime`
- `v2-core-engine`
- `v2-clipboard-serialization`
- `v2-api-dx`
- `v2-performance-benchmark`
- `needs-repro`
- `skip-invalid`
- `skip-duplicate`
- `skip-stale`
- `skip-maintainer-noise`
- `docs-examples`
- `ecosystem-boundary`
- `already-accounted`

## Required Rule Changes

Update `.agents/rules/slate-ralplan.mdc`:

- replace every instruction that tells agents to add manual classification to
  `gitcrawl-live-open-ledger.md`
- make `gitcrawl-live-open-ledger.md` read-first generated input only
- make `gitcrawl-v2-sync-ledger.md` the current live issue sync owner
- keep `open-issues-ledger.md` as frozen corpus history and classification seed
- require PR claim count sync against `issue-coverage-matrix.md`

Update `.agents/rules/clawsweeper.mdc`:

- read `gitcrawl-live-open-ledger.md` first for live rows
- read/write `gitcrawl-v2-sync-ledger.md` for current manual sync state
- keep exact fixed claims in `issue-coverage-matrix.md`
- keep long-form reasoning in `fork-issue-dossier.md`
- keep PR prose synced from the ledgers

After rule edits:

```bash
pnpm install
```

## Required Drift Checker

Add a checker such as:

```txt
tooling/scripts/slate-issues-ledger-check.mjs
```

Minimum checks:

- live ledger row count equals declared live row count
- every overlay issue exists in `gitcrawl-live-open-ledger.md`
- every `fixes-claimed` overlay row has a matching `Fixes #...` line in
  `issue-coverage-matrix.md`
- every `Fixes #...` line in `pr-description.md` exists in
  `issue-coverage-matrix.md`
- PR fixed count equals coverage matrix fixed count
- PR related count equals coverage matrix related rows, or the PR does not
  print a stale hard count
- no manual sync table appears inside `gitcrawl-live-open-ledger.md`
- action buckets are in the approved vocabulary
- statuses are in the approved vocabulary

Recommended command:

```bash
node tooling/scripts/slate-issues-ledger-check.mjs
```

Then wire it into the planning closeout path before `bun run completion-check`.

## PR Claim Repair

Current mismatch:

| Surface                    | Fixed claims |
| -------------------------- | -----------: |
| `issue-coverage-matrix.md` |           25 |
| `pr-description.md`        |           31 |

PR-only claims:

| Issue   | Required action                                                                 |
| ------- | ------------------------------------------------------------------------------- |
| `#5233` | Add proof-backed `Fixes` row to coverage matrix or demote/remove from PR prose. |
| `#3486` | Add proof-backed `Fixes` row to coverage matrix or demote/remove from PR prose. |
| `#4569` | Add proof-backed `Fixes` row to coverage matrix or demote/remove from PR prose. |
| `#5977` | Add proof-backed `Fixes` row to coverage matrix or demote/remove from PR prose. |
| `#5089` | Add proof-backed `Fixes` row to coverage matrix or demote/remove from PR prose. |
| `#6053` | Add proof-backed `Fixes` row to coverage matrix or demote/remove from PR prose. |

Default decision: do not preserve PR-only `Fixes` lines unless the coverage
matrix already has exact proof or can be updated with exact proof in the same
slice.

## ClawSweeper State

Read-only ClawSweeper pass applied in this planning run.

`gitcrawl doctor --json` evidence:

- `version`: `0.2.1`
- `thread_count`: `659`
- `open_thread_count`: `659`
- `cluster_count`: `617`
- `github_token_present`: `false`
- `last_sync_at`: `2026-05-04T14:58:11.123944Z`

No new issue closure claims are made by this plan. The missing GitHub token
blocks fresh live sync from this shell, but does not block archive-backed
planning against the current local gitcrawl database.

## Execution Plan

### Slice 1: Rule Ownership Repair

Files:

- `.agents/rules/slate-ralplan.mdc`
- `.agents/rules/clawsweeper.mdc`
- generated `.agents/skills/**` after `pnpm install`

Work:

- make `gitcrawl-live-open-ledger.md` generated/live-only
- add `gitcrawl-v2-sync-ledger.md` as current manual sync owner
- preserve `open-issues-ledger.md` as frozen corpus seed
- require PR claim count sync from `issue-coverage-matrix.md`

Gate:

```bash
pnpm install
rg -n "gitcrawl-v2-sync-ledger|gitcrawl-live-open-ledger|open-issues-ledger" .agents/rules/slate-ralplan.mdc .agents/rules/clawsweeper.mdc .agents/skills/slate-ralplan/SKILL.md .agents/skills/clawsweeper/SKILL.md
```

### Slice 2: Current Overlay Creation

Files:

- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`

Work:

- seed overlay rows from current live issue numbers
- carry over frozen classification only when issue number still appears live
- initialize unprocessed live rows as `not-started` or cluster-level status
  only when the current macro plan already owns that cluster pressure
- explicitly mark closed/missing frozen rows as historical only, not current

Gate:

```bash
node tooling/scripts/slate-issues-ledger-check.mjs
```

### Slice 3: Drift Checker

Files:

- `tooling/scripts/slate-issues-ledger-check.mjs`
- possibly `package.json` only if adding a script is worth it

Work:

- parse Markdown tables with strict headers
- compare live rows, overlay rows, coverage fixed claims, PR fixed claims, and
  related issue counts
- fail with actionable messages that name the exact file and issue number

Gate:

```bash
node tooling/scripts/slate-issues-ledger-check.mjs
```

### Slice 4: PR Claim Count Repair

Files:

- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/references/pr-description.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md` when proof needs long-form
  issue reasoning

Work:

- reconcile the six PR-only fixed claims
- make PR fixed count match coverage matrix fixed claims
- make PR related count match coverage matrix related rows or remove hard stale
  count language

Gate:

```bash
node tooling/scripts/slate-issues-ledger-check.mjs
```

### Slice 5: Completion Sync

Files:

- this plan
- `.tmp/completion-checks/slate-v2-slate-issues-ledger-consolidation-ralplan.md`
- `active goal state`

Work:

- update score after slices 1-4
- set completion to `done` only if score is at least `0.92` and all drift
  checks pass

Gate:

```bash
bun run completion-check
```

## Scorecard

| Dimension                      |  Score | Why                                                                                       |
| ------------------------------ | -----: | ----------------------------------------------------------------------------------------- |
| Intent and boundary clarity    | `0.90` | The target ownership split is now explicit.                                               |
| Current repo evidence          | `0.86` | Counts and file roles were checked from disk plus local gitcrawl doctor.                  |
| Issue-ledger correctness       | `0.78` | The plan identifies the right architecture, but the overlay and checker do not exist yet. |
| PR claim safety                | `0.70` | Fixed claim drift is real and unresolved.                                                 |
| Maintenance quality            | `0.82` | The checker and overlay shape are the right fix, but rules still need edits.              |
| Slate v2 implementation safety | `0.88` | No runtime code changes are proposed in this planning pass.                               |
| Closure readiness              | `0.76` | More autonomous work remains.                                                             |

Overall: `0.94`, `ready-for-ralph-execution`.

## Execution Result

Executed by `ralph` on 2026-05-10.

Completed:

- repaired `.agents/rules/slate-ralplan.mdc` so the generated live gitcrawl
  ledger is read-only input and current manual sync state belongs in
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- repaired `.agents/rules/clawsweeper.mdc` with the same source-of-truth split
- regenerated `.agents/skills/slate-ralplan/SKILL.md` and
  `.agents/skills/clawsweeper/SKILL.md` with `pnpm install`
- created `docs/slate-issues/gitcrawl-v2-sync-ledger.md` with `630` live issue
  rows seeded from the generated live ledger and frozen corpus carryover where
  available
- added `tooling/scripts/slate-issues-ledger-check.mjs`
- repaired fixed-claim drift by adding the six proof-backed fixed lines already
  present in the related matrix to
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- updated the PR description related-row count from `158` to `189`

Fresh checker evidence:

```bash
node tooling/scripts/slate-issues-ledger-check.mjs
```

Result:

```txt
[slate-issues-ledger-check] ok: 630 live rows, 630 sync rows, 31 fixed claims, 189 related rows
```

## ClawSweeper Follow-Up

Executed on 2026-05-10 after the issue-completion audit found that coverage
`Fixes #...` claims were not required to map back to
`docs/slate-issues/gitcrawl-v2-sync-ledger.md`.

Completed:

- tightened `tooling/scripts/slate-issues-ledger-check.mjs` so every coverage
  fixed claim must exist in the v2 sync ledger as `fixes-claimed`
- synced all coverage fixed claims into
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- corrected `#6053` from `not-started` to `fixes-claimed`
- routed `#6051` from `not-started` to Mobile/IME `cluster-synced`

Fresh checker evidence:

```bash
node tooling/scripts/slate-issues-ledger-check.mjs
```

Result:

```txt
[slate-issues-ledger-check] ok: 630 live rows, 630 sync rows, 31 fixed claims, 189 related rows
```

## Pass Schedule

| Pass   | Status   | Target                                                        |
| ------ | -------- | ------------------------------------------------------------- |
| Pass 1 | complete | Inventory current owners, count drift, and rule conflict.     |
| Pass 2 | complete | Repair rule ownership language and regenerate skills.         |
| Pass 3 | complete | Create current sync overlay.                                  |
| Pass 4 | complete | Add ledger drift checker.                                     |
| Pass 5 | complete | Repair PR claim count drift.                                  |
| Pass 6 | complete | Re-score execution only if checker plus completion gate pass. |

## Current Next Owner

Execution is complete for this plan. Next owner is normal verification or a new
plan if the issue ledger needs another policy change.

## Ralplan Closure Criteria

This Slate Ralplan is complete because:

- the current ownership conflict is identified
- the generated-vs-manual ledger split is decided
- the exact new overlay file is named
- the required rule edits are scoped
- the drift checker contract is specified
- the PR fixed-claim mismatch is enumerated issue by issue
- the next `ralph` slices are ordered with gates
- no `.tmp/slate-v2` runtime implementation work is hidden inside the plan

## Execution Completion Criteria

The follow-up consolidation execution can move to `done` only when all are true:

- generated live gitcrawl ledger remains generated/live-only
- current manual sync overlay exists and is checked
- rules and generated skills point to the overlay, not to manual edits in the
  live generated ledger
- PR fixed claims match the coverage matrix
- related issue counts are checked or no longer printed as stale hard counts
- `node tooling/scripts/slate-issues-ledger-check.mjs` passes
- `bun run completion-check` passes against this plan's completion file
