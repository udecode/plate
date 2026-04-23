---
title: Non React Coverage Roadmap Phase 2
type: testing
date: 2026-03-24
status: completed
---

# Non React Coverage Roadmap Phase 2

## Goal

Freeze the last worthwhile non-React cleanup batch so future passes stop re-ranking the same leftovers and just burn down the queue.

## Lock Rules

- Phase: temporary non-React cut only.
- Frozen threshold: start from the fresh [2026-03-24-coverage-priority-files-testing-review-non-react-post-roadmap.tsv](docs/plans/2026-03-24-coverage-priority-files-testing-review-non-react-post-roadmap.tsv), but do not blindly execute every `score >= 5` file.
- Keep the queue file-first.
- Do not reshuffle unless:
  - a file is deleted
  - a file becomes fully covered by direct tests
  - a file proves to be fake ROI and gets deferred on purpose

## Execution Policy

- Finish **Tier 1** in order.
- Do **Tier 2** only if we still want more non-React work after Tier 1.
- After Tier 2, stop non-React coverage and move on.

## Tier 1: Execute Now

1. `[done]` `7` [htmlDeserializerCodeBlock.ts](packages/code-block/src/lib/deserializer/htmlDeserializerCodeBlock.ts)
2. `[done]` `7` [HtmlPlugin.ts](packages/core/src/lib/plugins/html/HtmlPlugin.ts)
3. `[done]` `7` [htmlStringToEditorDOM.ts](packages/core/src/static/deserialize/htmlStringToEditorDOM.ts)
4. `[done]` `6` [pluginRenderTextStatic.tsx](packages/core/src/static/pluginRenderTextStatic.tsx)
5. `[done]` `6` [ParserPlugin.ts](packages/core/src/lib/plugins/ParserPlugin.ts)
6. `[done]` `6` [pipeDecorate.ts](packages/core/src/static/utils/pipeDecorate.ts)
7. `[done]` `6` [BaseExcalidrawPlugin.ts](packages/excalidraw/src/lib/BaseExcalidrawPlugin.ts)
8. `[done]` `6` [ViewPlugin.ts](packages/core/src/static/plugins/ViewPlugin.ts)

## Tier 2: Still Worth Doing

1. `[done]` `5` [getSelectedDomFragment.tsx](packages/core/src/static/utils/getSelectedDomFragment.tsx)
2. `[done]` `5` [pluginRenderLeafStatic.tsx](packages/core/src/static/pluginRenderLeafStatic.tsx)
3. `[done]` `5` [withScrolling.ts](packages/core/src/lib/plugins/dom/withScrolling.ts)
4. `[done]` `5` [pluginRenderElementStatic.tsx](packages/core/src/static/pluginRenderElementStatic.tsx)
5. `[done]` `5` [onDropNode.ts](packages/dnd/src/transforms/onDropNode.ts)
6. `[done]` `5` [htmlElementToLeaf.ts](packages/core/src/lib/plugins/html/utils/htmlElementToLeaf.ts)
7. `[done]` `5` [AstPlugin.ts](packages/core/src/lib/plugins/AstPlugin.ts)
8. `[done]` `5` [upsertLink.ts](packages/link/src/lib/transforms/upsertLink.ts)
9. `[done]` `5` [convertNodesSerialize.ts](packages/markdown/src/lib/serializer/convertNodesSerialize.ts)

## Deferred By Design

- `[deferred]` `5` [isEditOnlyDisabled.ts](packages/core/src/internal/plugin/isEditOnlyDisabled.ts)
  Reason: one-line partial gap. Not worth a dedicated trip unless a nearby Tier 1 spec naturally closes it.
- `[deferred]` `5` [pipeInjectNodeProps.tsx](packages/core/src/internal/plugin/pipeInjectNodeProps.tsx)
  Reason: same story. Tiny leftover, not a real phase driver.
- `[deferred]` `4` [html-to-docx.ts](packages/docx-io/src/lib/internal/html-to-docx.ts)
  Reason: giant serializer sludge. Bad ROI for the last non-React pass.
- `[deferred]` `4` [font-table.ts](packages/docx-io/src/lib/internal/schemas/font-table.ts)
  Reason: schema boilerplate.
- `[deferred]` `4` [content-types.ts](packages/docx-io/src/lib/internal/schemas/content-types.ts)
  Reason: schema boilerplate.
- `[deferred]` `4` [focus.ts](packages/slate/src/internal/dom-editor/focus.ts)
  Reason: DOM-ish utility crumb. Save it for a DOM-focused phase if it ever matters.
- `[deferred]` `4` [useRecordHotkeys.ts](packages/udecode/react-hotkeys/src/internal/useRecordHotkeys.ts)
  Reason: not in `/react`, but still close enough to React-side behavior that it can wait for the React phase.
- `[deferred]` `4` [AutoformatPlugin.ts](packages/autoformat/src/lib/AutoformatPlugin.ts)
  Reason: small partial gap only. Not worth pulling ahead of the stricter queue.

## Update Rule

- When a file gets direct tests, flip it to `[done]`.
- When a file proves to be fake ROI, flip it to `[deferred]` with a reason.
- When a file disappears, flip it to `[removed]`.
- Do not reshuffle the queue because a fresh pass had a new vibe.
