import {
  ELEMENT_DEFAULT,
  getBlockAbove,
  getPluginType,
  insertNodes,
  isExpanded,
  isSelectionAtBlockEnd,
  isSelectionAtBlockStart,
  KeyboardHandler,
  queryNode,
  TEditor,
  TElement,
} from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { Editor, Path } from 'slate';
import { ExitBreakPlugin } from './types';

/**
 * Check if the selection is at the edge of its parent block.
 * If it is and if the selection is expanded, delete its content.
 */
export const exitBreakAtEdges = (
  editor: TEditor,
  {
    start,
    end,
  }: {
    start?: boolean;
    end?: boolean;
  }
) => {
  let queryEdge = false;
  let isEdge = false;
  let isStart = false;
  if (start || end) {
    queryEdge = true;

    if (start && isSelectionAtBlockStart(editor)) {
      isEdge = true;
      isStart = true;
    }

    if (end && isSelectionAtBlockEnd(editor)) {
      isEdge = true;
    }

    if (isEdge && isExpanded(editor.selection)) {
      editor.deleteFragment();
    }
  }

  return {
    queryEdge,
    isEdge,
    isStart,
  };
};

export const onKeyDownExitBreak: KeyboardHandler<{}, ExitBreakPlugin> = (
  editor,
  { options: { rules = [] } }
) => (event) => {
  const entry = getBlockAbove(editor);
  if (!entry) return;

  rules.forEach(
    ({
      hotkey,
      query = {},
      level = 0,
      before,
      defaultType = getPluginType(editor, ELEMENT_DEFAULT),
    }) => {
      if (isHotkey(hotkey, event as any) && queryNode(entry, query)) {
        if (!editor.selection) return;

        const { queryEdge, isEdge, isStart } = exitBreakAtEdges(editor, query);
        if (isStart) before = true;

        if (queryEdge && !isEdge) return;

        event.preventDefault();

        const selectionPath = Editor.path(editor, editor.selection);

        let insertPath;
        if (before) {
          insertPath = selectionPath.slice(0, level + 1);
        } else {
          insertPath = Path.next(selectionPath.slice(0, level + 1));
        }

        insertNodes<TElement>(
          editor,
          { type: defaultType, children: [{ text: '' }] },
          {
            at: insertPath,
            select: !isStart,
          }
        );
      }
    }
  );
};
