import type { ExtendPlateEditorExtension } from '@platejs/core';
import { type Descendant, ElementApi } from '@platejs/plite';
import type { TTableCellElement, TTableRowElement } from '@platejs/utils';

import type { TableConfig } from './BaseTablePlugin';

import { getTableGridAbove } from './queries/getTableGridAbove';

/** If selection is in a table, return the selected subtable. */
export const withGetFragmentTable: ExtendPlateEditorExtension<TableConfig> = ({
  api,
  editor,
  type,
}) => ({
  queries: {
    fragment: {
      get({ next }) {
        const fragment = next();
        const nextFragment: Descendant[] = [];

        fragment.forEach((node) => {
          if (!ElementApi.isElement(node) || node.type !== type) {
            nextFragment.push(node);
            return;
          }

          const rows = node.children as TTableRowElement[];
          const rowCount = rows.length;

          if (!rowCount) return;

          const colCount = rows[0].children.length;

          if (rowCount <= 1 && colCount <= 1) {
            const cell = rows[0].children[0] as TTableCellElement;
            nextFragment.push(...api.getCellChildren!(cell));

            return;
          }

          const [subTable] = getTableGridAbove(editor);

          if (subTable) nextFragment.push(subTable[0]);
        });

        return nextFragment;
      },
    },
  },
});
