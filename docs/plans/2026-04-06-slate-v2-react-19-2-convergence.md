---
date: 2026-04-06
topic: slate-v2-react-19-2-convergence
status: completed
---

# Slate v2 React 19.2 Convergence

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Principles

1. Make the repo honest before making the runtime clever.
2. Use React 19.2 features to prove runtime boundaries, not to patch correctness.
3. Effects stay for external synchronization only.
4. Keep the active editor path synchronous; defer only derived UI.

## Decision Drivers

1. The docs lock `slate-react` to React `19.2+`, and the replacement-candidate
   repo must match that honestly.
2. The current runtime already matches modern React in the important way:
   snapshot-driven `useSyncExternalStore` subscriptions and no effect-mirrored
   editor state.
3. The missing 19.2 cashout is specific:
   honest repo upgrade, one optional `<Activity>` proof lane, and a very
   selective `useEffectEvent` pass.

## Viable Options

### Option A: Full React 19.2 convergence slice now

Pros:

- makes the repo truthful relative to the architecture contract and React runtime contract
- gives one coherent verification pass instead of staggered half-upgrades
- lets an `<Activity>` proof lane be real instead of theoretical

Cons:

- broader blast radius across the site and legacy packages
- likely dependency and test fallout beyond `slate-react`

### Option B: Leave the repo root on React 18 and only evolve `slate-react`

Pros:

- smaller immediate change set
- lower short-term fallout

Cons:

- keeps the repo lying about its real runtime baseline
- makes any `<Activity>` or `useEffectEvent` proof half-fake
- prolongs split-brain React assumptions

### Option C: Upgrade root React first, defer all 19.2 feature cashout

Pros:

- smallest honest first gate
- isolates dependency fallout before runtime changes

Cons:

- leaves the docs’ `Activity` / `useEffectEvent` posture unproved
- risks ending in “upgrade theater” with no runtime cashout

## Recommendation

Choose **Option A**, but stage it like **C first**.

That means:

1. root React 19.2 convergence is the entry gate
2. the first runtime cashout is one optional `<Activity>` proof lane
3. `useEffectEvent` lands only where it removes real effect-owned callback
   churn
4. `startTransition` / `useDeferredValue` do **not** land unless one derived
   non-urgent UI lane actually earns them

## Scope

1. Upgrade the root install surface in [package.json](/Users/zbeyens/git/slate-v2/package.json):
   `react`, `react-dom`, `@types/react`, and `@types/react-dom` to `19.2.x`
   where the repo-wide toolchain requires them.
2. Fix any repo fallout required to keep the current `slate-react`, tests, and
   site examples green.
3. Add one optional inactive-editor `<Activity>` proof lane in `slate-react`.
4. Audit current `slate-react` effects and use `useEffectEvent` only where
   there is a real effect-owned callback seam.
5. Keep `startTransition` / `useDeferredValue` out of editor correctness paths.
6. Sync the relevant docs in `docs/slate-v2/*` to the latest proved state.

## Non-Goals

- no public API redesign around `<Activity>`
- no blanket migration of legacy `slate-react` to `Activity`
- no forced `useEffectEvent` adoption just to say we used it
- no transitions around typing, composition, selection repair, or commit
  publication
- no “React 19.2 everywhere” rewrite outside what the repo actually needs

## What Not To Do

- do **not** ship `<Activity>` as the default editor boundary
- do **not** use `<Activity>` to hide rerender or selection bugs
- do **not** wrap editor mutations in `startTransition`
- do **not** use `useDeferredValue` for active selection or text correctness
- do **not** convert clean layout/effect wiring to `useEffectEvent` unless it
  removes real dependency-array or rebinding pain

## `useEffectEvent` Call

Current read:

- **likely later or very narrow now**

Why:

- the current `Editable` effects are mostly external DOM synchronization and are
  already shaped reasonably
- there is no strong evidence yet of dependency-array hacks or effect-owned
  callback churn that obviously wants `useEffectEvent`

Allowed now:

- a narrow use in `Editable` only if it clearly simplifies DOM listener wiring
  without changing semantics

Not required now:

- any public hook API shaped around `useEffectEvent`
- broad refactors just to replace callbacks that are already fine

## `<Activity>` Proof Shape

Add one **optional** proof lane, not a default runtime path.

Target proof:

- two editors or editor-like panes
- one is visible, one is hidden with `<Activity mode=\"hidden\">`
- the hidden one preserves local React state
- its effects cleanly tear down and rebind on resume
- on resume it reads the latest committed snapshot without stale mutable state
  weirdness

Best lane:

- a focused `slate-react` runtime test first
- optionally one `slate-browser` or Playwright example lane only if runtime
  proof alone is not enough

## Root React 19.2 Upgrade: prerequisite or split?

Answer:

- **prerequisite for honest 19.2 proof**

You can stage the implementation, but you should not claim React 19.2
convergence while the repo root still installs React 18.2.

## Acceptance Criteria

1. The repo root no longer installs React 18.2.
2. The repo still keeps the current renamed package and example surface green
   under the root 19.2 install surface:
   - `slate-react`
   - site examples / example typecheck
3. One optional `<Activity>` proof lane in
   [runtime.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx)
   is green and proves hidden/resume
   correctness.
4. Any `useEffectEvent` usage is local to effect-owned callback wiring and does
   not leak into public runtime APIs.
5. No `startTransition` / `useDeferredValue` usage is introduced for editor
   correctness.
6. Relevant docs state the latest truth about React 19.2 posture.

## Verification

### Dependency / Build

- `yarn install`
- `yarn build:slate-browser:playwright`
- `yarn tsc:examples`
- `yarn lint:typescript` only if the root React upgrade or site fallout makes
  the package-level checks insufficient

### Runtime / Tests

- `yarn workspace slate-react run test`
- targeted new Activity lane in
  [runtime.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx):
  hidden editor subtree under `<Activity mode="hidden">`
  must:
  - preserve local React state across hide/resume
  - rebind external effect-owned wiring cleanly on resume
  - read the latest committed snapshot on resume instead of stale hidden state
- rerun the existing rich-inline and no-effect-mirroring runtime lanes

### Browser

- local rich-inline browser lifecycle lane on the renamed surface
- `yarn test:slate-browser:ime:local` because `Editable` effect wiring changed

## Risks

1. Root React 19.2 and latest Next upgrade exposes `slate-react` or site build drift.
2. `<Activity>` reveals stale DOM bridge assumptions that normal mount/unmount
   never exercised.
3. Forced `useEffectEvent` adoption makes the code worse, not better.
4. Transition misuse sneaks correctness work into the deferred lane.

## First Tranche

1. Upgrade the root React install surface and latest Next in
   [package.json](/Users/zbeyens/git/slate-v2/package.json) and fix whatever breaks
   just to get back to green.
2. Add the first red in
   [runtime.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx)
   for optional `<Activity>` hide/resume correctness with these exact
   observables:
   - hidden editor local React state survives
   - on resume the editor reads the latest committed snapshot
   - no stale DOM bridge or effect-owned callback wiring remains
3. Inspect
   [editable.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx)
   for one honest `useEffectEvent` candidate. If none earns it, leave it out of
   tranche 1.
4. Do **not** add `startTransition` or `useDeferredValue` in tranche 1 unless a
   derived pane or overlay lane already exists and is measurably expensive.

## Completion

Completed on the renamed replacement-candidate graph in
`/Users/zbeyens/git/slate-v2`.

What landed:

- root `react`, `react-dom`, `@types/react`, and `@types/react-dom` on `19.2`
- root `next` on latest `16.2.2`
- `slate-react` public peer surface aligned to `>=19.2.0`
- one narrow `useEffectEvent` cut in
  [editable.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx)
- one optional `<Activity>` proof lane in
  [runtime.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx)
- site fallout fixed for the latest Next build path

Verification run:

- `yarn install`
- `yarn tsc:examples`
- `yarn build:slate-browser:playwright`
- `yarn workspace slate-react run test`
- `yarn build:next`
- local rich-inline browser proof on the renamed route
- `yarn test:slate-browser:ime:local`
