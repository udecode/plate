---
date: 2026-04-12
problem_type: logic_error
component: slate-react
root_cause: logic_error
title: Restore DOM was a rerender era guard not a current v2 runtime need
tags:
  - slate-react
  - restore-dom
  - android
  - editable
  - dom-commit
severity: medium
---

# Restore DOM was a rerender era guard not a current v2 runtime need

## What happened

Legacy Slate React carried a dedicated `restore-dom` family that:

- buffered DOM mutations during user input
- restored added/removed DOM nodes before React commit
- only activated on Android

That made sense in the old runtime shape:

- browser mutates the DOM
- React rerender can race with that mutation
- a pre-commit repair step tries to put the DOM back before React lands

In v2, the browser-facing model is different.

The editor root owns:

- mount
- selection sync
- DOM commit back into the editor snapshot on native `input`
- DOM commit back into the editor snapshot on `compositionend`

It is not the same rerender-era contract.

## What current proof says

Direct current proof is already green on the behavior-bearing rows that matter:

- main IME surfaces
- focus restore with transient DOM-point gaps failing closed
- Firefox drag/drop cleanup after unmount
- Firefox table multi-range selection preservation
- structured Enter/Backspace split-join churn on Chromium and Android

Those are the rows where `restore-dom` would have shown up as visible breakage
if the modern runtime still depended on that mutation-replay model.

## What this means

The deleted `restore-dom` family should not stay open as a generic ghost.

The honest current split is:

- transient focus-time DOM-point gaps:
  covered by current fail-closed proof
- composition-sensitive main IME behavior:
  covered by current direct IME rows
- structural browser churn on Enter/Backspace:
  now covered by editor-owned keydown paths
- arbitrary browser/foreign DOM mutation replay before React commit:
  no longer a first-class current runtime contract by default

## Reusable rule

When a legacy guard existed to repair browser DOM drift before React commit,
first ask whether the new runtime still has the same lifecycle.

If the new runtime commits DOM back into the model directly and the visible
behavior rows are green, do not keep the old guard family open by inertia.

Close the behavior-bearing rows directly and mark the old lifecycle-specific
repair machinery as a non-current guard, not as an immortal blocker.
