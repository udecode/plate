import {
  type PlateEditor,
  type TDescendant,
  type TElement,
  type Value,
  type WithPlatePlugin,
  getPluginType,
} from '@udecode/plate-common/server';

import type { TTableRowElement, TablePlugin } from './types';

import { ELEMENT_TABLE } from './createTablePlugin';
import { getTableGridAbove } from './queries/getTableGridAbove';

/** If selection is in a table, get subtable above. */
export const withGetFragmentTable = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  { options }: WithPlatePlugin<TablePlugin<V>, V, E>
) => {
  const { getFragment } = editor;
  const { getCellChildren } = options;

  editor.getFragment = (): any[] => {
    const fragment = getFragment();

    const newFragment: TDescendant[] = [];

    fragment.forEach((node) => {
      if (node.type === getPluginType(editor, ELEMENT_TABLE)) {
        const rows = node.children as TTableRowElement[];

        const rowCount = rows.length;

        if (!rowCount) return;

        const colCount = rows[0].children.length;
        const hasOneCell = rowCount <= 1 && colCount <= 1;

        if (hasOneCell) {
          const cell = rows[0];
          const cellChildren = getCellChildren!(cell);
          newFragment.push(...(cellChildren[0].children as TElement[]));

          return;
        } else {
          const subTable = getTableGridAbove(editor);

          if (subTable.length > 0) {
            newFragment.push(subTable[0][0]);

            return;
          }
        }
      }

      newFragment.push(node);
    });

    return newFragment;
  };

  return editor;
};
