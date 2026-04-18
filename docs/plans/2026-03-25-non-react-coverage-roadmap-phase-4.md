---
title: Non React Coverage Roadmap Phase 4
type: testing
date: 2026-03-25
status: completed
---

# Non React Coverage Roadmap Phase 4

## Goal

Freeze the last defensible non-React cleanup queue after the Phase 3 burn-down and the stale file-list fix.

## Lock Rules

- Phase: temporary non-React cut only.
- Frozen threshold: use [2026-03-25-coverage-priority-files-testing-review-non-react-post-phase-3.tsv](docs/plans/2026-03-25-coverage-priority-files-testing-review-non-react-post-phase-3.tsv) as source of truth.
- Tier 1 is every remaining `score >= 5` file.
- Tier 2 is optional cleanup from the best `score = 4` files below.
- Keep the queue file-first.
- Do not collapse this back into package sweeps.
- Future passes should mark items `done`, `removed`, or `deferred`. Do not reshuffle the whole thing unless the candidate set materially changes again.

## Execution Policy

- Finish **Tier 1** only if you still want one last non-React lap.
- **Tier 2** is optional polish, not a mandate.
- After Tier 1 or Tier 2, stop non-React coverage and move on.

## Tier 1: Execute Now

1. `[done]` `5` [docxListToList.ts](packages/docx/src/lib/docx-cleaner/utils/docxListToList.ts)
2. `[done]` `5` [BaseCodePlugin.ts](packages/basic-nodes/src/lib/BaseCodePlugin.ts)
3. `[done]` `5` [BaseStrikethroughPlugin.ts](packages/basic-nodes/src/lib/BaseStrikethroughPlugin.ts)
4. `[done]` `5` [BaseItalicPlugin.ts](packages/basic-nodes/src/lib/BaseItalicPlugin.ts)
5. `[done]` `5` [BaseUnderlinePlugin.ts](packages/basic-nodes/src/lib/BaseUnderlinePlugin.ts)

## Tier 2: Optional Cleanup

1. `[done]` `4` [getSelectedCellsBorders.ts](packages/table/src/lib/queries/getSelectedCellsBorders.ts)
2. `[done]` `4` [AutoformatPlugin.ts](packages/autoformat/src/lib/AutoformatPlugin.ts)
3. `[done]` `4` [DebugPlugin.ts](packages/core/src/lib/plugins/debug/DebugPlugin.ts)
4. `[done]` `4` [get-package-manager.ts](packages/udecode/depset/src/utils/get-package-manager.ts)
5. `[done]` `4` [getCellIndices.ts](packages/table/src/lib/utils/getCellIndices.ts)
6. `[done]` `4` [BaseBoldPlugin.ts](packages/basic-nodes/src/lib/BaseBoldPlugin.ts)
7. `[done]` `4` [deleteText.ts](packages/slate/src/internal/transforms/deleteText.ts)

## Deferred By Design

- `[deferred]` score-4 Slate DOM-editor helpers like [hasDOMNode.ts](packages/slate/src/internal/dom-editor/hasDOMNode.ts)
  Reason: DOM-only seam. Real code, wrong phase.
- `[deferred]` score-4 schema dust like [settings.ts](packages/docx-io/src/lib/internal/schemas/settings.ts)
  Reason: low-signal data/schema constants. Bad ROI.
- `[deferred]` [html-to-docx.ts](packages/docx-io/src/lib/internal/html-to-docx.ts)
  Reason: giant serializer sludge. Bad final non-React spend.
- `[deferred]` [BasePlugin.ts](packages/core/src/lib/plugin/BasePlugin.ts) and similar core foundation slabs
  Reason: broad rearchitecture target, not a good late coverage slice.
- `[deferred]` utility dust like [isTouchEvent.ts](packages/resizable/src/utils/isTouchEvent.ts)
  Reason: uncovered, but not worth touching.

## Update Rule

- When a file gets direct tests, flip it to `[done]`.
- When a file proves fake ROI, flip it to `[deferred]` with a reason.
- When a file disappears, flip it to `[removed]`.
- Do not reshuffle the queue because a fresh pass had a new vibe.
