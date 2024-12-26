import {
  type ExtendEditor,
  type TElement,
  findNode,
  getBlockAbove,
  getNodeEntries,
  getParentNode,
  isElement,
  isText,
  setNodes,
  unwrapNodes,
  wrapNodeChildren,
} from '@udecode/plate-common';

import type { TTableCellElement, TTableElement } from './types';

import { type TableConfig, BaseTableRowPlugin } from './BaseTablePlugin';
import { computeCellIndices, getCellTypes } from './utils/index';

/**
 * Normalize table:
 *
 * - Wrap cell children in a paragraph if they are texts.
 */
export const withNormalizeTable: ExtendEditor<TableConfig> = ({
  editor,
  getOptions,
  setOption,
  type,
}) => {
  const { apply, normalizeNode } = editor;

  editor.normalizeNode = ([node, path]) => {
    const { initialTableWidth } = getOptions();

    if (isElement(node)) {
      if (node.type === type) {
        if (
          !node.children.some(
            (child) =>
              isElement(child) &&
              child.type === editor.getType(BaseTableRowPlugin)
          )
        ) {
          editor.removeNodes({ at: path });

          return;
        }

        const tableEntry = getBlockAbove(editor, {
          at: path,
          match: { type: type },
        });

        if (tableEntry) {
          unwrapNodes(editor, {
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
              setNodes<TTableElement>(editor, { colSizes }, { at: path });

              return;
            }
          }
        }
      }
      if (node.type === editor.getType(BaseTableRowPlugin)) {
        const parentEntry = getParentNode(editor, path);

        if (parentEntry?.[0].type !== type) {
          unwrapNodes(editor, {
            at: path,
          });

          return;
        }
      }
      if (getCellTypes(editor).includes(node.type)) {
        const { children } = node;

        const parentEntry = getParentNode(editor, path);

        if (parentEntry?.[0].type !== editor.getType(BaseTableRowPlugin)) {
          unwrapNodes(editor, {
            at: path,
          });

          return;
        }
        if (isText(children[0])) {
          wrapNodeChildren<TElement>(
            editor,
            editor.api.create.block({}, path),
            {
              at: path,
            }
          );

          return;
        }
      }
    }

    return normalizeNode([node, path]);
  };

  editor.apply = (operation) => {
    const isTableOperation =
      (operation.type === 'remove_node' || operation.type === 'insert_node') &&
      operation.node.type &&
      [
        editor.getType(BaseTableRowPlugin),
        type,
        ...getCellTypes(editor),
      ].includes(operation.node.type as string);

    // Cleanup cell indices when removing a table cell
    if (operation.type === 'remove_node') {
      const cells = [
        ...getNodeEntries<TTableCellElement>(editor, {
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

    console.log('operation', operation);

    let table: TTableElement | undefined;

    if (
      isTableOperation &&
      // There is no new indices when removing a table
      !(operation.type === 'remove_node' && operation.node.type === type)
    ) {
      table = findNode<TTableElement>(editor, {
        at: operation.path,
        match: { type },
      })?.[0];

      if (table) {
        computeCellIndices(editor, {
          tableNode: table,
        });
        setOption('_versionCellIndices', getOptions()._versionCellIndices + 1);
      }
    }
  };

  return editor;
};
