import type { OverrideEditor } from '@platejs/core';

import { PathApi, queryNode } from '@platejs/slate';

import { KEYS } from '../../plate-keys';
import type { TrailingBlockConfig } from './TrailingBlockPlugin';

/**
 * Add a trailing block when the last node type is not `type` and when the
 * editor has .
 */
export const withTrailingBlock: OverrideEditor<TrailingBlockConfig> = ({
  editor,
  getOptions,
  tf: { normalizeNode },
}) => ({
  transforms: {
    normalizeNode([currentNode, currentPath]) {
      const { insert, level, type, ...query } = getOptions();
      const trailingType = type ?? editor.getType(KEYS.p);

      if (currentPath.length === 0) {
        const lastChild = editor.api.last([], { level });
        const lastChildNode = lastChild?.[0];

        if (
          !lastChildNode ||
          (lastChildNode.type !== trailingType && queryNode(lastChild, query))
        ) {
          const at = lastChild ? PathApi.next(lastChild[1]) : [0];
          const insertTrailingBlock = () => {
            editor.tf.insertNodes(
              editor.api.create.block({ type: trailingType }, at),
              { at }
            );
          };

          if (insert) {
            insert(editor, {
              at,
              insert: insertTrailingBlock,
              type: trailingType,
            });
          } else {
            insertTrailingBlock();
          }

          return;
        }
      }

      return normalizeNode([currentNode, currentPath]);
    },
  },
});
