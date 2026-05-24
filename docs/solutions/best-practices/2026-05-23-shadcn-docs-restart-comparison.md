---
title: Shadcn docs restarts need a keep/throw comparison first
date: 2026-05-23
last_updated: 2026-05-24
category: docs/solutions/best-practices
module: Docs App
problem_type: best_practice
component: documentation
symptoms:
  - A forked docs app has years of Plate-specific product, registry, MDX, and design changes mixed with old shadcn code.
  - Latest upstream shadcn docs moved to a Fumadocs and shadcn v4 registry architecture.
  - Restarting from upstream without a comparison risks reapplying dead custom themes while losing valuable API docs and registry behavior.
  - Removing visible theme/customizer UI can still leave orphaned project, lift-mode, radius, and registry-preview helper state behind.
root_cause: inadequate_documentation
resolution_type: documentation_update
severity: medium
tags: [docs, shadcn, fumadocs, registry, mdx, migration]
---

# Shadcn docs restarts need a keep/throw comparison first

## Problem

Plate's `apps/www` started as a shadcn docs fork, but upstream shadcn and Plate both moved in different directions. A restart from latest shadcn docs needs a written keep/throw comparison first, or the migration will preserve old fork residue and miss the few custom pieces that are actually valuable.

## Symptoms

- Upstream docs in `../ui/apps/v4` use Fumadocs, shadcn v4 registry scripts, and a much larger current app surface.
- Plate docs in `apps/www` use Fumadocs for source loading, but still carry custom registry docs generation, Plate API MDX components, editor demos, CN routes, and product-specific homepage preview behavior.
- After visible theme/customizer removal, unused helpers such as `ProjectAddButton`, `useProject`, `ThemeComponent`, `useLiftMode`, and customizer-only `radius` config can survive unless active-source searches target the discarded surface names.
- There is no safe file-level merge path: content paths, route trees, registry layout, and search/nav models all diverged.

## What Didn't Work

- Treating the difference as styling drift. The apps differ in docs engine, registry pipeline, routing, search, and generated output.
- Treating every Plate customization as worth saving. The custom theme/customizer layer is high-cost old fork residue.
- Treating upstream as only visual inspiration. Upstream now owns the stronger Fumadocs and shadcn v4 registry direction.
- Stopping after deleting visible entrypoints. That leaves old state hooks and helper components alive, even when no retained route imports them.

## Solution

Write a comprehensive comparison before implementation:

- Full artifact: `docs/plans/2026-05-23-shadcn-docs-restart-comparison.md`
- Upstream source: `../ui/apps/v4`
- Plate source: `apps/www`

The decision from that comparison:

- Preserve the already-landed Fumadocs source cutover, then adopt upstream search, app shell, and shadcn v4 registry behavior.
- Keep Plate docs content, API MDX vocabulary, registry content, editor demos, package integration tests, and workspace alias/typecheck model.
- Keep Contentlayer out, and throw Plate custom themes/customizer, client-only nav search hacks, and stale CSS marked for sync removal.
- Keep CN docs, MCP UI, Plate Plus hooks, GA, a centered Plate homepage, and the Slate-to-HTML special page; use upstream shadcn's LLM/copy-page model instead of Plate's extra LLM UI.
- After deleting a public surface, run active-source searches for the deleted vocabulary and remove orphaned helper state. For the theme/create/project slice, that meant deleting `ProjectAddButton`, `useProject`, `ThemeComponent`, `ThemeWrapper`, `useLiftMode`, and customizer-only event/config variants while keeping the package-manager install config used by code blocks.

## Why This Works

The comparison separates product value from fork residue. That lets the restart use upstream as the base while reapplying Plate-specific behavior only where Plate has a real docs or registry requirement.

It also preserves known local traps before implementation starts: workspace package source aliases, registry server/client boundaries, registry metadata for generated consumers, generated MDX marker syntax, and DnD prerender behavior.

## Prevention

- Before restarting a forked docs app from upstream, produce a keep/throw/adopt matrix with concrete file references.
- Do not keep custom theme or nav systems just because they exist.
- Keep registry content and API docs behavior as source-owned product assets, but align installer behavior with upstream shadcn.
- For every discarded surface, search both UI entrypoints and hidden state names: component names, hook names, localStorage keys, event names, route names, and stale sync comments. Visible UI deletion is not enough.
- Read the comparison artifact before phase two implementation.

## Related Issues

- `docs/plans/2026-05-23-shadcn-docs-restart-comparison.md`
- `docs/solutions/developer-experience/2026-03-12-typescript-workspace-subpath-aliases-in-apps-www.md`
- `docs/solutions/developer-experience/2026-04-06-next-turbopack-needs-client-boundaries-at-react-package-entrypoints.md`
- `docs/solutions/developer-experience/2026-04-06-registry-helper-refactors-must-update-template-registry-dependencies.md`
- `docs/solutions/developer-experience/2026-04-27-mdx-generated-markers-must-use-jsx-comments.md`
- `docs/solutions/developer-experience/2026-03-28-next-prerendered-client-editors-need-dnd-hooks-to-noop-on-the-server.md`
