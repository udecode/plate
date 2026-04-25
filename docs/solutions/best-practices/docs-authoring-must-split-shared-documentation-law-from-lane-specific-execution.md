---
title: Docs authoring must split shared documentation law from lane-specific execution
date: 2026-04-17
category: best-practices
module: docs-authoring
problem_type: best_practice
component: documentation
symptoms:
  - Plugin-focused docs guidance started acting like the source of truth for every docs lane.
  - Public docs mixed install, guide, plugin, serialization, AI, and API-reference patterns without a clear lane model.
  - Ownership drift made package behavior, kit wiring, and app-local copied code sound like one undifferentiated feature surface.
root_cause: inadequate_documentation
resolution_type: documentation_update
severity: medium
tags: [documentation, docs-authoring, docs-plugin, docs-creator, ownership, skills]
---

# Docs authoring must split shared documentation law from lane-specific execution

## Problem

The repo had a plugin documentation skill, but no shared documentation skill
owning cross-lane authoring law. That left one narrow skill doing too much and
too many pages drifting into a half-guide, half-reference blob.

## Symptoms

- Plugin docs guidance started sounding like the rulebook for install pages,
  guide pages, serialization docs, and workflow docs.
- Strong pages like `plugin-input-rules.mdx` had a clear mental model and owner
  map, while weaker pages sprawled into appendix-heavy reference dumps.
- Docs kept risking the same lie: package-owned behavior, kit wiring, and
  app-local copied code were described as one feature surface.

## What Didn't Work

- Treating "plugin docs" as the center of the whole docs system.
- Relying on tone guidance alone without a lane model.
- Letting existing prose act as truth even when the file tree and source code
  had moved on.

## Solution

Create a shared `docs-creator` rule that owns repo-wide documentation law, then
keep `docs-plugin` as the narrow companion for plugin-page specifics.

The split should be explicit:

- `docs-creator`
  - tone
  - lane detection
  - ownership clarity
  - tutorial-first ordering
  - anti-slop rules
- `docs-plugin`
  - plugin-page section order
  - kit/manual guidance
  - plugin-specific component and transform patterns

The shared rule should also force lane-aware templates:

- install / get-started
- guide / system
- plugin / feature
- serialization / conversion
- workflow / AI
- API reference
- spec / behavior law

That makes the writing answer much less fuzzy:

- use the fastest truthful path first
- split neighboring lanes when ownership differs
- push heavy reference material late
- call out server/client/static boundaries early
- document only code that actually exists

## Why This Works

It mirrors the actual shape of the repo instead of pretending every docs page
is the same kind of artifact.

Once shared law and lane-specific execution are split:

- install docs stop copying plugin-page structure
- system guides can lead with mental model and ownership
- plugin pages can stay headless and concrete without over-owning every docs
  concern
- future skills have one place to update tone and one place to update
  lane-specific mechanics

This also matches a broader rule that showed up elsewhere in the repo:
constitutional doctrine should live in one source of truth, and narrower
execution skills should stay subordinate.

## Prevention

- Do not let a lane-specific docs skill become the de facto source of truth for
  every public docs page.
- Before writing docs, classify the lane first. If the page shape is unclear,
  the writing will drift.
- If a page needs to say "the kit also adds...", stop and make the ownership
  boundary explicit.
- Treat stale paths, stale imports, and silent references as evidence the docs
  need a fresh source-code pass, not a light prose edit.

## Related Issues

- [docs/solutions/style.md](../../style.md)
- [docs-creator.mdc](../../../.agents/rules/docs-creator.mdc)
- [docs-plugin.mdc](../../../.agents/rules/docs-plugin.mdc)
- [constitutional-skill-must-own-doctrine-while-execution-skill-stays-subordinate.md](./constitutional-skill-must-own-doctrine-while-execution-skill-stays-subordinate.md)
