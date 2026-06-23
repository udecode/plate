# Plite Example Helper Inlining

Status: done
Runtime id: 019e3627-238b-7993-a8cf-26be45504c47
Completion file: `active goal state`

## Goal

Clean Plite examples so single-use helper functions that make extension
examples harder to read are inlined at the point of use.

## Scope

- Owner repo: `/Users/zbeyens/git/plite`.
- Target: `site/examples/ts/**`.
- In scope: example-local helpers whose only job is to hide the body of an
  extension callback or adjacent example action.
- Out of scope: reusable helpers used by multiple UI actions, parser helpers,
  renderer components, type guards, and long algorithmic utilities where a name
  is the readable boundary.

## Acceptance

- Checklist backspace logic is inline inside the `checklist()` extension.
- Other same-shape examples are cleaned without flattening real reusable logic.
- Example typecheck passes.
- Completion state is marked `done` only after verification.

## Completed

- Inlined checklist delete-backward behavior in
  `/Users/zbeyens/git/plite/site/examples/ts/check-lists.tsx`.
- Inlined markdown shortcut command/transform helpers in
  `/Users/zbeyens/git/plite/site/examples/ts/markdown-shortcuts.tsx`.
- Inlined clipboard capability wrappers in images, inlines, richtext, and
  rendering-strategy-runtime examples while preserving callback typing with
  `satisfies DOMClipboardInsertDataHandler`.
- Inlined tiny toolbar action wrappers where they only hid the callback body.

## Verification

- `bun lint:fix`
- `bun typecheck:site`
- `bun check`
