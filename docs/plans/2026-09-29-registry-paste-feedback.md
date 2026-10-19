---
review_scopes:
  - imports
review_basis:
  - 2026-09-29-imports-opt-in-paste-result
work_kind: implementation
---

# Registry paste feedback

Status: Completed

## Outcome

Keep paste-result reporting as an opt-in package API while removing notification
policy from the copied registry Editor.

## Acceptance

- The registry `Editor` renders no paste-result toast and has no Sonner dependency.
- Applications can still pass `onPasteResult` through `EditorContent` or the
  registry `Editor` props.
- Public clipboard documentation shows the opt-in callback and states that
  Plate provides no notification UI by default.
- Toast-specific registry tests, browser proof and draft changelog output are
  removed; package API tests and changesets remain.
- Registry generation, focused tests, documentation checks, lint and the review
  ledger pass.

## Decisions

- Presentation belongs to the application mounting the editor surface.
- Format diagnostics, mounted delivery and package API behavior remain unchanged.

## Proof

- Registry editor component: 3/3 tests pass.
- Plite React: 90/90 files and 1,333/1,333 tests pass, including mounted
  `onPasteResult` delivery.
- Docs source/API parity, registry generation, registry changelog freshness,
  root lint and the review ledger pass.
- Exact commands and limits: [gates.json](artifacts/2026-09-29-registry-paste-feedback/gates.json).

## Risks

An application that relied on the uncommitted registry default must opt in with
`onPasteResult`; package consumers are unaffected.

## Next action

None.
