import { setNodes } from '@udecode/plate-common';
import { TElement, WithOverride } from '@udecode/plate-core';
import { Transforms } from 'slate';
import { IndentPlugin } from './types';

/**
 * - `node.indent` can not exceed `indentMax`
 * - `node.indent` is unset if `node.type` is not in `types`
 */
export const withIndent: WithOverride<{}, IndentPlugin> = (
  editor,
  { inject: { props: { validTypes } = {} }, options: { indentMax } }
) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([node, path]) => {
    const element = node as TElement;
    const { type } = element;

    if (type) {
      if (validTypes!.includes(type)) {
        if (indentMax && element.indent && element.indent > indentMax) {
          setNodes(editor, { indent: indentMax }, { at: path });
          return;
        }
      } else if (element.indent) {
        Transforms.unsetNodes(editor, 'indent', { at: path });
        return;
      }
    }

    return normalizeNode([node, path]);
  };

  return editor;
};
