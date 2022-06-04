import {
  getAbove,
  getPluginType,
  isEnd,
  isStart,
  PlateEditor,
  TAncestor,
} from '@udecode/plate-core';
import { Range } from 'slate';
import { ELEMENT_THREAD } from './createThreadPlugin';
import { insertTextAtTheEndOfAThreadNode } from './insertTextAtTheEndOfAThreadNode';
import { insertTextAtTheStartOfAThreadNode } from './insertTextAtTheStartOfAThreadNode';
import { ThreadNode } from './types';

export function insertTextThreadPlugin(
  editor: PlateEditor,
  insertText: (text: string) => void,
  text: string
): void {
  let insertHasBeenHandled = false;

  if (editor.selection && Range.isCollapsed(editor.selection)) {
    const threadType = getPluginType(editor, ELEMENT_THREAD);
    const threadNodeEntry = getAbove<ThreadNode & TAncestor>(editor, {
      match: {
        type: threadType,
      },
    });
    if (threadNodeEntry) {
      const focusPoint = editor.selection.focus;
      const [, threadPath] = threadNodeEntry;
      if (isStart(editor, focusPoint, threadPath)) {
        insertHasBeenHandled = insertTextAtTheStartOfAThreadNode(
          editor,
          threadPath,
          text
        );
      } else if (isEnd(editor, focusPoint, threadPath)) {
        insertHasBeenHandled = insertTextAtTheEndOfAThreadNode(
          editor,
          threadPath,
          text
        );
      }
    }
  }

  if (!insertHasBeenHandled) {
    insertText(text);
  }
}
