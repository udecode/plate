---
title: TipTap harvest placeholders need harness routing
date: 2026-05-10
category: best-practices
module: Plite TipTap harvest
problem_type: best_practice
component: testing_framework
symptoms:
  - Runnable Cypress specs with only route setup and TODO comments looked like harvestable behavior.
  - Portable-mixed counts were inflated by files with no assertions.
root_cause: incomplete_setup
resolution_type: workflow_improvement
severity: low
tags: [plite, tiptap-harvest, editor-test-harvester, placeholder-tests, coverage-routing]
---

# TipTap harvest placeholders need harness routing

## Problem

TipTap demo specs can be syntactically runnable while containing no behavior:
they visit a route, then leave `TODO: Write tests`. Counting those as
`portable-mixed` makes the harvest look deeper than it is.

## Symptoms

- Inventory shows runnable Cypress files with zero extracted test names.
- The file body contains route setup only.
- The report has more apparent behavior rows than actual assertions.

## What Didn't Work

- Routing by path alone was too generous. Files under useful folders like
  `GuideContent/GenerateText` or `Nodes/TaskItem` still had no assertions.

## Solution

After test-name extraction, re-open every runnable file with zero names. If the
body is only setup plus `TODO`, classify it as `harness` with an explicit reason.

In the TipTap harvest, 14 files moved this way, including:

- `../tiptap/demos/src/GuideContent/GenerateText/React/index.spec.js`
- `../tiptap/demos/src/GuideContent/GenerateText/Vue/index.spec.js`
- `../tiptap/demos/src/Nodes/TaskItem/React/index.spec.js`
- `../tiptap/demos/src/Nodes/TaskItem/Vue/index.spec.js`

## Why This Works

The harvester should count behavior, not file shells. A no-assertion Cypress file
can still be useful as evidence that a demo route exists, but it cannot justify
a Plite or Plate test row.

## Prevention

- Treat `runnable && testNames.length === 0` as a pressure check, not as a row.
- Read zero-name files before closure.
- Route assertion-free TODO files to `harness`.
- Keep behavior counts separate from route/demo existence counts.

## Related Issues

- `docs/editor-test-harvester/tiptap/report.md`
- `docs/editor-test-harvester/tiptap/inventory.md`
- `docs/solutions/best-practices/2026-05-09-lexical-normalization-harvest-rows-need-selection-query-boundaries.md`
