# Plite Root Location Authority Cleanup Ralplan

status: done
created: 2026-05-22
completion_id: 019e46be-4ec4-7d11-bc6e-9fcf033a8803
current_pass: stopped-review-closeout
current_pass_status: complete
next_pass: none
target_score: 0.94
score: 0.94

## Current Verdict

Hard take: this is a separate plan. It should not live inside the Pretext layout
architecture plan anymore.

The root-location cleanup is its own core Plite lane:

- multi-root `PointRef` and `RangeRef` behavior;
- root-aware operation replay and selection inversion;
- rootless public point/range shape preservation;
- internal ref metadata ownership;
- replayable state-field patch policy.

The live `Plate repo root` source already implements most of the intended
architecture: `packages/plite/src/internal/root-location.ts` centralizes root
inference and implicit-root stripping, point/range refs consume it, and the
accepted state-field replay-policy P2 is fixed.

The implementation and verification are closed for this lane:

- accepted Codex review findings were fixed at the owner boundary;
- ref root metadata no longer leaks onto public `PointRef` / `RangeRef`
  interfaces;
- focused and broad gates pass in `Plate repo root`;
- the remaining broad `codex review --uncommitted` loop was explicitly stopped
  by the user, so this closeout records the verified local evidence instead of
  pretending a final clean review verdict exists.

## Intent Boundary

Intent: split the root-location authority cleanup out of the Pretext/layout
plan so the completed layout work stays closed and the remaining Plite core
cleanup has one precise owner.

Desired outcome: a standalone root-location plan owns all remaining work for
root metadata, ref root visibility, selection inverse roots, and replayable
state-field patch policy.

In scope:

- `packages/plite/src/internal/root-location.ts`;
- `PointRef` and `RangeRef` transform/root metadata behavior;
- `OperationApi.inverse(set_selection)` root derivation;
- view-scoped rootless refs and root-scoped operation replay;
- state-field large replayable patch-hook guard;
- focused root-location/state-field/history tests;
- final Codex review and completion-check closeout.

Non-goals:

- Pretext, pagination, DOM strategy, virtualization, or browser example work;
- React runtime/view architecture changes;
- public issue-fix claims from this cleanup alone;
- changing `Path` to include root;
- opening a PR or staging commits.

Decision boundaries:

- Root is location/operation metadata, not a path segment.
- Public point/range values preserve caller shape.
- Internal transforms may inject roots temporarily, but only the internal helper
  decides what to strip before publication.
- Any remaining public `PointRef` / `RangeRef` root-surface concern must be
  resolved by final review, not buried as a style preference.

## Decision Brief

Principles:

1. One internal module owns root inference.
2. Rootless caller input stays rootless on public output.
3. Explicit caller roots survive transforms and `unref()`.
4. Undo/replay restores selection identity, including root identity.
5. Large replayable state must be patchable or rejected before history/collab
   can store it.

Top drivers:

- Multi-root runtime correctness depends on a single root authority.
- Dirty ad hoc metadata like `__explicit*Root` creates future drift.
- The state-field review finding proved replay policy must match actual
  history/collab persistence semantics.

Options:

1. Keep the root-location amendment inside the Pretext/layout plan.
   - Reject. That plan is about layout and DOM materialization. Root refs and
     operation inversion are Plite core.
2. Keep root helpers duplicated near each caller.
   - Reject. It already produced a real bug class: path/ref/op code can drift.
3. Standalone root-location authority plan with live-source closeout.
   - Choose. It matches the code ownership and keeps the remaining review gate
     narrow.

Consequence: the Pretext/layout plan can stay closed, while this plan owns only
the core cleanup and final review gate.

## Live Source Grounding

| Surface | Current live source | Verdict |
| --- | --- | --- |
| Internal root authority | `packages/plite/src/internal/root-location.ts:7` defines `MAIN_ROOT_KEY`; `:24`-`:27` stores ref metadata in WeakMaps; `:29`-`:69` owns operation/point/range/selection-patch root inference; `:72`-`:99` owns implicit root injection and stripping. | keep |
| `PointRef` transform | `packages/plite/src/interfaces/point-ref.ts:40` reads root metadata; `:43` ignores sibling-root operations; `:47`-`:50` injects then strips implicit roots. | keep |
| `RangeRef` transform | `packages/plite/src/interfaces/range-ref.ts:46` reads root metadata; `:49` ignores sibling-root operations; `:53`-`:60` transforms and drafts public refs. | keep |
| Point ref creation | `packages/plite/src/editor/point-ref.ts:12` uses active operation root fallback; `:26` writes root metadata. | keep |
| Range ref creation/publication | `packages/plite/src/editor/range-ref.ts:72` uses active operation root fallback; `:97`-`:98` writes metadata; `:125`-`:155` publishes/resets public drafts. | keep |
| Selection inverse | `packages/plite/src/interfaces/operation.ts:12` imports `getSelectionPatchRoot`; `:530` and `:537` derive inverse root from the restored selection patch. | keep |
| State-field replay policy | `packages/plite/src/core/public-state.ts:335` requires patch hooks when `history !== 'skip'` or `collab === 'shared'`; `:348` rejects oversized unpatchable replay state. | keep |
| State-field regression | `packages/plite/test/document-state-patch-contract.ts:102` rejects large omitted-history fields without patch hooks. | keep |

Review cleanup applied:

- `PointRef` and `RangeRef` no longer expose a public `root?: string` field.
- Root binding and root visibility live in `root-location.ts` WeakMaps.
- `editor-runtime-view-contract.ts` asserts rootless refs do not gain a public
  `root` property while still rebasing in the invoking view root.

## Accepted Architecture Target

Target module:

```txt
packages/plite/src/internal/root-location.ts
```

Target ownership:

- `MAIN_ROOT_KEY`;
- root inference from operations, points, ranges, and selection patches;
- explicit-vs-implicit root visibility;
- implicit root injection and stripping;
- ref root metadata;
- public/internal range-ref visibility and draft state.

Public behavior:

- rootless point/range input can bind to the active root internally;
- public `current` and `unref()` return the same root visibility the caller
  supplied;
- sibling-root operations do not transform refs;
- selection inverse restores the root of the selection being restored;
- default-history state fields are treated as replayable unless
  `history: 'skip'`.

Hard cuts:

- no `__explicitRoot`;
- no `__explicitAnchorRoot`;
- no `__explicitFocusRoot`;
- no duplicated root fallback helpers in ref/op/transform callers;
- no browser proof claim for this internal core cleanup unless a
  browser-visible regression appears.

## Coverage Target

Focused coverage that must exist before closeout:

| File | Required coverage |
| --- | --- |
| `packages/plite/test/root-location-contract.ts` | `getOperationRoot`, `getPointRoot`, `getRangeRoot`, `getSelectionPatchRoot`, implicit injection/stripping, mismatched range roots |
| `packages/plite/test/editor-runtime-view-contract.ts` | rootless point/range refs created inside a `header` view shift on `header` ops and ignore `main` ops |
| `packages/plite/test/editor-runtime-view-contract.ts` | rootless multi-block delete from a `header` view edits only `header` content |
| `packages/plite/test/rooted-operation-contract.ts` | inverse `set_selection` restores `main -> header`, `header -> null`, and `null -> header` root behavior |
| `packages/plite/test/range-ref-contract.ts` | public `rangeRef.current`, draft publication, and `unref()` preserve explicit/rootless input shape |
| `packages/plite/test/range-ref-contract.ts` | public and internal range refs are removed only by matching-root operations |
| `packages/plite/test/transaction-contract.ts` | committed root-scoped `set_selection` operation carries active root while middleware payload stays caller-shaped |
| `packages/plite/test/interfaces-contract.ts` | point/range equality, compare, and intersection keep root-aware semantics |
| `packages/plite-history/test/document-state-history-contract.ts` | undo/redo restores multi-root selection and root-scoped refs after edits |
| `packages/plite/test/document-state-patch-contract.ts` | large omitted-history state field without patch hooks is rejected |

Coverage rejects:

- no dead-code deletion assertions;
- no snapshot-only proof for root semantics;
- no browser test unless a browser-visible regression is found.

## Implementation Status

Done in live source:

- internal root-location module exists;
- point/range refs consume root metadata helpers;
- point/range ref root binding is internal WeakMap metadata, not a public ref
  property;
- explicit/rootless public point/range shape is preserved through ref behavior;
- selection inverse uses restored selection root;
- large default-history state fields without patch hooks are rejected;
- focused and broad local gates are recorded as passing.

Closed:

- final broad Codex review did not reach a clean terminal verdict because the
  user explicitly stopped reviewing;
- the accepted findings already returned were fixed with focused tests;
- local proof is green for the touched root-location/history/runtime surfaces;
- completion-check is `done` for this stopped-review closeout.

## Applicable Review Matrix

| Lens | Decision |
| --- | --- |
| `tdd` | applied: every behavior claim must be proven through public editor APIs, not private helper shape only |
| `testing` | applied: focused contract tests are the right layer; no browser/e2e for this core-only cleanup |
| `performance-oracle` | applied by plan: root checks stay O(1), WeakMap metadata avoids cloning except root inject/strip boundaries |
| `vercel-react-best-practices` | skipped: no React render/subscription surface in this lane |
| `performance` | skipped: no production RUM/cohort or DOM-count claim |
| `react-useeffect` | skipped: no effects |
| `shadcn` | skipped: no UI |

## Issue / Reference Accounting

Claim decision:

- No `Fixes #...` or `Improves #...` issue claim from this cleanup.
- This is an internal Plite core correctness and architecture cleanup attached
  to multi-root runtime semantics.
- ClawSweeper related-issue pass is skipped for now because no issue-facing
  claim, browser behavior claim, example, or PR narrative changes.

Reference docs:

- `docs/plite/references/pr-description.md`: unchanged, because no issue
  claim or maintainer-facing PR line changes in this plan split.
- `docs/plite/ledgers/issue-coverage-matrix.md`: unchanged for the same
  reason.
- `docs/plite/ledgers/fork-issue-dossier.md`: unchanged for the same reason.

If final review changes the public/API story, this section must be revised
before closeout.

## Maintainer Objection Ledger

| Change | Objection | Answer | Verdict |
| --- | --- | --- | --- |
| Move root-location follow-up out of Pretext/layout plan | Another plan file adds overhead. | The old plan was complete for layout. Root-location is Plite core and was making the layout plan lie about its owner. A separate plan lowers cognitive load and narrows gates. | keep |
| Internal root-location module | This is abstraction for a small bug. | The bug crossed point refs, range refs, operations, transforms, history, and state replay. One helper prevents drift across those callers. | keep |
| WeakMap/internal ref metadata | Hidden metadata is harder to inspect. | It keeps public point/range values caller-shaped and avoids dirty `__explicit*Root` fields on public-ish objects. | keep |
| Potentially hide `ref.root` too | Ref root can be useful for debugging. | If it is public API, it leaks runtime metadata. Final review should decide whether to move it fully into the WeakMap authority. | revise if review accepts |
| No browser proof | Multi-root refs are core behavior but can surface in browser. | The touched code is package core and has direct editor/history contracts. Add browser proof only if a browser-visible regression appears. | keep |

## Pass-State Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| current-state read | complete | Live `Plate repo root` source and tests listed above | Created standalone root-location plan | none | plan split |
| plan split | complete | This plan owns root-location; old plan will point here | Pretext/layout plan no longer owns root-location closeout | none | final review |
| final-codex-review-closeout | stopped by user | Partial review sweeps ran; user explicitly stopped the broad review loop | Recorded no clean final review verdict claim | residual broad-review risk accepted by user stop | completion state |
| completion-closeout | complete | `node tooling/scripts/completion-check.mjs` passes after scoped state update | Completion file points at this plan with `status: done` | none | none |

## Fast Driver Gates

Focused gates:

```bash
# cwd: /Users/zbeyens/git/plate-2/Plate repo root
bun test ./packages/plite/test/document-state-patch-contract.ts ./packages/plite/test/collab-document-state-contract.ts ./packages/plite/test/root-location-contract.ts ./packages/plite/test/editor-runtime-view-contract.ts ./packages/plite/test/rooted-operation-contract.ts ./packages/plite/test/range-ref-contract.ts ./packages/plite/test/transaction-contract.ts ./packages/plite/test/interfaces-contract.ts ./packages/plite-history/test/document-state-history-contract.ts
bun typecheck:packages
bun lint:fix
codex review --uncommitted
```

Broad gates before done:

```bash
# cwd: /Users/zbeyens/git/plate-2/Plate repo root
bun test:bun
bun typecheck:packages
bun lint
```

Planning gate:

```bash
# cwd: /Users/zbeyens/git/plate-2
node tooling/scripts/completion-check.mjs
```

## Continuation Target

Next owner: none.

Closed state:

- the broad review loop is stopped by explicit user direction;
- do not resume `codex review --uncommitted` unless the user asks for another
  review pass;
- no PR, staging, commit, or push was performed.

## Final Completion Gates

This plan is done because:

- the user stopped the remaining final-review loop;
- accepted review findings that were already returned were fixed;
- focused root-location/state-field/history gates pass;
- package lint and typecheck gates pass for touched packages;
- no issue/reference ledger change is required;
- completion file points at this plan with `status: done`;
- `node tooling/scripts/completion-check.mjs` exits 0.

Verified evidence:

- `bun lint`
- `bun test ./packages/plite-react/test/runtime-live-state-contract.ts ./packages/plite-history/test/history-contract.ts ./packages/plite-history/test/document-state-history-contract.ts ./packages/plite/test/editor-runtime-view-contract.ts`
  -> 87 pass, 0 fail
- `bun --filter ./packages/plite typecheck`
- `bun --filter ./packages/plite-history typecheck`
- `bun --filter ./packages/plite-react typecheck`
- partial Codex review sweeps before user stopped review: `bun lint`,
  `bun typecheck:root`, `git diff HEAD --check`, slate-react Vitest, and
  `bun build:packages`

Current status: done. The final broad Codex review verdict is intentionally not
claimed.
