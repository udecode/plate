---
title: Autoformat lanes must split package-owned rules from current-kit shorthand
date: 2026-04-10
category: best-practices
module: autoformat
problem_type: best_practice
component: documentation
symptoms:
  - The public autoformat docs imply every shorthand-like behavior is one generic package feature.
  - App kits keep carrying large local rule tables even when some families are clearly shared.
  - Roadmap work gets stuck arguing about one "autoformat lane" even though some triggers are package-owned and others are product-owned.
root_cause: inadequate_documentation
resolution_type: documentation_update
severity: medium
tags: [autoformat, editor-behavior, package-boundaries, app-kit, shorthand]
---

# Autoformat lanes must split package-owned rules from current-kit shorthand

## Problem

It is tempting to throw every shorthand trigger into one bucket called
`autoformat`.

That is how the package docs start overselling the shared plugin, while the app
kits quietly keep the real product behavior in local rule tables. Once that
happens, nobody can tell which behaviors are:

- real shared package contract
- current-kit product choices
- neighboring input-rule work that only looks like autoformat

## Symptoms

- Shared docs talk like blockquote wrapping, list/todo shorthand, code-fence
  promotion, and HR insertion all belong to the same package-owned surface.
- Shared rule families like heading shorthand or mark closure stay duplicated in
  app kits.
- Search for “where does this behavior live?” turns into folklore instead of a
  straight answer.

## What Didn't Work

- Treating every shorthand trigger as if it belonged in `@platejs/autoformat`.
- Leaving clearly shared heading or mark rules stranded in app-local TSX files.
- Pretending Enter-owned or source-entry interactions are “close enough” to text
  autoformat.

## Solution

Split the lane into three ownership classes:

1. **Shared package-owned rules**
   - heading shorthand
   - inline mark autoformat
   - text substitution
2. **Explicit app-owned current-kit shorthand**
   - blockquote wrapping
   - list and condensed todo shorthand
   - code-block gating
   - immediate code-fence promotion
   - immediate HR insertion
3. **Neighboring interaction lanes**
   - link automd
   - Enter-owned normalization follow-up

Then make the code and docs match that split:

- export the shared rule families from `@platejs/autoformat`
- keep the app-owned quirks in the kits, with names that admit they are
  app-owned
- say the boundary out loud in the public docs

## Why This Works

This makes the runtime ownership answer obvious.

When a new bug shows up, you can tell whether it belongs in:

- the shared package
- the app kit
- or a separate input-rule lane

That kills a lot of fake architectural debate up front.

## Prevention

- Do not call a trigger package-owned unless the package exports and tests it.
- Do not leave obviously shared mark or heading rules duplicated in app kits.
- Do not flatten link automd or Enter-owned promotions into generic autoformat
  just because they smell similar.
- If the public docs need a sentence like “the kit also adds...”, that is a
  sign the ownership boundary matters and should be explicit.

## Related Issues

- [master-roadmap.md](../../editor-behavior/master-roadmap.md)
- [2026-04-10-autoformat-runtime-alignment-and-extension-plan.md](../../plans/2026-04-10-autoformat-runtime-alignment-and-extension-plan.md)
- [autoformat.mdx](../../../content/(plugins)/(functionality)/autoformat.mdx)
