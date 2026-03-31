---
title: Full Repo Coverage Roadmap
type: testing
date: 2026-03-24
status: completed
---

# Full Repo Coverage Roadmap

## Goal

Freeze the remaining high-ROI whole-repo coverage work into one stable roadmap now that the non-React phase is finished.

## Lock Rules

- Phase: full repo, including React.
- Frozen threshold: raw score `>= 8` from [2026-03-24-coverage-priority-files-testing-review-full-repo.tsv](/Users/zbeyens/git/plate/docs/plans/2026-03-24-coverage-priority-files-testing-review-full-repo.tsv).
- Queue is file-first. Do not collapse this back into package sweeps.
- Future passes should mark items `done`, `removed`, or `deferred`. Do not reshuffle the whole roadmap unless:
  - a file is deleted
  - a file drops below the threshold because it already has direct coverage
  - architecture work makes a queued file obviously not worth touching anymore

## Execution Policy

- Finish **Tier 1** first. That is every remaining `score >= 9` file.
- Then finish **Tier 2**. That is every remaining `score = 8` file.
- Stop and rerun coverage before touching the score-7 ring.

## Tier 1: Execute Now

1. `[done]` `10` [applyAISuggestions.ts](/Users/zbeyens/git/plate/packages/ai/src/react/ai-chat/utils/applyAISuggestions.ts)
2. `[done]` `10` [useCursorOverlay.ts](/Users/zbeyens/git/plate/packages/selection/src/react/hooks/useCursorOverlay.ts)
3. `[done]` `10` [submitAIChat.ts](/Users/zbeyens/git/plate/packages/ai/src/react/ai-chat/utils/submitAIChat.ts)
4. `[done]` `10` [useTocSideBar.ts](/Users/zbeyens/git/plate/packages/toc/src/react/hooks/useTocSideBar.ts)
5. `[done]` `10` [callCompletionApi.ts](/Users/zbeyens/git/plate/packages/ai/src/react/copilot/utils/callCompletionApi.ts)
6. `[done]` `10` [useBlockSelectable.ts](/Users/zbeyens/git/plate/packages/selection/src/react/hooks/useBlockSelectable.ts)
7. `[done]` `10` [EmojiFloatingLibrary.ts](/Users/zbeyens/git/plate/packages/emoji/src/react/utils/EmojiLibrary/EmojiFloatingLibrary.ts)
8. `[done]` `10` [getSelectionRects.ts](/Users/zbeyens/git/plate/packages/selection/src/react/queries/getSelectionRects.ts)
9. `[done]` `10` [applyTableCellSuggestion.ts](/Users/zbeyens/git/plate/packages/ai/src/react/ai-chat/utils/applyTableCellSuggestion.ts)
10. `[done]` `10` [triggerCopilotSuggestion.ts](/Users/zbeyens/git/plate/packages/ai/src/react/copilot/utils/triggerCopilotSuggestion.ts)
11. `[done]` `10` [triggerFloatingLinkInsert.ts](/Users/zbeyens/git/plate/packages/link/src/react/utils/triggerFloatingLinkInsert.ts)
12. `[done]` `10` [acceptAISuggestions.ts](/Users/zbeyens/git/plate/packages/ai/src/react/ai-chat/utils/acceptAISuggestions.ts)
13. `[done]` `10` [rejectAISuggestions.ts](/Users/zbeyens/git/plate/packages/ai/src/react/ai-chat/utils/rejectAISuggestions.ts)
14. `[done]` `10` [resetAIChat.ts](/Users/zbeyens/git/plate/packages/ai/src/react/ai-chat/utils/resetAIChat.ts)
15. `[done]` `10` [getCursorOverlayState.ts](/Users/zbeyens/git/plate/packages/selection/src/react/queries/getCursorOverlayState.ts)
16. `[done]` `10` [getCaretPosition.ts](/Users/zbeyens/git/plate/packages/selection/src/react/queries/getCaretPosition.ts)
17. `[done]` `9` [useSelectionArea.ts](/Users/zbeyens/git/plate/packages/selection/src/react/hooks/useSelectionArea.ts)
18. `[done]` `9` [useComboboxInput.ts](/Users/zbeyens/git/plate/packages/combobox/src/react/hooks/useComboboxInput.ts)
19. `[done]` `9` [useEquationInput.ts](/Users/zbeyens/git/plate/packages/math/src/react/hooks/useEquationInput.ts)
20. `[done]` `9` [useEmojiPickerState.ts](/Users/zbeyens/git/plate/packages/emoji/src/react/hooks/useEmojiPickerState.ts)
21. `[done]` `9` [useContentController.ts](/Users/zbeyens/git/plate/packages/toc/src/react/hooks/useContentController.ts)
22. `[done]` `9` [useContentObserver.ts](/Users/zbeyens/git/plate/packages/toc/src/react/hooks/useContentObserver.ts)
23. `[done]` `9` [useChatChunk.ts](/Users/zbeyens/git/plate/packages/ai/src/react/ai-chat/hooks/useChatChunk.ts)
24. `[done]` `9` [EmojiFloatingGridBuilder.ts](/Users/zbeyens/git/plate/packages/emoji/src/react/utils/EmojiLibrary/EmojiFloatingGridBuilder.ts)
25. `[done]` `9` [useTableMergeState.ts](/Users/zbeyens/git/plate/packages/table/src/react/hooks/useTableMergeState.ts)
26. `[done]` `9` [useEditorChat.ts](/Users/zbeyens/git/plate/packages/ai/src/react/ai-chat/hooks/useEditorChat.ts)
27. `[done]` `9` [useTocObserver.ts](/Users/zbeyens/git/plate/packages/toc/src/react/hooks/useTocObserver.ts)
28. `[done]` `9` [history.ts](/Users/zbeyens/git/plate/packages/media/src/react/placeholder/utils/history.ts)
29. `[done]` `9` [useRequestReRender.ts](/Users/zbeyens/git/plate/packages/selection/src/react/hooks/useRequestReRender.ts)
30. `[done]` `9` [useAIChatEditor.ts](/Users/zbeyens/git/plate/packages/ai/src/react/ai-chat/hooks/useAIChatEditor.ts)
31. `[done]` `9` [useRefreshOnResize.ts](/Users/zbeyens/git/plate/packages/selection/src/react/hooks/useRefreshOnResize.ts)
32. `[done]` `9` [useTocController.ts](/Users/zbeyens/git/plate/packages/toc/src/react/hooks/useTocController.ts)
33. `[done]` `9` [EmojiFloatingGrid.ts](/Users/zbeyens/git/plate/packages/emoji/src/react/utils/EmojiLibrary/EmojiFloatingGrid.ts)
34. `[done]` `9` [triggerFloatingLinkEdit.ts](/Users/zbeyens/git/plate/packages/link/src/react/utils/triggerFloatingLinkEdit.ts)
35. `[done]` `9` [triggerFloatingLink.ts](/Users/zbeyens/git/plate/packages/link/src/react/utils/triggerFloatingLink.ts)
36. `[done]` `9` [getListNode.ts](/Users/zbeyens/git/plate/packages/ai/src/react/ai-chat/streaming/utils/getListNode.ts)
37. `[done]` `9` [isSameNode.ts](/Users/zbeyens/git/plate/packages/ai/src/react/ai-chat/streaming/utils/isSameNode.ts)
38. `[done]` `9` [getLastEntryEnclosedInToggle.ts](/Users/zbeyens/git/plate/packages/toggle/src/react/queries/getLastEntryEnclosedInToggle.ts)
39. `[done]` `9` [selectInsertedBlocks.ts](/Users/zbeyens/git/plate/packages/selection/src/react/utils/selectInsertedBlocks.ts)
40. `[done]` `9` [isInClosedToggle.ts](/Users/zbeyens/git/plate/packages/toggle/src/react/queries/isInClosedToggle.ts)

## Tier 2: Still Worth Doing

1. `[done]` `8` [useEmojiPicker.ts](/Users/zbeyens/git/plate/packages/emoji/src/react/hooks/useEmojiPicker.ts)
2. `[done]` `8` [useCursorOverlayPositions.ts](/Users/zbeyens/git/plate/packages/cursor/src/hooks/useCursorOverlayPositions.ts)
3. `[done]` `8` [useExcalidrawElement.ts](/Users/zbeyens/git/plate/packages/excalidraw/src/react/hooks/useExcalidrawElement.ts)
4. `[done]` `8` [useTocElement.ts](/Users/zbeyens/git/plate/packages/toc/src/react/hooks/useTocElement.ts)
5. `[done]` `8` [EmojiObserver.ts](/Users/zbeyens/git/plate/packages/emoji/src/react/utils/EmojiObserver.ts)
6. `[done]` `8` [useHTMLInputCursorState.ts](/Users/zbeyens/git/plate/packages/combobox/src/react/hooks/useHTMLInputCursorState.ts)
7. `[done]` `8` [useEmojiDropdownMenuState.ts](/Users/zbeyens/git/plate/packages/emoji/src/react/hooks/useEmojiDropdownMenuState.ts)
8. `[done]` `8` [usePlaceholderPopover.ts](/Users/zbeyens/git/plate/packages/media/src/react/placeholder/hooks/usePlaceholderPopover.ts)
9. `[done]` `8` [useCalloutEmojiPicker.ts](/Users/zbeyens/git/plate/packages/callout/src/react/hooks/useCalloutEmojiPicker.ts)
10. `[done]` `8` [useListToolbarButton.ts](/Users/zbeyens/git/plate/packages/list/src/react/hooks/useListToolbarButton.ts)
11. `[done]` `8` [useTodoListElement.ts](/Users/zbeyens/git/plate/packages/list/src/react/hooks/useTodoListElement.ts)
12. `[done]` `8` [useTodoListToolbarButton.ts](/Users/zbeyens/git/plate/packages/list/src/react/hooks/useTodoListToolbarButton.ts)
13. `[done]` `8` [useTodoListElement.ts](/Users/zbeyens/git/plate/packages/list-classic/src/react/hooks/useTodoListElement.ts)
14. `[done]` `8` [useListToolbarButton.ts](/Users/zbeyens/git/plate/packages/list-classic/src/react/hooks/useListToolbarButton.ts)
15. `[done]` `8` [nestedContainerUtils.ts](/Users/zbeyens/git/plate/packages/ai/src/react/ai-chat/utils/nestedContainerUtils.ts)
16. `[done]` `8` [useToggleToolbarButton.ts](/Users/zbeyens/git/plate/packages/toggle/src/react/hooks/useToggleToolbarButton.ts)
17. `[done]` `8` [useToggleButton.ts](/Users/zbeyens/git/plate/packages/toggle/src/react/hooks/useToggleButton.ts)
18. `[done]` `8` [pasteSelectedBlocks.ts](/Users/zbeyens/git/plate/packages/selection/src/react/utils/pasteSelectedBlocks.ts)
19. `[done]` `8` [nodesWithProps.ts](/Users/zbeyens/git/plate/packages/ai/src/react/ai-chat/streaming/utils/nodesWithProps.ts)
20. `[done]` `8` [useBlockSelectionNodes.ts](/Users/zbeyens/git/plate/packages/selection/src/react/hooks/useBlockSelectionNodes.ts)
21. `[done]` `8` [findElementIdsHiddenInToggle.ts](/Users/zbeyens/git/plate/packages/toggle/src/react/queries/findElementIdsHiddenInToggle.ts)
22. `[done]` `8` [getLastAssistantMessage.ts](/Users/zbeyens/git/plate/packages/ai/src/react/ai-chat/utils/getLastAssistantMessage.ts)
23. `[done]` `8` [getEnclosingToggleIds.ts](/Users/zbeyens/git/plate/packages/toggle/src/react/queries/getEnclosingToggleIds.ts)

## Deferred From The Current Phase

- `[deferred]` score-7 ring and below
  Reason: still real, but the clean stop for this phase is the full `score >= 8` queue. Rerun coverage before touching the score-7 leftovers.
- `[deferred]` thin plugin entrypoints and wrapper components that still score high only because the hook cluster under them is uncovered
  Reason: the hook or util is the seam. Testing the wrapper too early is coverage cosplay.
- `[deferred]` giant architecture slabs outside this threshold, like [PlateEditor.ts](/Users/zbeyens/git/plate/packages/core/src/react/editor/PlateEditor.ts) and [getSelectedDomFragment.tsx](/Users/zbeyens/git/plate/packages/core/src/static/utils/getSelectedDomFragment.tsx)
  Reason: real seams, but not the best spend before the current React hook and util queue is finished.

## Update Rule

- When a file gets direct tests, flip it to `[done]`. Do not remove it.
- When a file is deleted or replaced, flip it to `[removed]` with a one-line note.
- When a file proves fake ROI, flip it to `[deferred]` with a reason.
- Do not reshuffle the queue because the next audit has a slightly different vibe.
