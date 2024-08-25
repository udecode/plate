import { getKeyByType } from '@udecode/plate-common';
import {
  type WithOverride,
  setElements,
  unsetNodes,
} from '@udecode/plate-common';

import type { IndentConfig, TIndentElement } from './IndentPlugin';

/**
 * - `node.indent` can not exceed `indentMax`
 * - `node.indent` is unset if `node.type` is not in `types`
 */
export const withIndent: WithOverride<IndentConfig> = ({
  editor,
  getOptions,
  plugin: {
    inject: { targetPlugins },
  },
}) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([node, path]) => {
    const { indentMax } = getOptions();

    const element = node as TIndentElement;
    const { type } = element;

    if (type) {
      if (targetPlugins!.includes(getKeyByType(editor, type))) {
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
