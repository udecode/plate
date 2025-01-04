import type Slate from 'slate';

import {
  type ExtendEditor,
  getNode,
  getNodeString,
  queryNode,
} from '@udecode/plate-common';

import type { SelectOnBackspaceConfig } from './SelectOnBackspacePlugin';

/** Set a list of element types to select on backspace */
export const withSelectOnBackspace: ExtendEditor<SelectOnBackspaceConfig> = ({
  editor,
  getOptions,
}) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (unit: 'block' | 'character' | 'line' | 'word') => {
    const { selection } = editor;
    const { query, removeNodeIfEmpty } = getOptions();

    if (unit === 'character' && editor.api.isCollapsed()) {
      const pointBefore = editor.api.before(selection!, {
        unit,
      });

      if (pointBefore) {
        const [prevCell] = editor.api.nodes({
          at: pointBefore,
          match: (node) => queryNode([node, pointBefore.path], query),
        });

        if (!!prevCell && pointBefore) {
          const point = editor.api.point(selection as Slate.Location)!;
          const selectedNode = getNode(editor, point.path);

          if (
            removeNodeIfEmpty &&
            selectedNode &&
            !getNodeString(selectedNode as any)
          ) {
            // remove node if empty
            editor.tf.removeNodes();
          }

          // don't delete image, set selection there
          editor.tf.select(pointBefore);
        } else {
          deleteBackward(unit);
        }
      } else {
        deleteBackward(unit);
      }
    } else {
      deleteBackward(unit);
    }
  };

  return editor;
};
