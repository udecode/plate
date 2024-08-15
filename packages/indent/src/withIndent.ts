import { getKeyByType } from '@udecode/plate-common';
import {
  type WithOverride,
  setElements,
  unsetNodes,
} from '@udecode/plate-common';

import type { IndentConfig } from './IndentPlugin';
import type { TIndentElement } from './types';

/**
 * - `node.indent` can not exceed `indentMax`
 * - `node.indent` is unset if `node.type` is not in `types`
 */
export const withIndent: WithOverride<IndentConfig> = ({
  editor,
  plugin: {
    inject: { props: { validPlugins } = {} },
    options: { indentMax },
  },
}) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([node, path]) => {
    const element = node as TIndentElement;
    const { type } = element;

    if (type) {
      if (validPlugins!.includes(getKeyByType(editor, type))) {
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
