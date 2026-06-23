---
title: Raw Plite should not own Markdown and table product packages
date: 2026-05-22
category: developer-experience
module: Plite package ownership
problem_type: developer_experience
component: documentation
symptoms:
  - Raw Plite gained Markdown and table package stubs that looked Plate-shaped.
  - Architecture docs blessed parser, input-rule, table-map, and cell-selection APIs in raw Plite.
  - Package tests made the wrong ownership boundary look intentional.
root_cause: scope_issue
resolution_type: code_fix
severity: medium
tags: [plite, package-ownership, markdown, tables, plate-boundary]
---

# Raw Plite should not own Markdown and table product packages

## Problem

The Plite pagination architecture lane drifted into shipping raw Plite
Markdown and table packages. That crossed the ownership boundary: Markdown
syntax policy and table feature behavior belong in Plate or app packages, not
in unopinionated Plite.

## Symptoms

- Raw Plite package directories existed for Markdown parse/serialize/input
  rules and table maps/commands/cell selection.
- TypeScript path aliases made those packages part of the workspace graph.
- The pagination plan and PR reference described them as accepted package
  surfaces.

## What Didn't Work

- Copying Lexical's package shape too literally. Lexical's Markdown package is
  useful evidence for grouping transformers, but Plite's ecosystem boundary is
  different because Plate is the product package layer.
- Treating package tests as validation. The tests proved the stubs could work;
  they did not prove raw Plite should own that scope.
- Calling the packages "opt-in". Optional product packages still bloat the raw
  Plite API and teach the wrong extension boundary.

## Solution

Hard-cut the raw Plite package surfaces:

- delete the Markdown and table package directories
- remove their TypeScript path aliases
- remove PR-plan language that presents them as raw Plite packages
- document the corrected boundary:
  - raw Plite owns schema/spec policy, transforms, selection primitives,
    normalization, clipboard/input hooks, and layout projection primitives
  - Plate/app packages own Markdown parse/serialize/input rules, table maps,
    table commands, cell-selection UX, and GFM hooks

Keep Plite examples as local proof fixtures. Do not promote example-local
Markdown/table logic into a raw Plite product package.

## Why This Works

The useful abstraction is the substrate, not the product feature. Pagination,
selection, and rich layout still need table-like geometry and Markdown-shaped
fixtures, but Plite can support that through generic structured blocks, app
provided boxes, transforms, and selection/layout primitives.

Plate can then build the richer Markdown and table packages without forcing raw
Plite to pick product syntax, table UX, menu behavior, or full GFM semantics.

## Prevention

- When a feature sounds like a product editor capability, ask whether Plate is
  the better package owner before adding a raw Plite package.
- Treat external editor packages as evidence, not as package templates to copy.
- A raw Plite package should pass the substrate test: it must be useful without
  committing to a product schema, syntax, menu, or UX policy.
- Do not let tracer tests legitimize the wrong ownership boundary. Tests prove
  behavior, not scope.

## Related Issues

- [Plite migration backbone lanes need browser contracts before completion](./2026-04-28-plite-migration-backbone-lanes-need-browser-contracts-before-completion.md)
- [Plite Yjs readiness needs core contracts before package work](./2026-05-13-plite-yjs-readiness-needs-core-contracts-before-package-work.md)
