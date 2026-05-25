---
date: 2026-04-06
topic: slate-v2-inline-family-migration-tranche
status: completed
---

# Slate v2 Inline-Family Migration Tranche

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Execute the first honest inline-family migration slice for `/Users/zbeyens/git/slate-v2`
without dragging legacy plugin override architecture back into the engine.

## Scope

Stage 1 is **mentions**, not the full legacy inline family.

Deliver:

- one v2-native mentions surface built on the current snapshot/runtime stack
- one minimal runtime seam needed to support that surface honestly
- browser proof for:
  - rendered mention chips
  - mention suggestions
  - insert-on-enter behavior
- roadmap/doc sync that classifies this as the first inline-family migration
  slice

## Non-Goals

- no attempt to recreate legacy `withMentions(withReact(...))`
- no generic plugin override seam for `isInline` / `isVoid` / `markableVoid`
- no link-wrapping or `paste-html` tranche in the same slice
- no new engine op families just to make mentions “feel native”

## Design Rule

Respect the Engine v2 roadmap:

- keep the core boring
- keep runtime seams explicit
- treat app-owned inline behavior as app code unless a runtime seam is clearly
  justified

The one justified runtime seam here is keyboard-event forwarding on
`Editable` / `EditableBlocks`, because a real mention surface needs explicit
keyboard ownership and the current runtime does not expose it.

## Acceptance

1. A new v2 mentions example exists and runs in `/examples/mentions`.
2. The example proves:
   - initial rendered mention chips
   - suggestions on `@query`
   - insert on `Enter`
3. The example uses the current v2 runtime stack, not legacy Slate plugin
   overrides.
4. The runtime seam added for the slice is minimal and documented.
5. Related docs and roadmap files state that:
   - mentions are the first inline-family migration slice
   - links / `paste-html` are intentionally later

## Verification

- `yarn workspace slate-react run test`
- `yarn tsc:examples`
- targeted Playwright for the new mentions example
- `yarn test:replacement:compat:local` if the replacement matrix grows
- docs formatting checks on touched `slate-v2` and `plate-2` files

## Outcome

Completed as a mentions-first slice.

Landed:

- minimal `onKeyDown` runtime forwarding on `Editable` / `EditableBlocks`
- v2-native `mentions` example in `/Users/zbeyens/git/slate-v2/site/examples/ts/mentions.tsx`
- dedicated browser proof in
  `/Users/zbeyens/git/slate-v2/playwright/integration/examples/mentions.test.ts`
- widened cross-repo replacement matrix row for legacy and current mentions
- roadmap/docs sync that classifies mentions as the first inline-family
  migration slice

Still later:

- links
- `paste-html`
- any generic plugin override architecture
