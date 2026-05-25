---
title: Fast element paths must preserve injected props and non-paragraph list semantics
date: 2026-04-07
category: docs/solutions/performance-issues
module: element and list render paths
problem_type: performance_issue
component: tooling
symptoms:
  - "A fast element path kept the benchmark win but silently dropped pathless injected props on wrapped elements"
  - "Unordered list visuals disappeared for non-paragraph list blocks such as heading list items"
  - "Regression only appeared once render wrappers or directional affinity were active"
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - plate
  - performance
  - fast-path
  - inject-node-props
  - list
  - rendering
---

# Fast element paths must preserve injected props and non-paragraph list semantics

## Problem

A performance cut optimized the plain element path and unordered list rendering,
but it cheated on semantics:

- wrapped element paths stopped carrying pathless `inject.nodeProps`
- unordered list visuals only survived on paragraph list blocks

That kept the perf win and broke actual rendering. Bad trade.

## Symptoms

- pathless inject plugins like indent, text-align, and list-item styling could
  disappear once `belowNodes` wrappers or directional affinity were active
- heading list items with unordered `listStyleType` stopped showing markers

## Root Cause

Two separate mistakes:

1. `pipeRenderElement(...)` computed injected attributes for the plain fast
   path, but passed raw attributes into the wrapped fallback path
2. `BaseListPlugin` narrowed unordered list-item injection to `targetPlugins:
   [KEYS.p]`, even though list semantics in this repo apply to non-paragraph
   blocks too

## Fix

- keep `fastAttributes` on the `FastElementWithPath` branch
- if active `belowNodes` wrappers exist, do not bypass `pluginRenderElement(...)`
  at all
- widen unordered list-item injection so any block with unordered
  `listStyleType` can still render as a list item

## Verification

- `pipeRenderElement.spec.tsx` now covers:
  - pathless inject props on the wrapped directional path
  - pathless inject props when active `belowNodes` wrappers are present
- `BaseListPlugin.spec.tsx` now covers unordered list-item injection on a
  non-paragraph block

## Prevention

- any element fast path that skips `getRenderNodeProps(...)` must prove it still
  preserves injected props on every surviving branch
- list rendering optimizations must be checked against non-paragraph list blocks,
  not just paragraphs
