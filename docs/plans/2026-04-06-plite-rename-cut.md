---
date: 2026-04-06
topic: plite-rename-cut
status: completed
---

# Plite-v2 Rename Cut

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/plite/master-roadmap.md).

## Goal

Rename the surviving replacement-candidate stack in
`/Users/zbeyens/git/plite` from transitional `*-v2` names to final names.

## Scope

- package directories and package names
- imports, tsconfig refs, rollup config, workspace deps
- example/test filenames and route ids
- clipboard/browser payload naming
- docs/spec references in `plate-2` Plite docs

## Non-Goals

- no new runtime features
- no React 19 behavior work beyond trivial fallout
- no benchmark widening

## Acceptance

- no remaining live references to `plite`, `plite-react-v2`,
  `plite-dom-v2`, or `plite-history-v2` in the active source graph except
  intentional historical docs
- install/build/type/test/browser proof survives on the renamed graph

## Progress

- renamed surviving package directories in `/Users/zbeyens/git/plite/packages`
  to final names:
  - `slate`
  - `plite-react`
  - `plite-dom`
  - `plite-history`
- renamed surviving example, component, and Playwright filenames away from the
  old `plite-*` pattern
- rewired imports, tsconfig refs, rollup config, workspace deps, example ids,
  and browser payload naming to the final names
- verified the renamed graph with install, example typecheck, rollup build,
  runtime tests, Next build, and local browser proof
