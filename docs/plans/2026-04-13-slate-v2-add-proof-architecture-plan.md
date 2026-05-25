---
date: 2026-04-13
topic: slate-v2-add-proof-architecture-plan
status: active
---

# Slate v2 ADD Proof Architecture Plan

## Requirements Summary

Design the cleanest long-term proof and ledger shape for agent-driven
development across `slate-v2`.

The plan must optimize for:

- exact legacy accountability
- current-architecture-aligned proof ownership
- low-context agent execution
- low-drift docs
- no resurrection of dead harness junk just to satisfy file counts

## Problem

The repo just proved both failure modes:

1. giant proof files become landfills
2. blind 1:1 source recovery turns into archaeology theater

The current exact ledgers fixed the accounting side, but the proof side still
has structural pressure:

- [legacy-slate-test-files.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/legacy-slate-test-files.md)
  is now honest 1:1
- [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts)
  is still carrying too much unrelated behavior
- the former `slate-react` `runtime.tsx` landfill proved the same problem on the
  React side and has now been split into behavior-domain proof files

Repo learnings already point the right way:

- proof files discover real contracts, but those contracts should move into
  stable owner surfaces once they are clear:
  [2026-04-04-v2-renderer-primitives-should-own-node-shapes-not-example-markup.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-renderer-primitives-should-own-node-shapes-not-example-markup.md)
- historical cleanup notes must not outrank live proof owners:
  [2026-04-09-slate-public-surface-closure-docs-must-distinguish-current-claim-cleanup-from-broad-lane-closure.md](/Users/zbeyens/git/plate-2/docs/solutions/documentation-gaps/2026-04-09-slate-public-surface-closure-docs-must-distinguish-current-claim-cleanup-from-broad-lane-closure.md)
- new seams need explicit contract rows and broader-family safety, not just
  method existence:
  [2026-04-08-slate-v2-shouldnormalize-must-be-pass-level-and-fallback-safe.md](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-04-08-slate-v2-shouldnormalize-must-be-pass-level-and-fallback-safe.md)

## Decision

Use this split:

1. exact 1:1 legacy accounting in docs
2. current behavior-domain proof files in code
3. explicit skip or mixed mapping for dead harness and split-surface legacy rows

Do **not** recover every legacy test file as a current source file.
Do **not** keep growing giant omnibus proof files.

## Principles

1. Exact in docs, bounded in code.
2. Current package boundaries beat legacy folder nostalgia.
3. One proof file should own one behavior domain, not an era of migration.
4. Dead harness files get explicit skip, not fake recovery.
5. Agents should be able to locate the owner with one grep, not a dig.

## Target Shape

### 1. Ledger Layer

Keep the exact ledgers as the permanent archaeology layer:

- [legacy-slate-test-files.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/legacy-slate-test-files.md)
- [legacy-slate-react-test-files.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/legacy-slate-react-test-files.md)
- [legacy-slate-history-test-files.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/legacy-slate-history-test-files.md)
- [legacy-playwright-example-tests.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/legacy-playwright-example-tests.md)

Rules:

- every legacy file gets one exact row
- every row has one primary current owner
- `mapped-mixed` is only for real split ownership:
  mirrored, recovered, and/or explicit-skip subclaims inside one legacy file
- `explicit-skip` requires a contract reason, not “not used”
- no `needs-triage` before a lane is called done

### 2. Proof Layer

Proof files should follow live behavior domains.

Good current examples:

- [transaction-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/transaction-contract.ts)
- [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts)
- [operations-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/operations-contract.ts)
- [transforms-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/transforms-contract.ts)
- [range-ref-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/range-ref-contract.ts)
- [clipboard-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/clipboard-contract.ts)
- [history-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate-history/test/history-contract.ts)
- [integrity-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate-history/test/integrity-contract.ts)
- [surface-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx)
- [bridge.ts](/Users/zbeyens/git/slate-v2/packages/slate-dom/test/bridge.ts)
- [clipboard-boundary.ts](/Users/zbeyens/git/slate-v2/packages/slate-dom/test/clipboard-boundary.ts)

Bad target shape:

- one giant `snapshot-contract.ts` that owns public surface, query helpers,
  selection movement, normalization, structural transforms, ids, publishing,
  and replacement semantics all at once
- one giant React runtime proof file that owns every React-facing behavior
  forever

### 3. Surface Ownership Layer

When a proof repeatedly restates the same low-level runtime shape, move that
shape into a stable package surface.

That rule already paid off for renderer primitives and should keep paying off.

Agents should prove package primitives, not hand-copy their shape in five test
files.

## Concrete File Strategy

### `packages/slate/test`

Keep:

- `transaction-contract.ts`
- `normalization-contract.ts`
- `operations-contract.ts`
- `transforms-contract.ts`
- `range-ref-contract.ts`
- `clipboard-contract.ts`
- `text-units-contract.ts`
- `extension-contract.ts`
- `headless-contract.ts`

Refactor next:

- split [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts)
  into bounded owners

Target split:

1. `surface-contract.ts`
   Owns barrel exports, overrideable editor instance surface, static delegation,
   children accessor, and public method availability.
2. `snapshot-contract.ts`
   Owns immutable snapshot publishing, versioning, id stability, replacement
   semantics, and projection helpers.
3. `query-contract.ts`
   Owns read/query helpers that are not already better housed elsewhere:
   `above`, `before`, `after`, `positions`, `unhangRange`, `nodes`, and related
   read-time traversal behavior.

Rule:

- if a test is fundamentally about write semantics, it should not live in
  `snapshot-contract.ts`
- if a test is fundamentally about query/traversal semantics, it should not
  live beside snapshot publishing rows

### `packages/slate-react/test`

The one-shot runtime breakup already landed.
Keep the same behavior-domain pressure on the remaining files so they do not
become the next monsters.

Target:

1. `surface-contract.tsx`
   package API, helper surface, and focused low-level editor-facing rows
2. `provider-hooks-contract.tsx`
   provider/editor lifecycle plus hook ownership
3. `react-editor-contract.tsx`
   `ReactEditor` mapping, focus, DOM path/point/range conversions
4. `primitives-contract.tsx`
   renderer and primitive ownership
5. `editable-behavior.tsx`
   mounted `Editable` / `EditableBlocks` behavior
6. `projections-and-selection-contract.tsx`
   projection store and ref locality
7. `app-owned-customization.tsx`
   app-owned runtime customization lanes
8. `large-doc-and-scroll.tsx`
   large-document and scroll behavior

Rule:

- mounted DOM/runtime behavior is not the same domain as exported API shape
- shared mount plumbing belongs in `test-utils.ts`

### `packages/slate-history/test`

Current split is acceptable.

Keep:

- `history-contract.ts`
- `integrity-contract.ts`

Add files only if one of those becomes bloated enough to hide gaps.

### `packages/slate-dom/test`

Current split is already good.

Keep:

- `bridge.ts`
- `clipboard-boundary.ts`

Do not drag old DOMEditor/Android-only legacy harnesses back into this package.

## Legacy Recovery Policy

For each legacy row:

1. `same-path-current`
   Use when the same relative current file still exists and still honestly owns
   the behavior.
2. `mapped-recovered`
   Use when the behavior still matters and a current proof file owns it
   directly.
3. `mapped-mixed`
   Use when the old file really split across packages or domains.
4. `explicit-skip`
   Use for:
   - dead matrix helpers
   - manifest registries
   - legacy perf harness glue
   - superseded wrapper-stack scaffolding
   - broader legacy-width behavior outside the live claim

Never recover these just to improve aesthetics.

## Agent Rules

These are the ADD rules to enforce:

1. When closing a legacy row, first ask:
   is this behavior still part of the live claim?
2. If yes:
   map it to the smallest current proof owner or add a focused new owner file.
3. If no:
   explicit skip with a contract reason.
4. If a proof file crosses two unrelated behavior domains:
   split it before adding more rows.
5. If a proof file is the only reason an agent needs thousands of lines of
   context:
   it is already too big.

Suggested thresholds:

- split when a proof file passes roughly `500-700` LOC
- split when one file owns more than `~40` logically different rows
- split immediately when a file mixes:
  - public surface
  - transaction/write semantics
  - query/traversal semantics
  - runtime DOM behavior

The exact numbers are not sacred.
The category boundary is.

## Implementation Steps

1. Freeze the ownership rule in docs.
   Add a short rule block to the ledger index and the main no-regression plan:
   exact ledgers are 1:1 archaeology, proof files are current behavior owners.
2. Split `packages/slate/test/snapshot-contract.ts` first.
   This is the highest-value ADD cleanup because it is already doing too much.
3. Update ledger owner rows to point at the new smaller proof files.
4. Keep `slate-react` proof owners behavior-scoped after the runtime breakup.
   If one of the new files starts mixing API shape, DOM mapping, and unrelated
   runtime behavior again, split it before adding more rows.
5. Keep package-level proof files aligned with package boundaries.
   Do not let `slate` proof files own `slate-dom` or `slate-react` runtime
   claims.
6. Add a lightweight maintenance rule:
   every new recovered row must name its primary owner file in the same change.

## Acceptance Criteria

- every legacy file remains 1:1 accounted for in the exact ledgers
- no live lane depends on one giant omnibus proof file to stay honest
- each proof file has one dominant behavior domain
- dead harness files are explicit skip or mixed, never fake-recovered
- agents can find the proof owner for a row with one grep and one file open
- `snapshot-contract.ts` and the remaining `slate-react` proof files stay out
  of dumping-ground territory

## Risks

- Over-splitting too early creates another form of slop.
  Mitigation:
  split by behavior domain, not by legacy folder nostalgia.
- Renaming too many proof files at once will churn links and ledger owners.
  Mitigation:
  split the worst files first, then rewire rows in small batches.
- Teams may start treating `mapped-mixed` as a lazy escape hatch.
  Mitigation:
  allow it only when one legacy file truly spans multiple current owner
  surfaces.

## Verification

- read the exact ledger row and identify its primary owner file
- open only that owner file and verify the claimed behavior is actually there
- if the row needs a second or third file because the first owner is too vague,
  the ownership is still too loose
- after each planned split, rerun the affected package tests and ledger readback

## Hard Read

The cleanest ADD shape is not:

- “recover every legacy file as a current file”
- or “keep one mega contract and pray grep saves you”

The cleanest ADD shape is:

- exact 1:1 accountability in docs
- bounded current proof owners in code
- explicit cuts for dead legacy scaffolding

That is the only setup that keeps both humans and agents out of bullshit.
