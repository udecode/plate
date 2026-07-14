import type { ExtendPlateEditorExtension } from '@platejs/core';
import {
  type Element,
  type NodeEntry,
  type Path,
  ElementApi,
} from '@platejs/plite';
import {
  KEYS,
  type TTableCellElement,
  type TTableElement,
  type TTableRowElement,
} from '@platejs/utils';
import cloneDeep from 'lodash/cloneDeep.js';

import type { TableConfig } from './BaseTablePlugin';

import { getTableAbove, getTableGridAbove } from './queries';

/** Paste a table into the selected cell grid, expanding it when allowed. */
export const withInsertFragmentTable: ExtendPlateEditorExtension<
  TableConfig
> = ({ api, editor, getOptions, type }) => ({
  transforms: {
    insertFragment({ fragment, next, options, tx }) {
      const insertedTable = fragment.find(
        (node) => ElementApi.isElement(node) && node.type === type
      ) as TTableElement | undefined;
      const selection = editor.read.selection();
      const tableEntry = selection
        ? getTableAbove(editor, { at: selection.anchor })
        : undefined;

      if (!insertedTable && tableEntry) {
        const cells = getTableGridAbove(editor, { format: 'cell' });

        if (cells.length > 1) {
          cells.forEach(([, path]) => {
            tx.nodes.replaceChildren(cloneDeep(fragment), { at: path });
          });

          const anchor = editor.read.points.start(cells[0][1]);
          const focus = editor.read.points.end(cells.at(-1)![1]);

          if (anchor && focus) tx.selection.set({ anchor, focus });

          return true;
        }
      }

      if (insertedTable && tableEntry) {
        const [cellEntry] = getTableGridAbove(editor, {
          at: selection?.anchor,
          format: 'cell',
        });

        if (cellEntry) {
          const [table, tablePath] = tableEntry as NodeEntry<TTableElement>;
          const [, startCellPath] = cellEntry;
          const nextTable = cloneDeep(table);
          const startRow = startCellPath.at(-2)!;
          const startColumn = startCellPath.at(-1)!;
          let lastCellPath: Path | undefined;

          const createCell = (row: TTableRowElement) =>
            api.createCell({
              header: (row.children as Element[]).every(
                (cell) => cell.type === editor.getType(KEYS.th)
              ),
            });

          for (
            let rowOffset = 0;
            rowOffset < insertedTable.children.length;
            rowOffset++
          ) {
            const sourceRow = insertedTable.children[
              rowOffset
            ] as TTableRowElement;
            const rowIndex = startRow + rowOffset;

            while (nextTable.children.length <= rowIndex) {
              if (getOptions().disableExpandOnInsert) break;

              const template =
                (nextTable.children.at(-1) as TTableRowElement | undefined) ??
                ({
                  children: [api.createCell()],
                  type: editor.getType(KEYS.tr),
                } satisfies TTableRowElement);

              nextTable.children.push({
                children: template.children.map(() => createCell(template)),
                type: editor.getType(KEYS.tr),
              });
            }

            const targetRow = nextTable.children[rowIndex] as
              | TTableRowElement
              | undefined;

            if (!targetRow) continue;

            for (
              let columnOffset = 0;
              columnOffset < sourceRow.children.length;
              columnOffset++
            ) {
              const columnIndex = startColumn + columnOffset;

              while (targetRow.children.length <= columnIndex) {
                if (getOptions().disableExpandOnInsert) break;

                (nextTable.children as TTableRowElement[]).forEach((row) => {
                  while (row.children.length <= columnIndex) {
                    row.children.push(createCell(row));
                  }
                });
              }

              const targetCell = targetRow.children[columnIndex] as
                | TTableCellElement
                | undefined;
              const sourceCell = sourceRow.children[
                columnOffset
              ] as TTableCellElement;

              if (!targetCell) continue;

              targetCell.children = cloneDeep(api.getCellChildren!(sourceCell));
              lastCellPath = [...tablePath, rowIndex, columnIndex];
            }
          }

          if (lastCellPath) {
            tx.nodes.replace(nextTable, { at: tablePath });

            const anchor = editor.read.points.start(startCellPath);
            const focus = editor.read.points.end(lastCellPath);

            if (anchor && focus) tx.selection.set({ anchor, focus });

            return true;
          }
        }
      } else if (
        insertedTable &&
        fragment.length === 1 &&
        fragment[0].type === KEYS.table
      ) {
        tx.nodes.insert(insertedTable);

        return true;
      }

      return next({ fragment, options });
    },
  },
});
