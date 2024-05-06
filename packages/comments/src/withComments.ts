import {
  type PlateEditor,
  type Value,
  type WithPlatePlugin,
  unsetNodes,
} from '@udecode/plate-common/server';

import type { CommentsPlugin } from './types';

import { MARK_COMMENT } from './constants';
import { removeCommentMark } from './transforms/removeCommentMark';
import { getCommentCount } from './utils/getCommentCount';

export const withComments = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  _plugin: WithPlatePlugin<CommentsPlugin, V, E>
) => {
  const { insertBreak, normalizeNode } = editor;

  editor.insertBreak = () => {
    removeCommentMark(editor);

    insertBreak();
  };

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // Unset MARK_COMMENT prop when there is no comments
    if (node[MARK_COMMENT] && getCommentCount(node as any) < 1) {
      unsetNodes(editor, MARK_COMMENT, { at: path });

      return;
    }

    normalizeNode(entry);
  };

  return editor;
};
