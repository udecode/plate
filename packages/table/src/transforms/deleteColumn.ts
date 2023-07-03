import {
  PlateEditor,
  TElement,
  Value,
  getAboveNode,
  getPluginType,
  removeNodes,
  setNodes,
  someNode,
  withoutNormalizing,
} from '@udecode/plate-common';

import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from '../createTablePlugin';
import { TTableElement } from '../types';

export const deleteColumn = <V extends Value>(editor: PlateEditor<V>) => {
  if (
    someNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    const tdEntry = getAboveNode(editor, {
      match: {
        type: [
          getPluginType(editor, ELEMENT_TD),
          getPluginType(editor, ELEMENT_TH),
        ],
      },
    });
    const trEntry = getAboveNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TR) },
    });
    const tableEntry = getAboveNode<TTableElement>(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    });

    if (
      tdEntry &&
      trEntry &&
      tableEntry &&
      // Cannot delete the last cell
      trEntry[0].children.length > 1
    ) {
      const [tableNode, tablePath] = tableEntry;

      const tdPath = tdEntry[1];
      const colIndex = tdPath.at(-1)!;

      const pathToDelete = tdPath.slice();
      const replacePathPos = pathToDelete.length - 2;

      withoutNormalizing(editor, () => {
        tableEntry[0].children.forEach((row, rowIdx) => {
          pathToDelete[replacePathPos] = rowIdx;

          // for rows with different lengths
          if ((row.children as TElement[]).length < replacePathPos + 1) return;

          removeNodes(editor, {
            at: pathToDelete,
          });
        });

        const { colSizes } = tableNode;

        if (colSizes) {
          const newColSizes = [...colSizes];
          newColSizes.splice(colIndex, 1);

          setNodes<TTableElement>(
            editor,
            {
              colSizes: newColSizes,
            },
            {
              at: tablePath,
            }
          );
        }
      });
    }
  }
};
