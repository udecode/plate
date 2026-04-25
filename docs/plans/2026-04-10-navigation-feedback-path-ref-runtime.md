# Navigation Feedback PathRef Runtime

- Date: 2026-04-10
- Scope: `@platejs/core` navigation feedback follow-up

## Goal

Keep navigation highlight attached to the same logical node while Slate
operations move its path.

## Decision

- store active navigation feedback target as runtime `PathRef` state, not plugin
  option data
- keep `duration` as plugin option config
- keep `editor.api.navigation.activeTarget()` returning a plain resolved
  snapshot

## Why

- plain path snapshots go stale as soon as the node moves
- `PathRef` already exists in the Slate layer for exactly this case
- runtime mutable refs do not belong in plugin options

## Verification

- add a regression test proving active target path updates after node movement
- keep existing React highlight test green
- run focused nav-feedback tests plus package-scoped verification
