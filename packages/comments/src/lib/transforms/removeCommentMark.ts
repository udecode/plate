import type { SlateEditor } from '@udecode/plate';

import { BaseCommentsPlugin } from '../BaseCommentsPlugin';
import { getCommentKeys } from '../utils';

export const removeCommentMark = (editor: SlateEditor) => {
  const nodeEntry = editor.getApi(BaseCommentsPlugin).comment.node();

  if (!nodeEntry) return;

  const keys = getCommentKeys(nodeEntry[0]);

  editor.tf.withoutNormalizing(() => {
    keys.forEach((key) => {
      editor.tf.removeMark(key);
    });

    editor.tf.removeMark(BaseCommentsPlugin.key);
  });
};
