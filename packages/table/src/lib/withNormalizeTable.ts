import {
  type ExtendEditor,
  type TElement,
  ElementApi,
  TextApi,
} from '@udecode/plate';

import type { TTableCellElement, TTableElement } from './types';

import { type TableConfig, BaseTableRowPlugin } from './BaseTablePlugin';
import { getTableColumnCount } from './queries';
import { computeCellIndices, getCellTypes } from './utils/index';

/**
 * Normalize table:
 *
 * - Wrap cell children in a paragraph if they are texts.
 */
export const withNormalizeTable: ExtendEditor<TableConfig> = ({
  editor,
  getOption,
  getOptions,
  type,
}) => {
  const { apply, normalizeNode } = editor;

  editor.normalizeNode = ([n, path]) => {
    const { enableUnsetSingleColSize, initialTableWidth } = getOptions();

    if (ElementApi.isElement(n)) {
      if (n.type === type) {
        const node = n as TTableElement;

        if (
          !node.children.some(
            (child) =>
              ElementApi.isElement(child) &&
              child.type === editor.getType(BaseTableRowPlugin)
          )
        ) {
          editor.tf.removeNodes({ at: path });

          return;
        }
        if (
          node.colSizes &&
          node.colSizes.length > 0 &&
          enableUnsetSingleColSize &&
          getTableColumnCount(node) < 2
        ) {
          editor.tf.unsetNodes('colSizes', {
            at: path,
          });

          return;
        }

        const tableEntry = editor.api.block({
          at: path,
          match: { type: type },
        });

        if (tableEntry) {
          editor.tf.unwrapNodes({
            at: path,
          });

          return;
        }
        if (initialTableWidth) {
          const tableNode = node as TTableElement;
          const colCount = (
            tableNode.children[0]?.children as TElement[] | undefined
          )?.length;

          if (colCount) {
            const colSizes: number[] = [];

            if (!tableNode.colSizes) {
              for (let i = 0; i < colCount; i++) {
                colSizes.push(initialTableWidth / colCount);
              }
            } else if (tableNode.colSizes.some((size) => !size)) {
              tableNode.colSizes.forEach((colSize) => {
                colSizes.push(colSize || initialTableWidth / colCount);
              });
            }
            if (colSizes.length > 0) {
              editor.tf.setNodes<TTableElement>({ colSizes }, { at: path });

              return;
            }
          }
        }
      }
      if (n.type === editor.getType(BaseTableRowPlugin)) {
        const parentEntry = editor.api.parent(path);

        if (parentEntry?.[0].type !== type) {
          editor.tf.unwrapNodes({
            at: path,
          });

          return;
        }
      }
      if (getCellTypes(editor).includes(n.type)) {
        const node = n as TTableCellElement;

        const cellIndices = getOption('cellIndices', node.id as string);

        if (node.id && !cellIndices) {
          computeCellIndices(editor, {
            all: true,
            cellNode: node,
          });
        }

        const { children } = node;

        const parentEntry = editor.api.parent(path);

        if (parentEntry?.[0].type !== editor.getType(BaseTableRowPlugin)) {
          editor.tf.unwrapNodes({
            at: path,
          });

          return;
        }
        if (TextApi.isText(children[0])) {
          editor.tf.wrapNodes(editor.api.create.block({}, path), {
            at: path,
            children: true,
          });

          return;
        }
      }
    }

    return normalizeNode([n, path]);
  };

  editor.apply = (operation) => {
    const isTableOperation =
      operation.type === 'remove_node' &&
      operation.node.type &&
      [
        editor.getType(BaseTableRowPlugin),
        type,
        ...getCellTypes(editor),
      ].includes(operation.node.type as string);

    // Cleanup cell indices when removing a table cell
    if (isTableOperation) {
      const cells = [
        ...editor.api.nodes<TTableCellElement>({
          at: operation.path,
          match: { type: getCellTypes(editor) },
        }),
      ];

      const cellIndices = getOptions()._cellIndices;

      cells.forEach(([cell]) => {
        delete cellIndices[cell.id as string];
      });
    }

    apply(operation);

    let table: TTableElement | undefined;

    if (
      isTableOperation &&
      // There is no new indices when removing a table
      operation.node.type !== type
    ) {
      table = editor.api.find<TTableElement>({
        at: operation.path,
        match: { type },
      })?.[0];

      if (table) {
        computeCellIndices(editor, {
          tableNode: table,
        });
      }
    }
  };

  return editor;
};
