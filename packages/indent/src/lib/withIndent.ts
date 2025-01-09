import type { OverrideEditor } from '@udecode/plate';

import { getInjectMatch } from '@udecode/plate';

import type { IndentConfig, TIndentElement } from './BaseIndentPlugin';

/**
 * - `node.indent` can not exceed `indentMax`
 * - `node.indent` is unset if `node.type` is not in `types`
 */
export const withIndent: OverrideEditor<IndentConfig> = ({
  editor,
  getOptions,
  plugin,
  tf: { normalizeNode },
}) => {
  return {
    transforms: {
      normalizeNode([node, path]) {
        const { indentMax } = getOptions();

        const element = node as TIndentElement;
        const { type } = element;

        const match = getInjectMatch(editor, plugin);

        if (type) {
          if (match(element, path)) {
            if (indentMax && element.indent && element.indent > indentMax) {
              editor.tf.setNodes({ indent: indentMax }, { at: path });

              return;
            }
          } else if (element.indent) {
            editor.tf.unsetNodes('indent', { at: path });

            return;
          }
        }

        return normalizeNode([node, path]);
      },
    },
  };
};
