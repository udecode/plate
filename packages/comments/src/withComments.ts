import {
  PlateEditor,
  unsetNodes,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common';
import { removeCommentMark } from './transforms/removeCommentMark';
import { getCommentCount } from './utils/getCommentCount';
import { MARK_COMMENT } from './constants';
import { CommentsPlugin } from './types';

export const withComments = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  plugin: WithPlatePlugin<CommentsPlugin, V, E>
) => {
  const { normalizeNode, insertBreak } = editor;

  editor.insertBreak = () => {
    removeCommentMark(editor);

    insertBreak();
  };

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // Unset MARK_COMMENT prop when there is no comments
    if (node[MARK_COMMENT]) {
      if (getCommentCount(node as any) < 1) {
        unsetNodes(editor, MARK_COMMENT, { at: path });
        return;
      }
    }

    normalizeNode(entry);
  };

  return editor;
};
