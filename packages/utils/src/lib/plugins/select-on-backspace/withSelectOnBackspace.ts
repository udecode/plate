import type { OverrideEditor } from '@udecode/plate-core';

import { NodeApi, queryNode } from '@udecode/slate';

import type { SelectOnBackspaceConfig } from './SelectOnBackspacePlugin';

/** Set a list of element types to select on backspace */
export const withSelectOnBackspace: OverrideEditor<SelectOnBackspaceConfig> = ({
  editor,
  getOptions,
  tf: { deleteBackward },
}) => ({
  transforms: {
    deleteBackward(unit) {
      const { query, removeNodeIfEmpty } = getOptions();

      const apply = () => {
        if (
          unit === 'character' &&
          editor.selection &&
          editor.api.isCollapsed()
        ) {
          const pointBefore = editor.api.before(editor.selection, {
            unit: unit,
          });

          if (pointBefore) {
            const prevNode = editor.api.node({
              at: pointBefore,
              match: (node) => queryNode([node, pointBefore.path], query),
            });

            if (prevNode) {
              if (removeNodeIfEmpty) {
                const selectedNode = NodeApi.get(
                  editor,
                  editor.api.point(editor.selection)!.path
                );

                if (selectedNode && editor.api.isEmpty(selectedNode)) {
                  // remove node if empty
                  editor.tf.removeNodes();
                }
              }

              // Select previous block instead of deleting
              editor.tf.select(pointBefore);
              return true;
            }
          }
        }
      };

      if (apply()) {
        return;
      }

      deleteBackward(unit);
    },
  },
});
