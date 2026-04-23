---
date: 2026-04-18
topic: slate-v2-lossless-remaining-work-replan
status: completed
---

# Goal

Replan the remaining `slate-v2` work around the most lossless path.

The working intent is:

- do not start a broad `slate` rewrite just because tranche 3 says `slate`
- preserve live behavior and public contract width wherever possible
- cut only tests or proof lanes that are no longer relevant to a live owned
  surface
- keep anything uncertain in a named lane instead of silently deleting it

# Sources To Re-read

- `docs/slate-v2-draft/commands/replan-remaining-work.md`
- `.omx/specs/deep-interview-slate-v2-true-slate-rc-roadmap.md`
- `docs/slate-v2/master-roadmap.md`
- `docs/slate-v2/release-readiness-decision.md`
- `docs/slate-v2/release-file-review-ledger.md`
- `docs/slate-v2/true-slate-rc-proof-ledger.md`
- `docs/slate-v2/references/pr-description.md`
- `docs/plans/2026-04-13-slate-v2-full-no-regression-story-plan.md`
- `docs/plans/2026-04-13-slate-v2-exhaustive-api-contract-recovery-plan.md`

# Questions To Settle

1. What is actually still blocking release-readiness after the Bun/TS6 and
   `slate-browser` batches?
2. Which remaining rows are:
   - required for lossless truth
   - safe to cut
   - safe to defer as named `post RC`
3. How much `slate` package work is still mandatory before any test cuts become
   honest?

# Working Hypothesis

- the old remaining-work story is too rewrite-first
- the next honest batch is probably a classification pass, not broad source
  recovery
- any lane that still protects public contract width or live proof ownership
  should stay open
- “non relevant test anymore” must be proven per test family, not used as a
  blanket excuse to delete pain

# Findings

## 1. The live roadmap regressed to a broader rewrite-first story

Current live docs say tranche 3 is broad `slate` package recovery, then support
packages, then DOM, then React.

That is too coarse for the current state.

It skips the step that the older re-interview and no-regression plans already
identified as the real blocker:

- exhaustive API/public-surface claim-width audit
- deleted-family classification against the live claim

## 2. Lossless does not mean bulk carry-forward

The fresh-branch reset spec already settled the knife-edge definition:

- recover legacy truth
- adopt non-conflicting real value
- park everything else as named `post RC`

So the next plan cannot be:

- rewrite `slate`
- then see what broke

That would be louder, not more lossless.

## 3. Replan hard rule still applies

The replan command is explicit:

- do not collapse remaining work to browser/input only while public-surface
  contract-width audit is still open
- if a kept helper is narrower than legacy, reopen that lane before planning
  the next batch

So any “just cut irrelevant tests” plan is incomplete unless it keeps the
claim-width audit open.

## 4. Deletion closure must follow live proof owners

The strongest workflow learnings all point the same way:

- green harness rows do not automatically mean mirrored runtime parity
- example parity is different from narrow behavior proof
- deleted test/example families must be frozen against the current diff and
  classified by current proof owner
- explicit skip is honest only when the live claim is narrower and that cut is
  stated

# Decisions

## 1. The next mainline blocker is classification, not broad source recovery

The next batch should:

1. freeze the current remaining deleted/residue inventory
2. audit kept public-surface rows for claim-width drift
3. classify each remaining row as:
   - `keep and recover now`
   - `explicit skip`
   - `post RC`
4. only then start targeted package/source recovery for the rows that still
   belong in the live claim

## 2. `slate` remains first, but only as the first audited owner

`slate` still goes first because it owns the widest public surface.

But tranche 3 should mean:

- audit + classify `slate`
- recover only the kept deltas

not:

- broad same-path source rewrite of `packages/slate/src/**`

## 3. Test cuts are allowed only as explicit claim decisions

A test or file can be cut only when all of these are true:

- the current live claim is narrower
- the surviving proof owner is named
- the rationale is explicit
- the docs/ledgers update in the same turn

Anything else is just deleting evidence.

## 4. Example and browser lanes stay owner-based

- narrow browser proof does not close example parity
- benchmark rows do not masquerade as behavior rows
- root proof/benchmark commands stay outside the mainline until their owning
  package/example claim is live

# Proposed Remaining Order

## Tranche 3

Lossless core claim-width audit and residue classification in `slate`.

## Tranche 4

Targeted support-package closure in `slate-history` and
`slate-hyperscript`, following the audited live claim.

## Tranche 5

DOM-owned closure in `slate-dom`, again only for kept seams.

## Tranche 6

React-owned closure in `slate-react`, tied back to source truth instead of
browser proof vibes.

## Tranche 7

Contributor-facing example parity, benchmark ownership, additive value, and
remaining root proof command surface.

## Tranche 8

Final RC ledger closure with named `post RC` leftovers only.

# Required Live Doc Sync

- `docs/slate-v2/master-roadmap.md`
- `docs/slate-v2/fresh-branch-migration-plan.md`
- `docs/slate-v2/release-readiness-decision.md`
- `docs/slate-v2/true-slate-rc-proof-ledger.md`
- `docs/slate-v2/replacement-gates-scoreboard.md`
- `docs/slate-v2/references/pr-description.md`
- `docs/slate-v2/release-file-review-ledger.md`

# Landed Sync

- `docs/slate-v2/master-roadmap.md`
- `docs/slate-v2/fresh-branch-migration-plan.md`
- `docs/slate-v2/release-readiness-decision.md`
- `docs/slate-v2/true-slate-rc-proof-ledger.md`
- `docs/slate-v2/replacement-gates-scoreboard.md`
- `docs/slate-v2/references/pr-description.md`
- `docs/slate-v2/release-file-review-ledger.md`
- `docs/plans/2026-04-13-slate-v2-full-no-regression-story-plan.md`
- `docs/plans/2026-04-13-slate-v2-exhaustive-api-contract-recovery-plan.md`

# Verification

- re-read the touched roadmap/verdict/ledger docs
- grep-checked the live docs for stale rewrite-first and pre-replan blocker
  wording
- confirmed the live stack now says:
  - tranche 3 is claim-width audit + residue classification
  - broad package rewrite is not the next default move
  - targeted recovery happens only after kept-surface classification
