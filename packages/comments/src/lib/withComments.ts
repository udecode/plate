import type { OverrideEditor } from '@udecode/plate';

import type { CommentsPluginConfig } from './BaseCommentsPlugin';
import type { TCommentText } from './types';

import { BaseCommentsPlugin } from './BaseCommentsPlugin';
import { removeCommentMark } from './transforms';
import { getCommentCount, getDraftCommentKey } from './utils';

export const withComments: OverrideEditor<CommentsPluginConfig> = ({
  editor,
  setOption,
  tf: { apply, insertBreak, normalizeNode },
  type,
}) => ({
  transforms: {
    apply(operation) {
      if (
        operation.type !== 'set_selection' &&
        operation.type !== 'set_node' &&
        operation.type !== 'split_node' &&
        operation.type !== 'merge_node'
      ) {
        const { newProperties, properties } = operation;
        if (
          // REVIEW
          (properties as Record<string, unknown>)?.[getDraftCommentKey()] ||
          (newProperties as Record<string, unknown>)?.[getDraftCommentKey()]
        )
          return;

        setOption('updateTimestamp', Date.now());
      }

      apply(operation);
    },

    insertBreak() {
      setOption('updateTimestamp', Date.now());

      removeCommentMark(editor);
      insertBreak();
      editor.tf.unsetNodes([type], {
        at: editor.selection?.focus,
        mode: 'lowest',
      });
    },
    normalizeNode(entry) {
      const [node, path] = entry;

      if (
        node[BaseCommentsPlugin.key] &&
        !node[getDraftCommentKey()] &&
        getCommentCount(node as TCommentText) < 1
      ) {
        editor.tf.unsetNodes(BaseCommentsPlugin.key, { at: path });

        return;
      }

      return normalizeNode(entry);
    },
  },
});
