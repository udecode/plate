---
date: 2026-04-12
problem_type: logic_error
component: testing_framework
root_cause: logic_error
title: Firefox table multi-range proof needs native table selection and a multi-range sync guard
tags:
  - slate-react
  - slate-browser
  - firefox
  - tables
  - selection
  - multi-range
severity: high
---

# Firefox table multi-range proof needs native table selection and a multi-range sync guard

## What happened

The legacy Slate Firefox carve-out was specific:

- when Firefox exposes more than one DOM range for table selection
- calling the normal DOM selection sync collapses that state
- once collapsed, the browser can no longer keep extending the table selection

The first replacement proof attempt was wrong.

It tried to script multiple ranges with `Selection.addRange(...)`.
That only produced `rangeCount = 1`, which looked like the row was untestable.

It wasn’t untestable.
The proof was just using the wrong browser path.

## What fixed it

Use native mouse selection across real table cells in Firefox.

That produced the real browser state:

- `rangeCount > 1` before editor sync

Once the proof row was native, the actual regression showed up immediately:

- clicking a control that forced editor selection sync collapsed the live
  multi-range back to `1`

The editor fix was small and exact:

- if the live DOM selection already has more than one range inside the editor
  root, skip the normal `setDomSelection(...)` sync path

## Why this matters

This is one of those browser rows where a fake test will lie to you in both
directions.

Scripted `addRange(...)` said “nothing to see here.”
Native Firefox table selection said “no, this still breaks.”

## Reusable rule

For Firefox table-selection parity:

- do not use scripted `Selection.addRange(...)` as the primary proof
- use native mouse selection across actual table cells
- verify `rangeCount > 1` before forcing editor sync
- preserve that live multi-range state during sync instead of normalizing it
  down to one range
