import type { Descendant, OverrideEditor, TElement } from '@udecode/plate';

import type { TableConfig } from './BaseTablePlugin';
import type { TTableCellElement, TTableRowElement } from './types';

import { getTableGridAbove } from './queries/getTableGridAbove';

/** If selection is in a table, get subtable above. */
export const withGetFragmentTable: OverrideEditor<TableConfig> = ({
  api,
  api: { getFragment },
  editor,
  type,
}) => ({
  api: {
    getFragment() {
      const fragment = getFragment();
      const newFragment: Descendant[] = [];

      fragment.forEach((node) => {
        if (node.type === type) {
          const rows = node.children as TTableRowElement[];
          const rowCount = rows.length;

          if (!rowCount) return;

          const colCount = rows[0].children.length;
          const hasOneCell = rowCount <= 1 && colCount <= 1;

          if (hasOneCell) {
            const cell = rows[0] as TTableCellElement;
            const cellChildren = api.table.getCellChildren!(cell);
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
    },
  },
});
