import type Slate from 'slate';

import {
  type WithOverride,
  getNode,
  getNodeEntries,
  getNodeString,
  getPoint,
  getPointBefore,
  isCollapsed,
  queryNode,
  removeNodes,
  select,
} from '@udecode/plate-common';

import type { SelectOnBackspaceConfig } from './SelectOnBackspacePlugin';

/** Set a list of element types to select on backspace */
export const withSelectOnBackspace: WithOverride<SelectOnBackspaceConfig> = ({
  editor,
  options: { query, removeNodeIfEmpty },
}) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (unit: 'block' | 'character' | 'line' | 'word') => {
    const { selection } = editor;

    if (unit === 'character' && isCollapsed(selection)) {
      const pointBefore = getPointBefore(editor, selection as Slate.Location, {
        unit,
      });

      if (pointBefore) {
        const [prevCell] = getNodeEntries(editor, {
          at: pointBefore,
          match: (node) => queryNode([node, pointBefore.path], query),
        });

        if (!!prevCell && pointBefore) {
          const point = getPoint(editor, selection as Slate.Location);
          const selectedNode = getNode(editor, point.path);

          if (
            removeNodeIfEmpty &&
            selectedNode &&
            !getNodeString(selectedNode as any)
          ) {
            // remove node if empty
            removeNodes(editor);
          }

          // don't delete image, set selection there
          select(editor, pointBefore);
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
