---
title: Active radius 1 is the best large-document corridor default for RC
date: 2026-04-11
category: docs/solutions/performance-issues
module: Slate v2 React runtime
problem_type: performance_issue
component: frontend_stimulus
symptoms:
  - "Shell-backed large-document mode finally had real corridor and broad-op behavior, but the default corridor width was still arbitrary"
  - "Radius 0 made promotion cheaper but kept editing comfort tighter"
  - "Radius 2 widened the live area but started charging too much for promotion"
root_cause: inadequate_documentation
resolution_type: code_fix
severity: medium
tags:
  - slate-v2
  - slate-react
  - performance
  - huge-document
  - corridor
  - active-radius
  - rc
---

# Active radius 1 is the best large-document corridor default for RC

## Problem

Once shell promotion and model-driven broad ops were working, the next trap was
obvious: leaving `activeRadius` at the first proof value just because it came
first.

That is lazy.

## Symptoms

- radius `0` kept the live corridor extremely narrow
- radius `2` improved some steady-state metrics but made promotion meaningfully
  more expensive
- there was no evidence-backed default corridor policy yet

## What Didn't Work

- treating the first proof configuration as the default
- widening the corridor without checking whether promotion cost was still sane
- pretending RC needs corridor perfection instead of a justified default

## Solution

Benchmark `activeRadius` at `0`, `1`, and `2` on the same `10000`-block
islands lane, then choose the best balance.

The kept result:

- radius `0`: cheaper promotion, weaker overall balance
- radius `1`: best overall RC balance
- radius `2`: tiny steady-state gains, too much promotion cost

So the default moved to `activeRadius: 1`.

## Why This Works

Radius `1` keeps neighboring islands live, which improves real editing posture
without reopening broad DOM work.

It also avoids the “promote one island, then immediately pay another promotion
for the next nearby edit” behavior that radius `0` encourages.

At the same time, it avoids the wider live-area tax of radius `2`.

## Prevention

- after a proof succeeds, benchmark the obvious policy knob before hardcoding
  it
- choose the default that optimizes the actual RC trade, not the prettiest
  microbench
- treat promotion cost as first-class, not just ready/type/select-all/paste

## Related Issues

- [2026-04-11-slate-v2-active-radius-policy-batch.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-slate-v2-active-radius-policy-batch.md)
- [2026-04-11-slate-v2-active-corridor-promotion-batch.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-slate-v2-active-corridor-promotion-batch.md)
