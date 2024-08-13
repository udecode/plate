import { type PlateEditor, withoutNormalizing } from '@udecode/plate-common';

import { CommentsPlugin } from '../CommentsPlugin';
import { findCommentNode } from '../queries/index';
import { getCommentKeys } from '../utils/index';

export const removeCommentMark = (editor: PlateEditor) => {
  const nodeEntry = findCommentNode(editor);

  if (!nodeEntry) return;

  const keys = getCommentKeys(nodeEntry[0]);

  withoutNormalizing(editor, () => {
    keys.forEach((key) => {
      editor.removeMark(key);
    });

    editor.removeMark(CommentsPlugin.key);
  });
};
