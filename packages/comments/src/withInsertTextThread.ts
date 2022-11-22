import {
  getAboveNode,
  getPluginType,
  isEndPoint,
  isStartPoint,
  PlateEditor,
  TAncestor,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-core';
import { TablePlugin } from '@udecode/plate-table/src/index';
import { Range } from 'slate';
import { insertTextAtThreadNodeEnd } from './transforms/insertTextAtThreadNodeEnd';
import { insertTextAtThreadNodeStart } from './transforms/insertTextAtThreadNodeStart';
import { ELEMENT_THREAD } from './createThreadPlugin';
import { TThreadElement } from './types';

export const withInsertTextThread = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  plugin: WithPlatePlugin<TablePlugin<V>, V, E>
) => {
  const { insertText } = editor;

  editor.insertText = (text) => {
    let insertHasBeenHandled = false;

    if (editor.selection && Range.isCollapsed(editor.selection)) {
      const threadType = getPluginType(editor, ELEMENT_THREAD);
      const threadNodeEntry = getAboveNode<TThreadElement & TAncestor>(editor, {
        match: {
          type: threadType,
        },
      });
      if (threadNodeEntry) {
        const focusPoint = editor.selection.focus;
        const [, threadPath] = threadNodeEntry;
        if (isStartPoint(editor, focusPoint, threadPath)) {
          insertHasBeenHandled = insertTextAtThreadNodeStart(editor, {
            at: threadPath,
            text,
          });
        } else if (isEndPoint(editor, focusPoint, threadPath)) {
          insertHasBeenHandled = insertTextAtThreadNodeEnd(
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
  };

  return editor;
};
