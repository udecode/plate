# TOC Interaction Polish

## Goal

Tighten the live TOC product surface so it behaves like a real navigation aid,
not just a rendered heading list.

## Scope

- TOC active-heading state in the live editor UI
- TOC click navigation feedback and selection behavior
- TOC docs/demo sync if the runtime contract changes

## Non-Goals

- new markdown syntax
- cross-file outline or app-shell search
- broad navigation-contract architecture work beyond what TOC needs right now

## Current Findings

- `packages/toc` already has active-heading tracking in
  `useContentController` and `useTocSideBarState`.
- The registry TOC node in `apps/www/src/registry/ui/toc-node.tsx` does not
  use that active state.
- The same TOC node currently renders `aria-current` on every row, which is
  wrong.
- TOC click already calls `editor.tf.navigation.flashTarget(...)`, so the live
  surface should reuse existing navigation feedback instead of inventing a new
  mechanism.
- A shared navigation-feedback draft already exists in
  `docs/plans/2026-04-06-navigation-feedback-contract.md`; use it as guidance,
  not as a blocker.

## Working Plan

- [x] confirm the highest-value missing TOC behavior in the current live surface
- [x] add failing tests for that behavior first
- [x] implement the minimal durable fix in package and app code
- [x] verify with targeted tests, package build/typecheck where needed, lint,
      and dev-browser

## Progress Log

- 2026-04-06: loaded repo rules and relevant skills for a TOC feature pass
- 2026-04-06: inspected current TOC docs, package hooks, registry UI, and the
  navigation-feedback draft
- 2026-04-06: identified the first likely TOC gap: active-heading state exists
  in the package, but the live TOC node ignores it and marks every row
  `aria-current`
- 2026-04-06: changed `useTocElementState` to reuse `useContentController` and
  expose `activeContentId` instead of keeping a second click-only scroll path
- 2026-04-06: updated the registry TOC node so only the active heading row gets
  `aria-current="location"` and active styling
- 2026-04-06: verified red/green with targeted `toc` + app specs, package
  build/typecheck, `www build:registry`, `lint:fix`, and `dev-browser`
- 2026-04-06: browser verification only worked correctly on `localhost:3001`;
  `127.0.0.1:3001` left the docs preview stuck on `Loading...` because Next dev
  blocked cross-origin HMR resources by default
