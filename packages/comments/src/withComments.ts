import {
  PlateEditor,
  unsetNodes,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common/server';

import { MARK_COMMENT } from './constants';
import { removeCommentMark } from './transforms/removeCommentMark';
import { CommentsPlugin } from './types';
import { getCommentCount } from './utils/getCommentCount';

export const withComments = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  // eslint-disable-next-line unused-imports/no-unused-vars
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
    if (node[MARK_COMMENT] && getCommentCount(node as any) < 1) {
      unsetNodes(editor, MARK_COMMENT, { at: path });
      return;
    }

    normalizeNode(entry);
  };

  return editor;
};
