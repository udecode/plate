# Footnote Stale Duplicate Warning After Delete

## Goal

Fix the footnote demo so duplicate-warning state clears when a duplicate set is
resolved by deletion, not just by the explicit renumber action.

## Scope

- footnote duplicate-state recomputation after node removal
- targeted regression coverage for delete-driven duplicate resolution
- browser verification on the footnote demo

## Non-Goals

- changing the duplicate-definition product law
- auto-renumbering footnotes
- broader footnote UX redesign

## Current Findings

- The warning UI is derived from `api.footnote.isDuplicateDefinition({ path })`
  and `api.footnote.hasDuplicateDefinitions({ identifier })`.
- Registry state is supposed to invalidate on `insert_node`, `remove_node`, and
  relevant `set_node` operations.
- Real bug: deleting the first duplicate definition through the editor can shift
  the surviving definition to a new path without re-rendering its warning
  chrome.
- Root cause: `useNodePath` does not update when sibling edits change this
  node's path; footnote duplicate UI was reading duplicate state from that stale
  path.
- Existing tests originally covered duplicate detection and explicit renumber
  repair, but not stale-path duplicate-state lookup after sibling removal.

## Working Plan

- [x] reproduce the stale warning through a targeted test or direct runtime repro
- [x] find the root cause in registry invalidation or duplicate-state lookup
- [x] add regression coverage for the delete path
- [x] implement the durable fix
- [x] verify with targeted tests, browser proof, and lint only

## Progress Log

- 2026-04-06: loaded learnings, planning, TDD, debug, task, and react skills
- 2026-04-06: confirmed existing footnote learning and current duplicate-law
  docs
- 2026-04-06: identified missing coverage for delete-driven duplicate
  resolution
- 2026-04-06: browser repro proved the package registry was correct but the
  definition UI stayed stale after sibling removal
- 2026-04-06: fixed the UI to derive current path and duplicate state through
  `useEditorSelector` + `editor.api.findPath(element)` instead of stale
  `useNodePath`
- 2026-04-06: made duplicate-warning chrome `contentEditable={false}` so the
  warning text and repair button are not editable text surface
- 2026-04-06: verified with targeted `bun test`, `dev-browser`, and
  `pnpm lint:fix`; skipped `www` build/typecheck by direct user request
