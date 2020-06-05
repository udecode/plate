import isHotkey from 'is-hotkey';
import { Editor, Path, Transforms } from 'slate';
import {
  getBlockAboveSelection,
  isNodeType,
  isSelectionAtBlockEnd,
  isSelectionAtBlockStart,
} from '../../common/queries';
import { isExpanded } from '../../common/queries/isExpanded';
import { DEFAULT_ELEMENT } from '../../element';
import { ExitBreakOnKeyDownOptions } from './types';

/**
 * Check if the selection is at the edge of its parent block.
 * If it is and if the selection is expanded, delete its content.
 */
export const exitBreakAtEdges = (
  editor: Editor,
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

export const onKeyDownExitBreak = ({
  rules = [
    { hotkey: 'mod+enter' },
    { hotkey: 'mod+shift+enter', before: true },
  ],
}: ExitBreakOnKeyDownOptions = {}) => (
  event: KeyboardEvent,
  editor: Editor
) => {
  const entry = getBlockAboveSelection(editor);

  rules.forEach(
    ({
      hotkey,
      query: { start, end, ...query } = {},
      level = 1,
      before,
      defaultType = DEFAULT_ELEMENT,
    }) => {
      if (isHotkey(hotkey, event) && isNodeType(entry, query)) {
        if (!editor.selection) return;

        const { queryEdge, isEdge, isStart } = exitBreakAtEdges(editor, {
          start,
          end,
        });
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

        Transforms.insertNodes(
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
