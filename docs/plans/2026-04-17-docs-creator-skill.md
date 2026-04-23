# Docs Creator Skill

## Goal

Create a repo-owned `docs-creator.mdc` rule that teaches how to write strong
Plate docs across lanes, not just plugin pages, while matching the project's
best human-readable and agent-readable documentation style.

## Scope

- audit the requested docs pages and the current `docs-plugin` rule
- extract the strongest recurring structure, tone, and content rules
- call out what is weak, stale, too plugin-specific, or too vague
- write `.agents/rules/docs-creator.mdc`
- run sync so the generated skill output matches the source rule

## Non-Goals

- rewriting the docs corpus itself
- preserving every existing docs pattern just because it shipped once
- writing a generic docs-writing manifesto with no repo grounding

## Current Findings

- `docs-plugin` is useful but narrow; it assumes plugin docs are the center of
  the universe
- the best current docs pages mix quick-start, explicit ownership boundaries,
  and real code; the weaker ones drift into long reference dumps
- `docs/solutions/style.md` pushes a tutorial voice, but some current docs are
  more reference-heavy than that style suggests
- a universal docs skill needs lane-specific templates and hard anti-slop rules
  or it will become generic mush
- the strongest current guide pattern is: exact mental model, explicit sibling
  disambiguation, quick path, then deep reference
- the strongest current docs learning pattern is: treat silence as a gap, do
  not flatten neighboring lanes, and never let docs outrun runtime ownership

## Open Questions

- how prescriptive section order should be outside plugin docs
- which recurring lane templates deserve first-class guidance in the rule

## Working Plan

- [x] load relevant skills and repo instructions
- [x] read the requested docs and current docs-plugin rule
- [x] read adjacent learnings and style references
- [x] draft the docs-creator rule structure
- [x] implement `.agents/rules/docs-creator.mdc`
- [x] run `bun install` to sync generated skill output
- [x] run verification on the new artifacts
