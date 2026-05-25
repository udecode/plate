---
date: 2026-04-09
topic: slate-v2-deletion-closure-protocol-hardening-consensus-plan
status: approved
source: /Users/zbeyens/.codex/skills/ralplan/SKILL.md
context_snapshot: /Users/zbeyens/git/plate-2/.omx/context/slate-v2-deletion-closure-protocol-hardening-20260409T133723Z.md
---

# Slate v2 Deletion Closure Protocol Hardening Consensus Plan

## RALPLAN-DR Summary

### Principles

1. closure claims must match the exact audited glob, not a vibe-equivalent package label
2. parent buckets stay open until every child bucket is closed or explicitly skipped
3. roadmap truth should be refreshed from ledger truth, not improvised from recent memory
4. process rules belong in one durable protocol owner, not scattered across random closeout notes

### Decision Drivers

1. the recent `packages/slate-react/test/**` batch was closed correctly, but the control docs omitted the still-open `packages/slate-react/src/**` deletion pressure from the remaining-open summaries
2. the current roadmap stack already has clean owner boundaries that should be preserved
3. future deletion batches need a mechanical gate, not another “be more careful” speech

### Viable Options

#### Option A: Encode the new rules directly into `master-roadmap.md` and `release-file-review-ledger.md`

Pros:

- no new top-level protocol doc
- fewer files touched

Cons:

- clutters control docs with process mechanics
- makes the rules harder to find and easier to drift

#### Option B: Add one dedicated deletion-closure protocol doc, then wire roadmap/ledger/command docs to obey it

Pros:

- one durable process owner
- keeps roadmap/ledger docs tighter
- easiest place to centralize gates, examples, and wording bans

Cons:

- adds one more reference doc
- requires a small amount of cross-doc wiring

#### Option C: Only tighten `reconsolidate-roadmap.md`

Pros:

- smallest immediate patch
- minimal doc churn

Cons:

- too weak
- does not protect non-command-driven edits
- still leaves package-vs-glob closure semantics implicit

#### Option D: Only tighten `refresh-file-review-ledger.md`

Pros:

- hits the file-truth owner directly
- smaller than a broader protocol rollout

Cons:

- still leaves roadmap/front-door wording vulnerable
- too easy for operator edits to bypass

### Chosen Option

- `Option B`

Why chosen:

- it adds one real process owner instead of stuffing protocol sludge into docs
  that already have tighter jobs

## Task Statement

Harden the Slate v2 roadmap/process stack so deletion-closure claims must follow
the exact audited glob hierarchy, with parent/child promotion gates, residual-open
disclosure, frozen-inventory reconciliation, and existing proof-surface /
lane-id citations where behavior lanes demand them.

## Scope

### In Scope

- a new deletion-closure protocol doc under `docs/slate-v2/`
- roadmap wiring in:
  - `master-roadmap.md`
  - `overview.md`
  - `release-file-review-ledger.md`
  - `commands/reconsolidate-roadmap.md`
  - `commands/refresh-file-review-ledger.md`
- explicit parent/child closure-tree semantics
- wording rules that ban package-wide closure claims when only a child glob is closed
- immediate correction of the current Slate React overclaim as the first proving case
- protocol treatment for historical closeouts that predate the new required
  closeout shape

### Out of Scope

- executing the full `packages/slate-react/src/**` deleted-source closure
- reopening the finished `packages/slate-react/test/**` family batch
- changing verdict docs
- redesigning the entire roadmap stack beyond deletion-closure protocol needs

## Decision

Add one new protocol owner:

- `/Users/zbeyens/git/plate-2/docs/slate-v2/references/deletion-closure-protocol.md`

This document owns the mechanics:

1. batch naming must equal the exact audited scope
2. package-level closure requires parent/child reconciliation
3. closeout notes must disclose residual-open sibling buckets
4. refreshes must reconcile against a frozen deleted inventory, not an ad hoc
   rerun
5. behavior-sensitive deletion batches must cite existing proof surfaces and
   existing lane ids only
6. umbrella wording is banned unless the parent bucket is actually reconciled

Then wire the control stack to obey it:

- `master-roadmap.md`
  - references the protocol in Tranche 4 and Batch Exit Rule
- `release-file-review-ledger.md`
  - carries mandatory package-level parent rows for split deletion packages
  - records that child-bucket closure does not auto-promote the parent
- `overview.md`
  - uses protocol-safe wording in `Current Read`
- `commands/reconsolidate-roadmap.md`
  - adds the frozen-inventory gate before control-doc refresh
- `commands/refresh-file-review-ledger.md`
  - enforces the same frozen-inventory and promotion-gate rules on the ledger
    owner path

The first consumer of the protocol is the current Slate React drift:

- `packages/slate-react/test/**` stays closed
- `packages/slate-react/**` stays open until `src/**` residue is classified

## Proposed Protocol

### Rule 1: Batch Name Equals Audited Scope

Allowed:

- `Slate React deleted test-family closure: packages/slate-react/test/**`
- `Slate React deleted source-family closure: packages/slate-react/src/**`

Not allowed:

- `Slate React closure`
- `Slate React deletion closure`

Meaning:

- the plan title, closeout title, and ledger wording must preserve the exact
  audited scope

### Rule 2: Parent / Child Closure Tree

Every package with split deletion buckets must define a closure tree.

The seeded tree must come from the frozen deleted inventory, not memory.

Current Slate React example from the live deleted inventory:

- `packages/slate-react/**`
- `packages/slate-react/test/**`
- `packages/slate-react/src/hooks/android-input-manager/**`
- `packages/slate-react/src/chunking/**`
- `packages/slate-react/src/components/restore-dom/**`
- remaining deleted `packages/slate-react/src/hooks/*` files derived from the
  frozen inventory
- remaining deleted `packages/slate-react/src/components/*` files derived from
  the frozen inventory
- single-file residue:
  - `packages/slate-react/CHANGELOG.md`
  - `packages/slate-react/src/utils/environment.ts`
  - `packages/slate-react/src/custom-types.ts`
  - `packages/slate-react/src/@types/direction.d.ts`

The grouped “remaining deleted ... files derived from the frozen inventory”
rows above mean: derive the exact leftover deleted paths in those subtrees from
the frozen inventory and enumerate them in the parent/child matrix before any
closure wording changes.

Parent promotion rule:

- parent stays open until all children are:
  - `closed`
  - or `explicit skip`

### Rule 3: Promotion Gate

Closing a child bucket does not close the parent bucket.

Example:

- allowed:
  - `packages/slate-react/test/**` is closed
  - `Slate React test-family is closed`
- forbidden unless the parent reconciles:
  - `Slate React is closed`
  - removing `slate-react` from the remaining-open roadmap bullets

### Rule 4: Residual-Open Disclosure

Every deletion-family closeout note must end with:

- `Scope closed`
- `Sibling buckets still open`
- `What this batch does NOT close`

If there are no open siblings, the note must say that explicitly.

Historic closeout handling:

- pre-protocol closeouts are grandfathered
- if a historic closeout is actively refreshed during the rollout, it must be
  upgraded to the new closeout shape
- otherwise the required residual-open section applies to new closeouts and
  refreshed closeouts only

### Rule 5: Frozen Inventory Gate

Before editing control docs, capture the deleted-path inventory once from the
target repo and freeze it for the batch.

```bash
git -C /Users/zbeyens/git/slate-v2 diff --diff-filter=D --name-only -- <package-or-scope>
```

Then derive the exact child inventory from that frozen set and classify each
path as:

- already closed in ledger
- closed by this batch
- still open
- explicit skip

Do not rerun the raw deleted diff later and treat it as a new source of truth.

If any sibling source bucket in the frozen inventory is still open, top-level
docs must keep the parent package visible in remaining-open language.

### Rule 6: Existing Proof-Surface / Lane Citations Only

Deletion closure is not just file accounting.

When the restored/cut behavior touches named runtime lanes, the batch must cite:

- existing proof surfaces from
  - `true-slate-rc-proof-ledger.md`
  - `release-file-review-ledger.md`
- existing specialist lane ids from
  - `docs/slate-browser/proof-lane-matrix.md`

Example:

- `Editable` / focus / composition changes
  - proof surfaces:
    - `runtime/browser`
    - `public surface`
  - lane ids:
    - `yarn test:slate-browser:ime:local`
    - `yarn test:slate-browser:dom`

No freeform owner taxonomy like `selection-sync`.

### Rule 7: Umbrella Wording Ban

Allowed:

- ``packages/slate-react/test/**` is closed`
- `Slate React test-family is closed`

Not allowed:

- `Slate React deletion review is closed`

unless the parent `packages/slate-react/**` row reconciles to zero open
children.

## Doc Ownership Plan

### New Owner

- `docs/slate-v2/deletion-closure-protocol.md`
  - owns deletion-closure mechanics and examples

### Updated Owners

- `docs/slate-v2/master-roadmap.md`
  - references the protocol as Tranche 4 entry/exit discipline
- `docs/slate-v2/release-file-review-ledger.md`
  - carries the actual parent/child status truth
- `docs/slate-v2/overview.md`
  - mirrors only protocol-safe front-door wording
- `docs/slate-v2/commands/reconsolidate-roadmap.md`
  - enforces the frozen-inventory gate and refresh checklist
- `docs/slate-v2/commands/refresh-file-review-ledger.md`
  - enforces the same frozen-inventory and promotion-gate rules on the file-truth path

## Execution Phases

### Phase 0: Patch The Current Overclaim

Goal:

- immediately correct the current omission-based Slate React overclaim in the
  control docs

Exit:

- `packages/slate-react/test/**` remains closed
- `packages/slate-react/**` is still visibly open until `src/**` is reconciled

### Phase 1: Add The Protocol Owner

Goal:

- write `deletion-closure-protocol.md`

Must include:

- exact-scope naming rule
- parent/child closure-tree rule
- promotion gate
- residual-open section contract
- frozen inventory gate
- existing proof-surface / lane-id citation rule
- historic closeout grandfathering rule
- wording ban examples

### Phase 2: Wire The Control Docs

Goal:

- make the protocol unavoidable in the normal roadmap refresh path

Required edits:

- `master-roadmap.md`
- `release-file-review-ledger.md`
- `overview.md`
- `commands/reconsolidate-roadmap.md`
- `commands/refresh-file-review-ledger.md`

### Phase 3: Seed The First Package-Level Closure Tree

Goal:

- add the first explicit parent/child matrix for `packages/slate-react/**`

This matrix must be exhaustive against the frozen deleted inventory, including:

- `packages/slate-react/test/**`
- `packages/slate-react/src/chunking/**`
- `packages/slate-react/src/components/restore-dom/**`
- `packages/slate-react/src/hooks/android-input-manager/**`
- remaining deleted hooks/components grouped only from the frozen inventory
- package-root and single-file residue

This proves the protocol on a real package and removes ambiguity about what is
still open.

## Acceptance Criteria

1. one new protocol doc exists and owns deletion-closure mechanics
2. `master-roadmap.md`, `overview.md`, `release-file-review-ledger.md`, and
   both command docs all reference or enforce the protocol in their own
   role-appropriate way
3. package-wide closure language is impossible to justify without a reconciled
   parent row
4. closeout notes have a required residual-open section for new and refreshed
   closeouts, while historic closeouts are explicitly grandfathered unless
   touched
5. the refresh path now requires a frozen deleted-inventory classification step
   before top-level wording changes
6. the current Slate React overclaim is corrected as part of the rollout
7. specialist verification references use existing proof surfaces and existing
   lane ids only
8. the seeded `packages/slate-react/**` tree is exhaustive against the frozen
   deleted inventory, not a representative sample

## Verification

Planning artifact verification:

- `bunx prettier --check docs/plans/2026-04-09-slate-v2-deletion-closure-protocol-hardening-consensus-plan.md`

Execution-phase verification should include:

- `bunx prettier --check` on the touched roadmap/process docs
- `rg -n "packages/slate-react/test/\\*\\*|packages/slate-react/src/\\*\\*|deletion-closure-protocol|remaining open deletion|frozen inventory" docs/slate-v2/master-roadmap.md docs/slate-v2/overview.md docs/slate-v2/release-file-review-ledger.md docs/slate-v2/commands/reconsolidate-roadmap.md docs/slate-v2/commands/refresh-file-review-ledger.md docs/slate-v2/deletion-closure-protocol.md`

If the rollout also corrects live Slate React package wording:

- the frozen deleted inventory artifact must live in
  `/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-deletion-closure-protocol-rollout.md`
  under a `Frozen Deleted Inventory` section
- the seeded `packages/slate-react/**` parent/child matrix must have zero
  unmatched paths against that frozen inventory
- the control docs must still keep the parent package visibly open until every
  child row is `closed` or `explicit skip`

## Risks And Mitigations

- `owner-boundary duplication`
  - mitigation: the protocol doc owns schema/invariants only; live status stays
    in `release-file-review-ledger.md`, lane ids stay in
    `docs/slate-browser/proof-lane-matrix.md`
- `stale diff reruns changing truth mid-refresh`
  - mitigation: freeze the deleted inventory once per batch and reconcile from
    that artifact only
- `historic closeouts instantly failing the new contract`
  - mitigation: grandfather untouched historic closeouts and require the new
    closeout shape only for new or refreshed closeouts
- `under-enumerated child buckets leaking package-wide closure again`
  - mitigation: require an exhaustive seeded parent/child matrix against the
    frozen inventory before any parent-level wording change

## ADR

### Decision

Create one dedicated deletion-closure protocol doc and wire the control stack
to obey it.

### Drivers

- exact audited scope matters more than package-name convenience
- parent/child promotion needs a hard gate
- refresh commands need a frozen inventory-reconciliation step

### Alternatives Considered

- embed all rules directly in roadmap + ledger
- only tighten the reconsolidation command
- only tighten the ledger refresh command

### Why Chosen

- best balance between clarity, durability, and owner-boundary discipline

### Consequences

- one extra reference doc exists
- both refresh commands now share one protocol instead of drifting
- control docs stay cleaner because mechanics move out of them
- future batch overclaims should become visibly invalid instead of easy to type

### Follow-Ups

- execute this protocol rollout before the next `packages/slate-history/test/**`
  deletion batch
- use `packages/slate-react/**` as the first seeded package-level closure tree

## Agent Roster And Staffing

Available useful agent types for follow-up execution:

- `executor`
- `architect`
- `critic`
- `verifier`
- `writer`

### Ralph Path

Best follow-up is `$ralph`, not `$team`.

Why:

- this is a small, tightly coupled docs/process patch
- parallel lanes would just create merge noise in the same control docs

Suggested Ralph work:

1. add `deletion-closure-protocol.md`
2. patch roadmap/ledger/overview/command docs
3. correct the current Slate React overclaim
4. rerun doc verification

### Team Path

Only use `$team` if you insist on splitting:

- lane 1: protocol doc draft
- lane 2: roadmap/overview wording patch
- lane 3: ledger/command patch

This is probably slower than Ralph because the write surfaces overlap.
