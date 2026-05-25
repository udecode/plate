---
date: 2026-04-11
topic: slate-v2-react-scan-experiment-loop
status: active
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
---

# Slate v2 React Scan Experiment Loop

## Goal

Use `react-scan` as a local microscope while pushing huge-document runtime work
forward, without confusing profiler visuals for benchmark truth.

## Decision

- use `react-scan` only as an opt-in dev profiler
- do not make it a benchmark gate
- do not add a permanent package dependency for it yet
- load it only when `?reactScan=1` is present in the `site` app

## Why

- the kept rerender-breadth lane already proved descendant invalidation is
  mostly local
- the remaining huge-document gap is likely large-doc DOM/runtime policy, not
  generic “React rerenders”
- `react-scan` can still help spot accidental broad mounts or promotion churn
  during future large-document experiments

## Immediate Use

Profile these flows in `site` with `?reactScan=1`:

1. huge-document typing at `5000` and `10000`
2. future shell-promotion experiments
3. any broad-op regression around `Ctrl+A` and paste

## Guardrails

- benchmark scripts stay the source of truth
- if `react-scan` and the kept lanes disagree, trust the lanes
- if it does not change a design decision, stop staring at it
