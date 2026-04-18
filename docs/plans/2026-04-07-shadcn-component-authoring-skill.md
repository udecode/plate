# Shadcn Component Authoring Skill

## Goal

Define a repo-owned skill for building new shadcn-style components in Plate:
preserve shadcn open code, extract only the right package seams, and encode the
real local patterns instead of generic UI advice.

## Scope

- audit current registry UI/components and package seams
- design the new skill in the repo’s source-of-truth format
- add any rule/reference files the skill needs
- sync generated skill output

## Non-Goals

- fixing every over-extracted component now
- broad component refactors outside what is needed to define the skill
- updating external plugin skills in place

## Current Findings

- repo-owned skill source of truth is `.agents/rules/*.mdc`; never edit
  generated `SKILL.md` directly
- `.agents/skills/shadcn/` already contains the local synced copy of the plugin
  shadcn skill plus its bundled rule/reference files
- the new skill should match that writing style but encode Plate-specific
  component and extraction rules

## Working Plan

- [ ] audit existing registry UI/component patterns and seams
- [ ] define the skill structure and supporting reference files
- [ ] write the source-of-truth rule file
- [ ] add bundled references/rules/assets if needed
- [ ] run `bun install` to sync generated skill output
- [ ] run targeted verification on the new skill artifacts
