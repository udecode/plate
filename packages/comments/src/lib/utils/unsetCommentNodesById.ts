import type { PlateEditor } from '@udecode/plate/react';

import type { TCommentText } from '../types';

import { BaseCommentsPlugin } from '../BaseCommentsPlugin';
import { getCommentNodesById } from '../queries';
import { getCommentKey } from './getCommentKey';
import { getDraftCommentKey } from './getDraftCommentKey';
import { hasManyComments } from './hasManyComments';

export const unsetCommentMark = (
  editor: PlateEditor,
  { id }: { id: string }
) => {
  const nodes = getCommentNodesById(editor, id);

  if (!nodes) return;

  nodes.forEach(([node]) => {
    const isOverlapping = hasManyComments(node);

    let unsetKeys: string[] = [];

    if (isOverlapping) {
      unsetKeys = [getDraftCommentKey(), getCommentKey(id)];
    } else {
      unsetKeys = [
        BaseCommentsPlugin.key,
        getDraftCommentKey(),
        getCommentKey(id),
      ];
    }

    editor.tf.unsetNodes<TCommentText>(unsetKeys, {
      at: [],
      match: (n) => n === node,
    });
  });
};
