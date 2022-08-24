import {
  ELEMENT_DEFAULT,
  getBlockAbove,
  getParentNode,
  getPluginType,
  getTEditor,
  isElement,
  isText,
  PlateEditor,
  TElement,
  unwrapNodes,
  Value,
  wrapNodeChildren,
} from '@udecode/plate-core';
import { getCellTypes } from './utils/index';
import { ELEMENT_TABLE, ELEMENT_TR } from './createTablePlugin';

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
          wrapNodeChildren<TElement>(
            editor,
            {
              type: getPluginType(editor, ELEMENT_DEFAULT),
              children: [{ text: '' }],
            },
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
