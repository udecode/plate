---
date: 2026-04-04
topic: slate-browser-next-system-move
---

# Slate Browser Next System Move

> Specialist testing/proof doc. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Purpose

This doc answers one question: what is the highest-leverage targeted move for
`slate-browser` if this work reopens after the first public package tranche?

This is conditional follow-on guidance, not the current default queue for the
Slate v2 program.

## Current State

`slate-browser` already has the first tranche it needed:

- real workspace package under
  [/Users/zbeyens/git/slate-v2/packages/slate-browser](/Users/zbeyens/git/slate-v2/packages/slate-browser)
- public split:
  - `slate-browser`
  - `slate-browser/core`
  - `slate-browser/browser`
  - `slate-browser/playwright`
- live root commands:
  - `yarn test:slate-browser`
  - `yarn test:slate-browser:core`
  - `yarn test:slate-browser:dom`
  - `yarn test:slate-browser:selection`
  - `yarn test:slate-browser:e2e`
  - `yarn test:slate-browser:e2e:local`
  - `yarn test:slate-browser:ime`
  - `yarn test:slate-browser:ime:local`
  - `yarn test:slate-browser:anchors`
- public Playwright surface already includes:
  - getter namespace
  - selection namespace
  - exact-vs-contains HTML assertions
  - clipboard assertion helpers
  - exclusive clipboard serialization
  - real clipboard write plus real paste gesture

So the next move is not:

- another package split
- a fake fixture API
- a fake generic driver abstraction

The real pressure from `slate-v2` is narrower:

- renderer/input policy
- zero-width policy
- IME-sensitive empty-state behavior

## Decision Criteria

The next move should:

1. directly help prove the remaining `slate-v2` browser-facing seam
2. improve test honesty, not abstraction count
3. make later cross-browser and perf lanes easier
4. avoid fake lane-neutral API design before a second backend exists

## Direction Read

## 1. Stronger `openExample(...)` Readiness Contract

This is the strongest move.

Why:

- every remaining browser-facing proof starts by mounting an example
- the current `openExample(...)` surface is useful, but still thin
- readiness is still described as a handful of waits, not as a real contract

What it should do:

- keep `openExample(...)` as the only routing entrypoint
- make readiness explicit and intentional
- distinguish:
  - page navigation
  - editor root visibility
  - example-specific mounted state
  - selection-sensitive readiness

What it should not become:

- a Lexical-sized kitchen sink initializer
- a generic runner abstraction
- a new public `openFixture(...)`

Strong take:

- steal Lexical’s setup discipline
- do not copy Lexical’s whole `initialize(...)` blob

## 2. Cross-Browser Lane

This is important.
It is not first.

Why it loses right now:

- the docs already reject fake cross-browser IME abstraction theater
- Chromium is still the honest first lane for IME and clipboard-heavy example
  proof
- a cross-browser lane without a sharper readiness contract just gives you
  wider flakes

Best posture:

- add `test:slate-browser:cross` after the readiness contract lands
- start with non-IME proof:
  - placeholder visibility
  - semantic selection normalization
  - plain clipboard behavior

Do not start with:

- Safari/WebKit IME heroics

## 3. Perf / Accuracy Lane

This should happen.
It should happen after the next correctness seam is pinned.

Why:

- Premirror and Pretext are the right influence for lane naming and benchmark
  honesty
- but performance lanes are worth a lot more once correctness targets stop
  moving

Best later shape:

- `test:slate-browser:perf`
- maybe `test:slate-browser:accuracy`

Strong take:

- no perf lane before the renderer/input policy gauntlet exists

## 4. Less Playwright-Specific Public Boundary

This is the wrong move today.

Why:

- there is one real public backend today:
  `slate-browser/playwright`
- building a generic `EditorDriver` now would be abstraction cosplay
- the package already has the right split:
  - lane-neutral nouns in `core` and `browser`
  - backend-specific harness in `playwright`

Rule:

- keep the API nouns editor-shaped
- keep the backend surface explicit until a second backend is real

## 5. Release Posture

This matters least right now.

Why:

- package shape is already real
- package promise should still stay conservative
- release strategy does not unlock the next `slate-v2` seam

Best posture:

- keep the package experimental/private until one more real proof lane lands on
  top of the public API

## Recommendation

The strongest next system-level move is:

1. make `openExample(...)` a real readiness contract
2. use that contract to build the first renderer/input-policy gauntlet

That gauntlet should target the live unresolved seam:

- empty block placeholder policy
- zero-width rendering policy
- selection normalization around sentinel text
- IME commit behavior on empty and zero-width-sensitive starts

## Concrete Tranche

Do this next:

1. tighten `OpenExampleOptions` around readiness semantics instead of ad hoc
   waits
2. add readiness-sensitive browser regressions for zero-width / empty-state /
   IME-adjacent behavior
3. only after that, branch outward into:
   - `test:slate-browser:cross`
   - `test:slate-browser:perf`
   - maybe `test:slate-browser:accuracy`

## Anti-Rules

Do not do these first:

- reintroduce `openFixture(...)`
- add fake public synthetic paste helpers
- invent a lane-neutral driver abstraction
- start with cross-browser IME theater
- turn release semantics into the main architectural decision

## Bottom Line

The public package tranche is done.

The next move is not “more surface area”.

It is:

- a sharper readiness contract at `openExample(...)`
- then a renderer/input-policy proof gauntlet for the remaining `slate-v2`
  seam

That is the cleanest path to honest cross-browser, perf, and release decisions
later.
