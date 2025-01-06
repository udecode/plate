import type { SlateEditor } from '@udecode/plate';

import { BaseCommentsPlugin } from '../BaseCommentsPlugin';
import { findCommentNode } from '../queries/index';
import { getCommentKeys } from '../utils';

export const removeCommentMark = (editor: SlateEditor) => {
  const nodeEntry = findCommentNode(editor);

  if (!nodeEntry) return;

  const keys = getCommentKeys(nodeEntry[0]);

  editor.tf.withoutNormalizing(() => {
    keys.forEach((key) => {
      editor.removeMark(key);
    });

    editor.removeMark(BaseCommentsPlugin.key);
  });
};
