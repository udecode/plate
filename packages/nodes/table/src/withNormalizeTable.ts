import {
  ELEMENT_DEFAULT,
  getPluginType,
  getTEditor,
  isElement,
  isText,
  PlateEditor,
  TElement,
  Value,
  wrapNodeChildren,
} from '@udecode/plate-core';
import { getCellTypes } from './utils/index';

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
    if (isElement(node) && getCellTypes(editor).includes(node.type)) {
      const { children } = node;

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

    return normalizeNode([node, path]);
  };

  return editor;
};
