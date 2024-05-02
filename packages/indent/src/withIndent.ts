import {
  PlateEditor,
  setElements,
  unsetNodes,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common/server';

import { IndentPlugin, TIndentElement } from './types';

/**
 * - `node.indent` can not exceed `indentMax`
 * - `node.indent` is unset if `node.type` is not in `types`
 */
export const withIndent = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  {
    inject: { props: { validTypes } = {} },
    options: { indentMax },
  }: WithPlatePlugin<IndentPlugin, V, E>
) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([node, path]) => {
    const element = node as TIndentElement;
    const { type } = element;

    if (type) {
      if (validTypes!.includes(type)) {
        if (indentMax && element.indent && element.indent > indentMax) {
          setElements(editor, { indent: indentMax }, { at: path });
          return;
        }
      } else if (element.indent) {
        unsetNodes(editor, 'indent', { at: path });
        return;
      }
    }

    return normalizeNode([node, path]);
  };

  return editor;
};
