import { type OverrideEditor, RangeApi, TextApi } from '@udecode/plate';

import type { CommentsPluginConfig } from './BaseCommentsPlugin';

import { removeCommentMark } from './transforms';
import { getCommentCount, getDraftCommentKey, isCommentText } from './utils';

export const withComments: OverrideEditor<CommentsPluginConfig> = ({
  editor,
  setOption,
  tf: { apply, insertBreak },
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
      if (operation.type === 'set_selection') {
        const { properties } = operation;

        if (!properties?.focus) return apply(operation);

        try {
          if (RangeApi.isExpanded(properties as any)) {
            return apply(operation);
          }
        } catch {
          return apply(operation);
        }

        const commentEntry = editor.api.node({
          at: operation.properties.focus,
          match: (n) => TextApi.isText(n) && isCommentText(n),
        });

        if (!commentEntry) return apply(operation);

        const [node, path] = commentEntry;

        // Unset MARK_COMMENT prop when there is no comments
        if (node[type] && getCommentCount(node as any) < 1) {
          editor.tf.unsetNodes([type, getDraftCommentKey()], { at: path });
        }
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
  },
});
