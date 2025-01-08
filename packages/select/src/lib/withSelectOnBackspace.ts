import {
  type ExtendEditorTransforms,
  NodeApi,
  queryNode,
} from '@udecode/plate';

import type { SelectOnBackspaceConfig } from './SelectOnBackspacePlugin';

/** Set a list of element types to select on backspace */
export const withSelectOnBackspace: ExtendEditorTransforms<
  SelectOnBackspaceConfig
> = ({ editor, getOptions, tf: { deleteBackward } }) => ({
  deleteBackward(options) {
    const { selection } = editor;
    const { query, removeNodeIfEmpty } = getOptions();

    if (options?.unit === 'character' && editor.api.isCollapsed()) {
      const pointBefore = editor.api.before(selection!, {
        unit: options.unit,
      });

      if (pointBefore) {
        const [prevCell] = editor.api.nodes({
          at: pointBefore,
          match: (node) => queryNode([node, pointBefore.path], query),
        });

        if (!!prevCell && pointBefore) {
          const point = editor.api.point(selection!)!;
          const selectedNode = NodeApi.get(editor, point.path);

          if (
            removeNodeIfEmpty &&
            selectedNode &&
            !NodeApi.string(selectedNode as any)
          ) {
            // remove node if empty
            editor.tf.removeNodes();
          }

          // don't delete image, set selection there
          editor.tf.select(pointBefore);
        } else {
          deleteBackward(options);
        }
      } else {
        deleteBackward(options);
      }
    } else {
      deleteBackward(options);
    }
  },
});
