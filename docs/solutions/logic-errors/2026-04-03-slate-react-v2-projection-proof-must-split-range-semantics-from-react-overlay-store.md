---
date: 2026-04-03
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Slate React v2 projection proof must split range semantics from the React overlay store
tags:
  - slate-v2
  - slate-react-v2
  - decorations
  - annotations
  - performance
  - architecture
severity: medium
---

# Slate React v2 projection proof must split range semantics from the React overlay store

## What happened

The first honest decorations and annotation-anchor proof for `slate-react-v2`
looked like it wanted one big new subsystem.

That was the trap.

There are two different jobs here:

- convert a logical Slate `Range` into local text slices keyed by runtime id
- subscribe React components only to the local overlay slices they care about

Trying to do both in one package boundary would have recreated the old blur:

- `slate-v2` would start owning render-time overlay state
- or `slate-react-v2` would start guessing document semantics

## What fixed it

The proof became clean only after the seam was split explicitly:

- `slate-v2` owns pure range semantics:
  - `Editor.projectRange(editor, range)`
- `slate-react-v2` owns the overlay projection runtime:
  - `createSlateProjectionStore(editor, source)`
  - `useSlateProjections(runtimeId)`

The source function stays logical:

- it derives ranges from committed editor snapshot state
- or from external decoration state plus an explicit `refresh()`

The store then projects those logical ranges into local per-runtime-id slices.

## Why this mattered

This cut fixes the actual `slate-react` pain instead of hiding it:

- local overlay updates stop forcing broad rerenders
- selection-derived annotation overlays can track committed selection changes
- core stays document-first
- React stays subscription-first

It also keeps the next step obvious:

- persistent comment anchors need range refs or bookmarks later
- they do not belong in the first projection proof

## Reusable rule

For Slate overlay architecture:

- core owns logical range meaning
- React owns overlay caching and subscription breadth
- DOM owns geometry later

If a decorations or annotations design cannot say those three lines cleanly, it
is not done.
