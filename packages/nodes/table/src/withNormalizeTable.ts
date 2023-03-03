import {
  getBlockAbove,
  getParentNode,
  getPluginOptions,
  getPluginType,
  getTEditor,
  isElement,
  isText,
  PlateEditor,
  setNodes,
  TElement,
  unwrapNodes,
  Value,
  wrapNodeChildren,
} from '@udecode/plate-core';
import { getCellTypes } from './utils/index';
import { ELEMENT_TABLE, ELEMENT_TR } from './createTablePlugin';
import { TablePlugin, TTableElement } from './types';

/**
 * Normalize table:
 * - Wrap cell children in a paragraph if they are texts.
 */
export const withNormalizeTable = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E
) => {
  const { normalizeNode } = editor;

  const myEditor = getTEditor<V>(editor);

  const { initialTableWidth } = getPluginOptions<TablePlugin>(
    editor as any,
    ELEMENT_TABLE
  );

  myEditor.normalizeNode = ([node, path]) => {
    if (isElement(node)) {
      if (node.type === getPluginType(editor, ELEMENT_TABLE)) {
        const tableEntry = getBlockAbove(editor, {
          at: path,
          match: { type: getPluginType(editor, ELEMENT_TABLE) },
        });

        if (tableEntry) {
          unwrapNodes(editor, {
            at: path,
          });
          return;
        }

        if (initialTableWidth) {
          const tableNode = node as TTableElement;
          const colCount = (tableNode.children[0]?.children as
            | TElement[]
            | undefined)?.length;
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

            if (colSizes.length) {
              setNodes<TTableElement>(editor, { colSizes }, { at: path });
              return;
            }
          }
        }
      }

      if (node.type === getPluginType(editor, ELEMENT_TR)) {
        const parentEntry = getParentNode(editor, path);

        if (parentEntry?.[0].type !== getPluginType(editor, ELEMENT_TABLE)) {
          unwrapNodes(editor, {
            at: path,
          });
          return;
        }
      }

      if (getCellTypes(editor).includes(node.type)) {
        const { children } = node;

        const parentEntry = getParentNode(editor, path);

        if (parentEntry?.[0].type !== getPluginType(editor, ELEMENT_TR)) {
          unwrapNodes(editor, {
            at: path,
          });
          return;
        }

        if (isText(children[0])) {
          wrapNodeChildren<TElement>(editor, editor.blockFactory({}, path), {
            at: path,
          });

          return;
        }
      }
    }

    return normalizeNode([node, path]);
  };

  return editor;
};
