---
review_scopes:
  - media
review_basis:
  - 2026-09-22-media-object-arrow-navigation-audit
work_kind: implementation
---

# Media object arrow navigation

Status: Completed

Objective: Make plain arrow traversal treat a selectable object as a stop before its direct editable children, in both directions, and honor the locked vertical return from caption start.

Acceptance: On `/blocks/editor-ai`, `ArrowRight` from text before an image selects the image; the next `ArrowRight` enters caption start; `ArrowLeft` at caption start reselects the image; the next `ArrowLeft` returns to preceding text. `ArrowDown` from owner enters caption start and `ArrowUp` returns to owner. The model and DOM selection agree, Delete still removes the selected owner, and ordinary text/word/shift/RTL behavior remains intact. Shared Plite object behavior applies to the five Plate media descriptors.

Source and proof: [audit](../research/review-records/2026-09-22-media-object-arrow-navigation-audit.json), [browser observation](../research/raw/2026-09-22-media-arrow-browser-observation.md), `packages/plitejs/src/react/editable/caret-engine.ts`, `packages/plitejs/test/react/object-selection.test.tsx`, `apps/www/tests/browser/media-caption.spec.ts`, and `docs/editor-behavior/**`. The fresh source-backed dev server on port 3297 reproduced the same horizontal and vertical failure before edits; the older port 3000 result is not the sole proof.

Work:
- [x] Add a focused browser regression and observe it fail on current source.
- [x] Trace the missing owner target and fix the canonical Plite caret/selection owner; avoid media-specific keyboard handlers.
- [x] Extend generic object contract tests for forward/reverse traversal and ensure vertical behavior survives.
- [x] Reconcile editor-behavior rows, evidence links, and local media docs with the final contract.
- [x] Run focused Plite and browser tests, affected type/lint checks, and exact final browser replay against fresh source.
- [x] Review the final implementation for ownership and regressions; record proof and limits here.

Decision: Keep the accepted object role and direct caption children. A new Plate media plugin or void-node restoration would duplicate or undo the semantic owner; Plite's caret engine is responsible for the keyboard transition.

Outcome: Plite's caret engine resolves a plain horizontal transition through the object owner before entering direct child text, and the input strategy gives caption-start `ArrowUp` precedence over content-root navigation. Generic object behavior covers all five media descriptors without another media-specific keyboard handler. The `ArrowDown` from a selected owner retains its prior routing and passes the direct browser case. Modifier, shift, ordinary text, and RTL paths remain with their existing owners.

Final source review: Interior text offsets return before reading computed direction, so ordinary character-by-character arrows do not pay the new owner-boundary lookup cost.

Proof: The new Plite object and www browser regressions failed before the repair. On final source, four Plite React files passed (86 tests), the www media-caption Chromium suite passed (5 tests), the exact arrow case passed again after a fresh source-backed dev-server restart, and the managed Plite mixed-bidi Chromium suite passed (3 tests). Plite source-first typecheck and changed-file formatting/lint passed. See [execution evidence](../research/raw/2026-09-22-media-object-arrow-proof.md). Existing owner deletion is exercised by the generic Plite object test and the www image-caption browser test. The final implementation review found the generic Plite caret path to be the canonical owner; the new route checks focus and model/DOM selection rather than plugin internals.

Final proof: After the hot-path edit, four Plite React files passed (86 tests), Plite source-first typecheck passed, changed-file lint passed, the managed Plite mixed-bidi Chromium suite passed (3 tests), and the full www media-caption Chromium suite passed again (5 tests) on a newly started source-backed dev server. See [final execution evidence](../research/raw/2026-09-22-media-object-arrow-final-proof.md).

Limit: The full `www` typecheck did not pass on the current checkout because unrelated active code-block edits left `CodeHighlightGrammar` unclassified in API-reference generation. Earlier attempts encountered transient TypeScript and parser errors in the same concurrent code-block work. The review ledger inventory includes the new code-block-lowlight feature identity and its check passes; see [ledger closure](../research/raw/2026-09-22-media-object-arrow-ledger-closure.md). The direct media browser and package checks passed. The `plitejs` package does not exist on `main`, so this branch-only behavior has no separate main-relative package changeset.
