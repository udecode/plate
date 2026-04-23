---
date: 2026-04-06
topic: slate-v2-rename-cut
status: completed
---

# Slate-v2 Rename Cut

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Rename the surviving replacement-candidate stack in
`/Users/zbeyens/git/slate-v2` from transitional `*-v2` names to final names.

## Scope

- package directories and package names
- imports, tsconfig refs, rollup config, workspace deps
- example/test filenames and route ids
- clipboard/browser payload naming
- docs/spec references in `plate-2` Slate v2 docs

## Non-Goals

- no new runtime features
- no React 19 behavior work beyond trivial fallout
- no benchmark widening

## Acceptance

- no remaining live references to `slate-v2`, `slate-react-v2`,
  `slate-dom-v2`, or `slate-history-v2` in the active source graph except
  intentional historical docs
- install/build/type/test/browser proof survives on the renamed graph

## Progress

- renamed surviving package directories in `/Users/zbeyens/git/slate-v2/packages`
  to final names:
  - `slate`
  - `slate-react`
  - `slate-dom`
  - `slate-history`
- renamed surviving example, component, and Playwright filenames away from the
  old `slate-v2-*` pattern
- rewired imports, tsconfig refs, rollup config, workspace deps, example ids,
  and browser payload naming to the final names
- verified the renamed graph with install, example typecheck, rollup build,
  runtime tests, Next build, and local browser proof
