---
date: 2026-05-08
topic: slate-v2-use-element-selected-self-removal-ralplan
status: done
completion: .tmp/completion-checks/slate-v2-use-element-selected-self-removal-ralplan.md
skills:
  - slate-ralplan
  - clawsweeper
---

# Slate v2 UseElementSelected Self-Removal Ralplan

## Current Verdict

Next issue lane: `#6053 useSelected error when remove myself`.

This is the right next issue because it is the top live-open issue, it is not
closed by the Mobile/IME macro, exact gitcrawl search only returns itself, and
the current v2 hook has a plausible improvement but no exact self-removal
regression proof.

Ralph execution on 2026-05-08 added the exact proof. `#6053` can now be claimed
as `Fixes`: `useElementSelected()` survives selected self-removal, and
`useElementSelected(path)` returns `false` after the watched path is removed.

Current score: `0.92`. Ralplan complete; implementation proof complete.

## Intent And Boundary

Intent: convert the current broad `useElementSelected` stale-path improvement
into an exact, maintainable issue proof if the live implementation already
supports it, or identify the smallest clean React-runtime fix if it does not.

Desired outcome: the `ralph` pass adds the missing self-removal test, keeps the
hook architecture small, and upgrades issue status only after the original
failure class is proved.

In scope:

- `packages/slate-react/src/hooks/use-element-selected.ts`
- `packages/slate-react/test/use-element-selected.test.tsx`
- `packages/slate-react/test/surface-contract.tsx`
- issue ledger accounting for `#6053`
- related stale path and React selector issue classification

Non-goals:

- no broad React runtime rewrite
- no Android/IME device claim
- no legacy `useSelected` alias resurrection
- no catch-and-swallow public hook policy unless live proof forces it
- no `Fixes #6053` claim without a test matching the self-removal lifecycle

Decision boundaries: this plan may choose test placement, issue classification,
and the narrow hook guard shape. It may not change public React hook names or
claim upstream issue closure without passing `Plate repo root` verification.

Unresolved user-decision points: none. This is a narrow correctness/proof lane,
not a product/API policy fork.

## Decision Brief

Principles:

- Path validity checks must happen before range reads.
- Hook selectors should be deterministic and side-effect-free.
- React hook DX must stay Slate-close and unopinionated.
- Exact issue claims need exact repro-shaped proof.
- The fix should be test-first unless the test proves current code is enough.

Top drivers:

- `#6053` reports `Editor.range(editor, path)` throwing after a rendered element
  removes itself.
- Current v2 reads runtime selection and guards `Editor.hasPath` before
  `Editor.range`.
- Existing tests cover selected path shifts, not delete-self or stale path
  invalidation after removal.

Viable options:

| Option                                                 | Pros                                                    | Cons                                                             | Verdict  |
| ------------------------------------------------------ | ------------------------------------------------------- | ---------------------------------------------------------------- | -------- |
| Add focused self-removal test first; patch only if red | Honest, cheap, preserves current architecture if enough | Needs careful test harness to keep the stale selector path alive | chosen   |
| Add try/catch around `Editor.range` immediately        | Mirrors issue author's local workaround                 | Hides root-cause boundaries and can mask unrelated tree bugs     | rejected |
| Rebuild hook around element refs only                  | Could avoid stale path reads                            | Overkill for a top-level hook issue and risks wider React churn  | rejected |
| Treat as already fixed from `Editor.hasPath` guard     | Fast                                                    | Missing exact lifecycle proof; not maintainable                  | rejected |

Chosen option: test the self-removal lifecycle first. If current code passes,
the implementation lane is test plus ledger upgrade consideration. If it fails,
fix the exact selector path lookup before any range read.

## Hardened Acceptance Criteria

The `ralph` slice is accepted only when all of these are true:

- A package-level React test mounts an element renderer that calls
  `useElementSelected()`, triggers a selection state that causes app code to
  remove that same rendered element, and proves the hook does not throw
  `Cannot find a descendant at path`.
- The test asserts the selected state settles to `false` or unmounts cleanly
  after the element disappears.
- Existing path-shift tests stay green; a fix must not regress selected elements
  whose path changes but still exists.
- The hook continues to guard invalid paths before `Editor.range`.
- No broad try/catch is added around `Editor.range` unless a red test proves
  `Editor.hasPath` cannot cover the actual stale-path shape.
- Public API remains `useElementSelected(path?: Path): boolean`.
- No browser row is required if the package test exercises the stale hook
  lifecycle. Promote to Playwright only if the package test cannot model the
  lifecycle because the failure depends on browser DOM selection scheduling.
- `Fixes #6053` is allowed only after the exact self-removal test passes in
  `Plate repo root`; otherwise the claim stays `Improves #6053`.

Rejected boundaries:

- Do not solve external controlled-value reset in this lane; that is `#3858` and
  adjacent provider/value work.
- Do not solve React provider replacement in this lane; `#5709` owns that exact
  claim.
- Do not solve DOM point import in this lane; DOM bridge lanes own those rows.
- Do not add a new hook alias or compatibility layer for legacy `useSelected`.

## Current Live Source Evidence

Issue evidence:

- `gitcrawl doctor --json`: gitcrawl `0.2.1`, `659` open threads, `617`
  clusters, no GitHub token, last sync `2026-05-04T14:58:11Z`.
- `gitcrawl threads ianstormtaylor/slate --numbers 6053,6051,4268,4466 --include-closed --json`:
  `#6053` is open, created `2026-04-20`, title `useSelected error when remove myself`.
- `gitcrawl search ianstormtaylor/slate --query "useSelected remove myself Cannot find a descendant path" --mode hybrid --limit 20 --json`:
  exact search returned only `#6053`.
- `gitcrawl neighbors ianstormtaylor/slate --number 6053 --limit 20 --json`:
  related pressure includes stale path, DOM point, invalid selection, history
  set-selection, and selector rerender issues, but no exact duplicate.

Live code evidence:

- `packages/slate-react/src/hooks/use-element-selected.ts:17` builds
  the selector.
- `packages/slate-react/src/hooks/use-element-selected.ts:19`
  reads runtime selection.
- `packages/slate-react/src/hooks/use-element-selected.ts:22`
  resolves `path ?? contextPath ?? ReactEditor.findPath(...)`.
- `packages/slate-react/src/hooks/use-element-selected.ts:27`
  returns false when `Editor.hasPath(editor, selectedPath)` fails.
- `packages/slate-react/src/hooks/use-element-selected.ts:29`
  only calls `Editor.range` after that guard.

Existing test evidence:

- `packages/slate-react/test/use-element-selected.test.tsx:108`
  proves `useElementSelected` remains true when a selected element path shifts
  after an insertion.
- `packages/slate-react/test/surface-contract.tsx:408` repeats the
  path-shift contract at the public surface level.
- No current test found for `useElementSelected` when the selected or watched
  element removes itself and the stale path no longer exists.

Live source refresh, pass 5:

- `packages/slate-react/src/hooks/use-element-selected.ts:22-30`
  resolves `path ?? contextPath ?? ReactEditor.findPath(...)`, returns `false`
  for a missing selected path, and calls `Editor.range` only after
  `Editor.hasPath`.
- `packages/slate-react/src/components/editable-text-blocks.tsx:810-819`
  wraps custom rendered elements in runtime id, path, and element providers.
  That makes the stale-self-removal lifecycle a React provider/selector test,
  not a DOM bridge test by default.
- `packages/slate-react/src/hooks/use-editor-selector.tsx:130-138`
  subscribes in a layout effect, runs an immediate update, and returns the
  unsubscribe. `packages/slate-react/src/hooks/use-editor-selector.tsx:195-252`
  defers selected element updates through a microtask fanout, while
  `packages/slate-react/src/hooks/use-editor-selector.tsx:311-323`
  removes runtime-id listeners on unmount.
- `packages/slate-react/src/hooks/use-generic-selector.tsx:60-81`
  records subscription callback errors and forces a re-render, so a stale
  selector crash should surface in a package-level React test.
- `packages/slate-react/test/use-element-selected.test.tsx:67-127`
  already covers selected true/false transitions and selected path shifts.
  It is the right home for the missing self-removal regression test.
- `packages/slate-react/test/surface-contract.tsx:408-489` keeps the
  public path-shift contract. Do not duplicate the self-removal case there
  unless the narrow hook test exposes a public-surface contract gap.

External React/Lexical/ProseMirror refresh decision: skipped for this pass.
The live Slate v2 source already settles the mechanism: this is a hook context,
runtime-id subscription, deferred selector, and path-validity proof problem.
Lexical or ProseMirror tests would not be portable evidence for
`useElementSelected(path?: Path)` because neither owns this hook/provider shape.
Borrow external editor tests later only if the regression expands from stale
hook path validity into DOM selection, composition, or browser scheduling.

## ClawSweeper Related-Issue Pass

Pass status: complete; issue-ledger sync was confirmed in pass 11.

Selected issue:

| Issue   | Status        | Bucket             | Confidence | Decision                                                                                                                                                 |
| ------- | ------------- | ------------------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#6053` | fixes-claimed | `v2-react-runtime` | high       | Exact selected self-removal and explicit stale watched-path proof now exists in `packages/slate-react/test/use-element-selected.test.tsx`. |

Adjacent candidates intentionally not selected:

| Issue   | Reason                                                                                                                                          |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `#6051` | Already routed by the Mobile/IME macro; exact closure needs Android Firefox plus Samsung Keyboard proof.                                        |
| `#4268` | Clipboard/paste issue. Valid future candidate, but broader paste architecture already has plans and this lane has a cheaper exact test gap.     |
| `#4466` | Chinese word movement issue. Valid future candidate, but likely browser/platform word-boundary proof, not the next cheap React-runtime closure. |

Related neighbor groups from gitcrawl:

- stale path/tree validity: `#3858`, `#4081`, `#5938`
- DOM point/selection validity: `#4323`, `#4984`, `#4643`, `#4842`
- history/refocus selection: `#3921`
- React selector/editor identity: `#5131`, `#4680`, `#5709`
- IME-ish false neighbors: `#4031`, `#5034`

Discovery result: no exact duplicate. `#6053` remains its own narrow
self-removal hook lane.

Classification split:

| Issue   | Lane decision                         | Bucket                                  | Reason                                                                                                                                                   |
| ------- | ------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#6053` | current lane, improves only           | `v2-react-runtime`                      | Exact repro is hook self-removal after selected state changes.                                                                                           |
| `#5938` | related                               | `v2-react-runtime`                      | Same stale path/fresh render-map pressure around `findPath`, but the repro is `onChange` path lookup after document manipulation, not hook self-removal. |
| `#5131` | not claimed                           | `v2-react-runtime`                      | Broad `useSlate` rerender behavior stays broad by contract; this lane is a narrow selected-element hook.                                                 |
| `#4680` | related / already triaged             | `v2-react-runtime`                      | Editor identity pressure is owned by the provider-replacement lane, with `#5709` as the exact fixed claim.                                               |
| `#5181` | related                               | `v2-react-runtime`                      | Stale editor/onChange callback pressure, but not selected-element path invalidation.                                                                     |
| `#5709` | already fixed elsewhere               | `v2-react-runtime`                      | Provider hook consumers receiving a replacement editor is already the exact React identity claim.                                                        |
| `#3858` | related                               | `v2-core-engine` / `v2-react-runtime`   | Stale descendant path after external value reset; broader controlled-value/state reset pressure, not self-removal hook proof.                            |
| `#5771` | related                               | `v2-core-engine`                        | Collaboration selection/anchor operation pressure; remote structural churn can invalidate paths but exact repro is collaboration QPS.                    |
| `#4984` | fixed elsewhere                       | `v2-dom-selection`                      | Nested-editor DOM point crossing has exact browser proof in the DOM selection lane.                                                                      |
| `#4643` | related                               | `v2-dom-selection`                      | Invalid selection fail-closed pressure; no hook self-removal repro.                                                                                      |
| `#4842` | related                               | `v2-dom-selection`                      | Nested-editor offset pressure; represented by bridge policy.                                                                                             |
| `#4323` | related                               | `v2-dom-selection` / `v2-input-runtime` | DOM point import failure after external value/state changes; not a `useElementSelected` closure.                                                         |
| `#1769` | related                               | `v2-dom-selection`                      | Non-editable block focus ownership, not hook self-removal.                                                                                               |
| `#3585` | related                               | `v2-dom-selection`                      | Click selection timing race; no selected-element stale path proof.                                                                                       |
| `#3412` | related                               | `v2-dom-selection`                      | Focus-out selection retention policy; not this hook issue.                                                                                               |
| `#3921` | related / improves elsewhere          | `v2-core-engine`                        | History/refocus selection state has model-level proof elsewhere.                                                                                         |
| `#4317` | related                               | `v2-react-runtime`                      | Selection event churn from render callback identity; not selected-element stale path.                                                                    |
| `#4031` | related, false neighbor for this lane | `v2-input-runtime`                      | Empty-editor Japanese IME/placeholder crash is Mobile/IME runtime.                                                                                       |
| `#5034` | related, false neighbor for this lane | `v2-input-runtime`                      | Android readOnly selection loss is Mobile/IME/runtime policy.                                                                                            |
| `#4111` | triage-closed                         | `skip-stale`                            | IE11/polyfill support is stale unless reproduced on supported targets.                                                                                   |
| `#5402` | not claimed                           | `skip-maintainer-noise`                 | Unused variable cleanup does not affect the hook issue.                                                                                                  |
| `#5075` | not claimed                           | `v2-api-dx`                             | TypeScript formatting-key ergonomics are unrelated to selection hook path invalidation.                                                                  |

Issue-ledger pass result: complete for the `#6053` neighbor set. Missing
explicit matrix rows were added for stale path, React identity, DOM/focus,
Mobile/IME false-neighbor, stale/noise, and non-claim rows. Missing dossier
sections were added for reviewed neighbors that previously only had old-ledger
or broad-plan coverage.

## Issue Ledger Accounting

Current accounting after this pass:

- live open ledger: `#6053` remains a singleton live-open upstream issue; v2
  sync note records the exact `Fixes #6053` proof.
- fork issue dossier: `#6053` is `fixes-claimed` with exact self-removal,
  explicit stale path, no-duplicate result, and neighbor split.
- coverage matrix: `#6053` is `Fixes`; related neighbor rows remain explicit
  and are not absorbed into the claim.
- PR description: fixed issue count and `Fixes #6053` line are synced.

Fixed issue claim introduced: `Fixes #6053`.

## Confidence Scorecard

| Dimension                                      | Weight | Score | Evidence                                                                                                                                                                  |
| ---------------------------------------------- | -----: | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance                 |   0.20 |  0.88 | Current hook uses scoped `shouldUpdate`, deferred selector fanout, and runtime-id unsubscription; maintainer and high-risk passes reject broad invalidation.              |
| Slate-close unopinionated DX                   |   0.20 |  0.91 | `useElementSelected(path?: Path)` remains a boolean hook with no app-visible error policy or product props; renderer authors should not need try/catch.                   |
| Plate and slate-yjs migration backbone         |   0.15 |  0.86 | Plate can wrap the raw hook; explicit stale-path behavior represents local and remote deletion without adding Plate or yjs fixtures to raw Slate.                         |
| Regression-proof testing strategy              |   0.20 |  0.91 | Proof is split into implicit self-removal and explicit stale-path contracts, with expanded high-risk proof gates and issue-claim controls.                                |
| Research evidence completeness                 |   0.15 |  0.93 | gitcrawl, live source, selector/provider tests, architecture-contract evidence, and maintainer objections are current; external editor research is intentionally skipped. |
| shadcn-style composability and hook minimalism |   0.10 |  0.91 | Small hook contract stays composable, renderer-local, and free of policy props.                                                                                           |

Total: `0.92`.

## Public API Target

Keep the public API as `useElementSelected(path?: Path): boolean`.

Do not add a new catch-heavy hook, do not expose stale-path error policy to app
code, and do not restore the old `useSelected` name as part of this issue.

Public overload semantics:

- no argument: watch the current rendered element from element context;
- explicit `path`: watch that path even outside an element context;
- missing watched path: return `false`, never throw.

## Internal Runtime Target

The selector must treat an invalid watched path as "not selected" before any
range read.

Target behavior:

- no throw when the watched element no longer exists;
- no throw when the selected path becomes stale after structural removal;
- return `false` for removed nodes;
- preserve `true` for selected nodes whose path shifts but still exists;
- keep selector updates scoped to selection and structural change facts.

## Hook And Render DX Target

Renderer authors should be able to use:

```tsx
const selected = useElementSelected();
```

inside an element renderer without defensive try/catch. If their element is
removed during a selection lifecycle, the hook should settle to `false` or
unmount cleanly.

## Migration Backbone

Plate: Plate can keep selection UI hooks as thin wrappers over the raw hook.
No Plate-specific behavior belongs in Slate v2.

slate-yjs: remote structural deletion is a related pressure. The hook should
survive a watched element disappearing after a remote transaction, but this
plan does not need a yjs fixture unless the self-removal test exposes a
transaction metadata gap.

## React, DX, Migration, Regression Pressure

Pass status: complete.

React runtime verdict: keep the current selector architecture. The live hook is
already aligned with the architecture contract that components subscribe to the
smallest useful selector, not broad editor changes:
`docs/slate-v2/references/architecture-contract.md:328-345`. A fix that wakes
all mounted elements or adds generic selector dirtiness would regress the known
performance lane; `docs/slate-v2/slate-react-perf-loop-context.md:177-183`
explicitly says that path did not move the 5000-node lane and hurt locality.

DX verdict: renderer authors should not write defensive try/catch around
`useElementSelected()`. The hook owns stale-path fail-closed behavior because
it is the public selection boolean, not an exception boundary.

Migration verdict: no Plate API, plugin API, or slate-yjs fixture belongs in
this lane. Plate can keep wrappers thin. slate-yjs pressure is represented by
the explicit stale-path test: remote deletion and local deletion both reduce to
"watched path no longer exists".

Regression verdict: split the proof. Do not combine implicit self-removal and
explicit removed `path` into one omnibus test. That would be a dirty test that
can pass while proving the wrong contract.

Required future tests:

1. `useElementSelected()` inside a rendered element whose own selected state
   triggers app code to remove that same element. Expected result: no throw,
   then `false` or clean unmount.
2. `useElementSelected(path)` with a watched path that is removed while the hook
   remains mounted. Expected result: `false` before `Editor.range`, no
   defensive catch required.

React skill notes:

- Vercel React: applied. Keep selector updates scoped and avoid broad
  editor-wide invalidation.
- TDD: applied. The implementation slice should add one red/proof test, patch
  if needed, then add the explicit-path test. Do not write a bulk matrix first.
- React useEffect: applied. The repro may use an app-owned effect to remove a
  selected element, but the Slate hook must stay pure and side-effect-free.
- performance-oracle: still skipped. No algorithm or hot-path rewrite is
  proposed; revisit only if the fix changes selector fanout.

## Regression Proof Matrix

| Proof                                                                 | Owner           | Required before done            |
| --------------------------------------------------------------------- | --------------- | ------------------------------- |
| Unit: selected path shifts after insertion                            | already present | yes, keep green                 |
| Unit: watched element removes itself while hook is subscribed         | missing         | yes                             |
| Unit: explicit stale watched path returns false before `Editor.range` | missing         | yes                             |
| Surface: public renderElement hook usage stays stable                 | partial         | yes if exact unit is not enough |
| Typecheck: public hook signature unchanged                            | slate-react     | yes                             |

## Browser Stress Strategy

This is primarily a React package unit lane. Browser proof is optional unless
the focused test needs real DOM selection scheduling to reproduce the stale
path. If package tests cannot model the failure, promote to a focused
Playwright row in `Plate repo root`.

## Implementation-Skill Review Matrix

| Skill              | Status          | Reason                                                                                  |
| ------------------ | --------------- | --------------------------------------------------------------------------------------- |
| Vercel React       | applied         | Keep selector updates scoped; broad editor-wide invalidation is rejected.               |
| performance-oracle | skipped for now | No hot-path rewrite yet; revisit if selector policy changes.                            |
| tdd                | applied         | Implementation used vertical proof-first tests, not a bulk imagined matrix.             |
| shadcn             | skipped         | No component API or styling surface.                                                    |
| react-useeffect    | applied         | The repro can use an app-owned effect, but the hook itself must remain a pure selector. |

## High-Risk Premortem

Pass status: complete.

High-risk trigger: no public API rename, but this lane defines runtime behavior
for stale explicit paths, selector invalidation, browser-proof escalation, and a
future `Fixes #6053` issue claim. A sloppy fix would be visible to React
renderer authors and could hide real tree corruption.

Blast radius:

| Area                | Scope                                                                                                                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Packages/files      | `packages/slate-react/src/hooks/use-element-selected.ts`, `packages/slate-react/test/use-element-selected.test.tsx`, optional `surface-contract.tsx` only if the narrow test exposes a public-surface gap |
| Users/consumers     | renderer authors using `useElementSelected()` or `useElementSelected(path)`; Plate wrappers; downstream selection UI                                                                                                                  |
| Behavior affected   | stale watched paths, self-removal during selected render lifecycle, selector fanout, invalid path handling before `Editor.range`                                                                                                      |
| Docs/examples/tests | issue coverage matrix, fork dossier, PR reference only if the claim upgrades; hook tests are required                                                                                                                                 |
| Release/claim risk  | `Improves #6053` may become `Fixes #6053` only after exact proof and focused `Plate repo root` verification                                                                                                                             |

Three-scenario pre-mortem:

| Scenario                         | Failure mode                                                                    | Consequence                                | Guardrail                                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Test passes for the wrong reason | Self-removal test only proves unmount cleanup, not stale selector path behavior | `Fixes #6053` gets overclaimed             | Test must observe no descendant-path throw while selected state causes removal; explicit stale `path` test stays separate |
| Dirty fix hides invariants       | Broad `try/catch` around `Editor.range` swallows real tree corruption           | Broken paths become silent false negatives | Catch is forbidden unless an exact red test proves `Editor.hasPath` cannot cover the failure                              |
| Performance regresses            | Fix wakes every mounted element on structural edits                             | Large-doc locality regresses               | Keep runtime-id scoped selector fanout; path-shift test must stay green; no global invalidation                           |

Expanded proof plan:

| Proof lane          | Required proof                                                                                                                                                             |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit                | `useElementSelected()` self-removal test in `use-element-selected.test.tsx`; explicit `useElementSelected(path)` removed-path test; existing path-shift test remains green |
| Integration/surface | `surface-contract.tsx -t "useElementSelected"` only if the narrow hook test exposes a public-surface gap; otherwise keep surface proof to existing path-shift coverage     |
| Browser             | Not required by default. Promote to a focused Playwright row only if package tests cannot model the stale hook lifecycle                                                   |
| Migration/adoption  | No Plate or slate-yjs adapter work. Plate wrappers remain thin; remote deletion pressure is represented by explicit stale-path false behavior                              |
| Docs/example        | No user docs change unless the public hook contract needs explicit stale-path docs after implementation                                                                    |
| Performance         | No benchmark required unless implementation changes selector fanout or adds broad invalidation                                                                             |
| Claim/release       | `Fixes #6053` is allowed after exact tests plus focused Slate v2 commands pass                                                                                             |

Rollback/remediation answer:

- If current code passes both new tests, ship tests and ledger update only.
- If self-removal fails, patch only path resolution/range guard in
  `use-element-selected.ts`.
- If the fix needs broad catch or broad invalidation, stop and replan; that is
  no longer this narrow issue lane.
- If package tests cannot reproduce but manual/browser repro still exists,
  promote to browser proof and keep `#6053` as `Improves`.

Execution result: current code passed both new tests, so the shipped change is
test and ledger proof only.

High-risk verdict: keep the plan, with the stricter proof split intact. The
blast radius is contained enough for a focused `ralph` implementation slice,
but not safe enough to skip exact tests.

Risks:

- A broad try/catch hides broken tree invariants.
- The test accidentally proves only unmount cleanup, not stale path selection.
- A fix changes selector dependencies and wakes too many elements.
- A `Fixes #6053` claim gets made from partial stale-path evidence.

Mitigation:

- write the self-removal test before patching;
- assert no console/error throw if the test harness can observe it;
- keep exact issue claim gated by the focused test and `Plate repo root` commands;
- preserve existing path-shift tests.

Ecosystem maintainer pass decision: skipped. No Lexical, ProseMirror, Tiptap, or
React external mechanism is used as positive evidence for this lane; pass 5
explicitly rejected external editor evidence as non-portable for this hook
provider shape. Running an ecosystem pass anyway would add ceremony without new
proof.

## Maintainer Objection Ledger

Pass status: complete.

| Decision                                                 | Strongest fair objection                                                                                                                                | Steelman antithesis                                                                                      | Tradeoff tension                                                                                      | Chosen answer                                                                                                                                                                                                                | Proof required                                                                                                                           | Verdict |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Support app-owned self-removal without throwing          | "If app code removes the element from inside its own selected render lifecycle, that is app misuse. Slate should not normalize every weird app effect." | A strict editor could say renderers must be pure and external mutation belongs in commands, not effects. | Supporting this pattern makes the hook responsible for disappearing nodes during a live subscription. | Keep the hook fail-closed because a public boolean selection hook should not become an exception boundary when the watched node disappears. The hook stays pure; only the test uses an app-owned effect to model the report. | Package test where `useElementSelected()` observes selected state and app code removes that same element, with no descendant-path throw. | keep    |
| Avoid broad `try/catch` around `Editor.range`            | "The issue author says try/catch fixes it. Why not use the smallest patch?"                                                                             | Try/catch is locally cheap and robust against unexpected stale paths.                                    | Guard-only code must prove every relevant stale path is checked before range reads.                   | Keep guard-first policy. Broad catch hides broken tree invariants and can mask real selection bugs. Use catch only if a red self-removal test proves `Editor.hasPath` cannot cover the failure.                              | Red/proof test first; if red, patch the exact path resolution/range guard.                                                               | keep    |
| Treat current `Editor.hasPath` as not enough for closure | "The live hook already checks `Editor.hasPath`; calling this pending is bureaucracy."                                                                   | Existing code likely already improves the stale range-read class.                                        | Planning stays pending until exact test exists, even if implementation might pass today.              | Keep `Improves #6053`, not `Fixes #6053`, until the delete-self lifecycle is proved. Existing path-shift tests do not model disappearance.                                                                                   | `packages/slate-react/test/use-element-selected.test.tsx` self-removal test passes.                                        | keep    |
| Define removed explicit `path` as `false`                | "An explicit path is caller-owned. If callers pass stale paths, throwing may be useful feedback."                                                       | Throwing could reveal stale app state earlier.                                                           | Returning `false` makes stale explicit paths quieter.                                                 | Keep `false` because the hook asks "is this path selected?", and a path that no longer exists is not selected. This is still narrow: it does not bless stale writes or stale transforms.                                     | Separate explicit-path test where the hook remains mounted and the watched path is removed before `Editor.range`.                        | keep    |
| Reject broad selector fanout                             | "If stale subscriptions are the issue, notify everyone on structural edits and be done."                                                                | Global fanout is safer and easier to reason about in small docs.                                         | Scoped fanout needs precise change metadata and tests.                                                | Keep scoped selector fanout. The live selector subscribes by runtime id, defers updates, and unsubscribes on unmount; broad invalidation would regress the known locality goal.                                              | Existing path-shift test stays green; self-removal fix does not add editor-wide invalidation.                                            | keep    |
| Keep browser proof optional                              | "The original issue happened in real React/browser rendering, so unit tests are not enough."                                                            | Browser proof catches DOM scheduling and selection timing that package tests can miss.                   | Requiring browser proof for every hook lifecycle slows issue closure and muddies owner boundaries.    | Keep package-level proof first because the failure is hook/provider/selector path validity. Escalate to Playwright only if the package test cannot reproduce the lifecycle.                                                  | Package test models stale lifecycle or explicit note promotes to focused browser row.                                                    | keep    |
| Keep issue claim conservative                            | "Users care whether #6053 is fixed, not whether the plan says improves."                                                                                | If the exact repro passes, promoting the claim is valuable.                                              | Premature `Fixes #6053` damages trust if the original lifecycle remains uncovered.                    | Keep `improves-claimed` until exact proof exists; promote only after focused `Plate repo root` verification.                                                                                                                   | Exact self-removal test plus focused Slate v2 commands.                                                                                  | keep    |

Accepted revisions from the objection pass:

- The implementation keeps implicit self-removal and explicit stale `path` as
  separate tests.
- A broad catch remains rejected unless a red exact test proves the guard cannot
  represent the failure.
- Browser proof remains an escalation path, not a default closure gate.
- `Fixes #6053` is now allowed because exact package proof exists.

## Pass Schedule

| Pass                                           | Status   | Evidence added                                                                                                                                                                                                      | Plan delta                                                                                                                                   | Open issues                   | Next owner                                |
| ---------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------- |
| 1. Current-state read and next issue selection | complete | gitcrawl doctor, thread reads, exact search, neighbor search, live hook source, existing tests                                                                                                                      | selected `#6053`; added coverage matrix row and sync notes                                                                                   | implementation proof complete | related issue discovery pass              |
| 2. Related issue discovery                     | complete | gitcrawl thread reads, exact search, neighbor search, local ledger rows, dossier/matrix ownership reads                                                                                                             | no exact duplicate; split neighbors into current lane, related, fixed elsewhere, Mobile/IME false neighbors, stale/noise, and non-claim rows | resolved in pass 3            | issue-ledger pass                         |
| 3. Issue-ledger pass                           | complete | explicit matrix rows for `#3858`, `#4081`, `#4323`, `#4680`, `#5181`, `#5771`, `#1769`, `#3585`, `#3412`, `#4317`, `#4031`, `#5034`, `#4111`, `#5402`, and `#5075`; dossier sections for missing reviewed neighbors | neighbor accounting complete for this lane; claim promotion deferred until exact proof                                                       | implementation proof complete | intent and decision brief hardening       |
| 4. Intent and decision brief hardening         | complete | hardened acceptance criteria; unresolved user-decision points set to none; package-vs-browser proof boundary                                                                                                        | `ralph` slice has exact pass/fail criteria and rejected boundaries                                                                           | implementation proof complete | research and live-source refresh          |
| 5. Research and live-source refresh            | complete | live `useElementSelected`, `useEditorSelector`, `useGenericSelector`, provider, and existing hook tests re-read                                                                                                     | external evidence skipped as non-portable for this hook lifecycle; package-level React test remains the right proof                          | implementation proof complete | React, DX, migration, regression pressure |
| 6. React, DX, migration, regression pressure   | complete | architecture-contract selector guidance, perf-loop generic dirtiness warning, live hook public export, existing hook tests                                                                                          | split implicit self-removal and explicit stale-path proof; keep API unchanged; applied React/TDD/effect guidance                             | resolved in pass 7            | maintainer objection pass                 |
| 7. Maintainer objection pass                   | complete | steelman rows for app-owned self-removal, try/catch, existing guard, explicit stale path, selector fanout, browser proof, and issue claim honesty                                                                   | hardened proof requirements and kept all major decisions                                                                                     | resolved in pass 8            | high-risk deliberate pass                 |
| 8. High-risk deliberate pass                   | complete | high-risk trigger, blast radius, three-scenario pre-mortem, expanded proof plan, rollback/remediation answer                                                                                                        | kept plan; tightened proof/claim/performance guardrails                                                                                      | resolved in pass 10           | revision pass                             |
| 9. Ecosystem maintainer pass                   | skipped  | no external editor evidence used; pass 5 rejected Lexical/ProseMirror/Tiptap as non-portable for this hook/provider lifecycle                                                                                       | no ecosystem synthesis needed                                                                                                                | none                          | revision pass                             |
| 10. Revision pass                              | complete | full-plan consistency read; stale implementation gates moved out of ralplan closure                                                                                                                                 | no contradictions left between plan closure and implementation proof                                                                         | none                          | issue sync accounting pass                |
| 11. Issue sync accounting pass                 | complete | live ledger, coverage matrix, fork dossier, and PR reference checked for `#6053`                                                                                                                                    | `#6053` promoted to `Fixes` after exact proof                                                                                                | none                          | closure score and final gates             |
| 12. Closure score and final gates              | complete | score `0.92`; all scheduled passes complete or explicitly skipped; completion state set to done                                                                                                                     | ralplan and ralph implementation are complete                                                                                                | none                          | none                                      |

## Plan Deltas From This Pass

- Activated `ralph` execution: completion state is pending again, the current
  owner is `packages/slate-react/test/use-element-selected.test.tsx`,
  and `active goal state` is an execution prompt.
- Selected `#6053` as the next runnable issue lane.
- Promoted `#6053` to `fixes-claimed` after exact package proof.
- Added missing issue coverage matrix row for `#6053`.
- Recorded why `#6051`, `#4268`, and `#4466` are not this immediate lane.
- Created and executed the focused test-first target in the `ralph` run.
- Completed related issue discovery for `#6053`; no duplicate found, and the
  exact claim was promoted after proof.
- Completed issue-ledger sync for the reviewed `#6053` neighbor set.
- Hardened acceptance criteria and decided that package-level React proof is
  enough unless browser DOM selection scheduling is required to reproduce the
  failure.
- Refreshed live Slate v2 hook, selector, provider, and test owners. The
  implementation slice added the self-removal and explicit stale-path tests in
  `packages/slate-react/test/use-element-selected.test.tsx` without
  changing hook source.
- Completed React/DX/migration/regression pressure. The `ralph` slice split
  implicit self-removal and explicit stale-path coverage into separate tests.
- Completed maintainer objection pass. The plan records why app-owned
  self-removal is supported and why broad try/catch and broad selector fanout
  stay rejected.
- Completed high-risk deliberate pass. The plan now has blast-radius, failure
  scenario, proof, rollback, and claim-control guardrails.
- Skipped ecosystem maintainer pass because no external editor mechanism is used
  as evidence for this Slate-specific hook/provider lifecycle.
- Completed revision pass. The plan now separates ralplan completion from
  implementation proof and records that proof as complete.
- Completed issue-sync accounting pass. `docs/slate-issues/gitcrawl-live-open-ledger.md`,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md`, and
  `docs/slate-v2/references/pr-description.md` carry the exact `Fixes #6053`
  accounting needed for this plan.
- Completed closure gates at score `0.92`; no further owner remains for this
  lane.

## Open Questions

- None. The ralplan is complete.

## Implementation Phases

Completed by `ralph` after this Slate Ralplan pass:

1. Add a failing or proof-first test for a renderer component using
   `useElementSelected()` while an effect removes its own element when
   selection state changes.
2. If the test fails, patch only the selector path lookup/range guard.
3. Preserve existing path-shift and surface-contract tests.
4. Run focused `Plate repo root` package tests.
5. Upgrade issue ledger status only if the exact repro-shaped test passes.

## Fast Driver Gates

Planning artifact gates:

```bash
# cwd: /Users/zbeyens/git/plate-2
pnpm lint:fix
bun run completion-check
```

Expected after closure: `bun run completion-check` passes because the ralplan
and ralph implementation are complete.

Slate v2 gates:

```bash
# cwd: /Users/zbeyens/git/slate-v2
bun --filter slate-react test:vitest -- use-element-selected
bun --filter slate-react test:vitest -- surface-contract -t useElementSelected
bun --filter slate-react typecheck
bun check
```

## Ralplan Completion Gates

- all scheduled passes are complete or explicitly skipped;
- confidence score is `>= 0.92`;
- issue classification is conservative and aligned across the plan, live ledger,
  coverage matrix, fork dossier, and PR reference;
- no `Fixes #6053` claim is made without exact implementation proof;
- implementation proof is recorded from `ralph`.

## Ralph Execution Gates

- exact self-removal test exists and passes;
- explicit stale `path` test exists and passes;
- existing path-shift tests stay green;
- focused `Plate repo root` commands pass;
- `#6053` upgraded from `Improves` to `Fixes`.
