import {
  type WithOverride,
  setElements,
  unsetNodes,
} from '@udecode/plate-common/server';

import type { IndentPluginOptions, TIndentElement } from './types';

/**
 * - `node.indent` can not exceed `indentMax`
 * - `node.indent` is unset if `node.type` is not in `types`
 */
export const withIndent: WithOverride<IndentPluginOptions> = (
  editor,
  { inject: { props: { validTypes } = {} }, options: { indentMax } }
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
