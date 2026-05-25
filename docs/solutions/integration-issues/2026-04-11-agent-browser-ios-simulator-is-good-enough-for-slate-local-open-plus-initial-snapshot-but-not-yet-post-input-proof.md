---
date: 2026-04-11
problem_type: integration_issue
component: tooling
root_cause: missing_tooling
title: Agent-browser iOS Simulator is good enough for Slate local open plus initial snapshot, but not yet post-input proof
tags:
  - slate-browser
  - agent-browser
  - ios
  - safari
  - simulator
  - proof
severity: medium
---

# Agent-browser iOS Simulator is good enough for Slate local open plus initial snapshot, but not yet post-input proof

## What happened

We needed a smaller setup/proof step before committing to broader transport
architecture for `slate-browser`.

The question was whether `agent-browser` on iOS Simulator Safari was real
enough to justify further investment, or whether it was still just transport
theater.

## What was proved

Against a live local `slate-v2` example:

- `agent-browser -p ios` can open Safari on iOS Simulator
- it can open a local Slate example URL
- it can return the resolved URL
- it can produce an initial interactive snapshot with useful refs

That is enough for:

- transport setup proof
- human-assisted local proof setup
- pre-action artifact capture on iOS Simulator

## What did not prove cleanly

The post-input path was still flaky:

- `keyboard type` was not reliable enough
- `keyboard inserttext` got further, but post-input snapshot and screenshot were
  not stable enough to call a true automated proof lane

So the honest read is:

- open + initial snapshot are green
- post-input proof is not green yet

## Reusable rule

For `slate-browser` transport spikes:

- treat `agent-browser` iOS Simulator as a valid setup/proof transport for
  opening local examples and capturing initial browser state
- do not call it a stable automated proof backend until post-input artifact
  capture is reliable

This is good enough for the first setup spike.
It is not good enough for the final iOS parity claim.
