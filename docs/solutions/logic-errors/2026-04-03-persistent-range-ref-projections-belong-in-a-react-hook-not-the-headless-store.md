---
date: 2026-04-03
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Persistent range-ref projections belong in a React hook, not the headless store
tags:
  - slate-react-v2
  - range-ref
  - projections
  - annotations
  - architecture
severity: medium
---

# Persistent range-ref projections belong in a React hook, not the headless store

## What happened

After the `slate-v2` range-ref proof landed, the next obvious step was wiring
durable anchors into `slate-react-v2` projections.

The first attempt shoved `RangeRef` support directly into the headless
projection store.

That looked small.
It was the wrong boundary.

## Why it was wrong

The headless store is intentionally simple:

- raw `Range` projections in
- local runtime-id slices out

Once it started accepting `RangeRef`s directly, it quietly inherited React-side
ownership problems:

- who refreshes when anchor props change?
- who removes stale UI after an anchor disappears?
- who owns invalidation semantics?

That is not core work.
That is React integration work.

## What fixed it

The honest split was:

- keep `projection-store.ts` raw-`Range` only
- add a React hook that adapts `RangeRef` props into raw `Range` projections

The hook owns:

- prop-driven refresh
- cleanup on unmount/editor change
- the React-shaped contract that callers actually use

The headless store stays boring.
That is good.

## Reusable rule

For Slate v2 projection architecture:

- core owns durable anchor semantics
- the headless projection store owns raw range-to-slice projection
- React hooks own prop-driven `RangeRef` integration

If a headless store starts reading live refs directly, it is probably stealing
React work and lying about ownership.
