import {
  type TElement,
  type WithOverride,
  getBlockAbove,
  getParentNode,
  isElement,
  isText,
  setNodes,
  unwrapNodes,
  wrapNodeChildren,
} from '@udecode/plate-common';

import type { TTableElement, TableConfig } from './types';

import { TableRowPlugin } from './TablePlugin';
import { getCellTypes } from './utils/index';

/**
 * Normalize table:
 *
 * - Wrap cell children in a paragraph if they are texts.
 */
export const withNormalizeTable: WithOverride<TableConfig> = ({
  editor,
  getOptions,
  type,
}) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([node, path]) => {
    const { initialTableWidth } = getOptions();

    if (isElement(node)) {
      if (node.type === type) {
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
      if (node.type === editor.getType(TableRowPlugin)) {
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

        if (parentEntry?.[0].type !== editor.getType(TableRowPlugin)) {
          unwrapNodes(editor, {
            at: path,
          });

          return;
        }
        if (isText(children[0])) {
          wrapNodeChildren<TElement>(
            editor,
            editor.api.blockFactory({}, path),
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

  return editor;
};
