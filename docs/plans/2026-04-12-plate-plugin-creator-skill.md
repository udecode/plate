# Plate Plugin Creator Skill

## Goal

Define a repo-owned skill for creating Plate plugins using the sharpest current
patterns from Plate's plugin architecture, type contracts, and package
ownership rules.

## Scope

- audit Plate plugin authoring APIs and type contracts
- extract the strongest recurring patterns from real plugins
- design a new source-of-truth rule for `Plate Plugin Creator`
- sync the generated skill output after the rule is written

## Non-Goals

- preserving every existing plugin pattern just because it exists
- refactoring plugin runtime code unless the user later asks for it
- writing a generic external "how plugins work in editors" tutorial

## Current Findings

- `.agents/rules/*.mdc` is the source of truth, not generated `SKILL.md`
- `plate-ui` is the right structural analog: tight principles, hard rules,
  workflow, and linked reference files
- public type tests are a better pattern source than ad hoc examples
- callback/configure/extend paths already provide editor context, so teaching
  explicit `SlateEditor` threading as a default would narrow typing for no gain
- repo learnings already prefer hard ownership boundaries over fuzzy "everything
  lives in one lane" documentation
- scope should stay on plugin authoring; documentation work should link out to
  `docs-plugin` instead of bloating this skill
- real package pairs back a hard architecture rule:
  `src/lib` semantic plugins first with `createSlatePlugin` /
  `createTSlatePlugin`, then React/Plate wrappers with `toPlatePlugin`,
  `toTPlatePlugin`, or `createPlatePlugin` only when the React surface is
  genuinely required
- the main skill should carry a short explicit anti-pattern section; otherwise
  readers will copy historical weirdness from nearby plugins and call it
  precedent

## Open Questions

- how much testing/release guidance belongs in the skill versus references
- exact exception set for breaking the Slate-first law

## Working Plan

- [x] read the nearest analog rule and synced skill
- [x] gather core plugin/type evidence
- [x] gather related repo learnings
- [x] finish deep-interview clarification
- [x] draft the new rule structure and references
- [x] implement the source-of-truth rule
- [x] run `bun install` to sync generated skill output
- [x] run targeted verification on generated artifacts
