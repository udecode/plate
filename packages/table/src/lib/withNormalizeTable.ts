import type { ExtendPlateEditorExtension } from '@platejs/core';
import { ElementApi, TextApi } from '@platejs/plite';
import {
  KEYS,
  type TTableCellElement,
  type TTableElement,
  type TTableRowElement,
} from '@platejs/utils';

import type { TableConfig } from './BaseTablePlugin';

import { getTableColumnCount } from './queries';
import { computeCellIndices, getCellTypes } from './utils';

/** Normalize the table, row, and cell structure. */
export const withNormalizeTable: ExtendPlateEditorExtension<TableConfig> = ({
  editor,
  getOption,
  getOptions,
  type,
}) => ({
  normalizers: {
    node({ entry, next, tx }) {
      const [node, path] = entry;

      if (!ElementApi.isElement(node)) {
        next();
        return;
      }

      const { enableUnsetSingleColSize, initialTableWidth } = getOptions();

      if (node.type === type) {
        const table = node as TTableElement;

        if (
          !table.children.some(
            (child) =>
              ElementApi.isElement(child) &&
              child.type === editor.getType(KEYS.tr)
          )
        ) {
          tx.nodes.remove({ at: path });
          return;
        }

        if (
          table.colSizes?.length &&
          enableUnsetSingleColSize &&
          getTableColumnCount(table) < 2
        ) {
          tx.nodes.unset('colSizes', { at: path });
          return;
        }

        if (
          editor.read.nodes.above({
            at: path,
            match: { type },
          })
        ) {
          tx.nodes.unwrap({ at: path });
          return;
        }

        if (initialTableWidth) {
          const colCount = (table.children[0] as TTableRowElement | undefined)
            ?.children.length;

          if (colCount) {
            const fallbackSize = initialTableWidth / colCount;
            const colSizes = table.colSizes
              ? table.colSizes.map((size) => size || fallbackSize)
              : Array.from({ length: colCount }, () => fallbackSize);

            if (!table.colSizes || table.colSizes.some((size) => !size)) {
              tx.nodes.set<TTableElement>({ colSizes }, { at: path });
              return;
            }
          }
        }
      }

      if (node.type === editor.getType(KEYS.tr)) {
        const parent = editor.read.nodes.parent(path);

        if (
          !parent ||
          !ElementApi.isElement(parent[0]) ||
          parent[0].type !== type
        ) {
          tx.nodes.unwrap({ at: path });
          return;
        }
      }

      if (getCellTypes(editor).includes(node.type)) {
        const cell = node as TTableCellElement;
        const cellIndices = cell.id
          ? getOption('cellIndices', cell.id)
          : undefined;

        if (cell.id && !cellIndices) {
          computeCellIndices(editor, { all: true, cellNode: cell });
        }

        const parent = editor.read.nodes.parent(path);

        if (
          !parent ||
          !ElementApi.isElement(parent[0]) ||
          parent[0].type !== editor.getType(KEYS.tr)
        ) {
          tx.nodes.unwrap({ at: path });
          return;
        }

        if (cell.children.length === 0) {
          tx.nodes.replaceChildren(
            [
              {
                children: [{ text: '' }],
                type: editor.getType(KEYS.p),
              },
            ],
            { at: path }
          );
          return;
        }

        if (TextApi.isText(cell.children[0])) {
          tx.nodes.replaceChildren(
            [
              {
                children: cell.children,
                type: editor.getType(KEYS.p),
              },
            ],
            { at: path }
          );
          return;
        }
      }

      next();
    },
  },
});
