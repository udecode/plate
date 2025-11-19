import type { OverrideEditor, TIndentElement } from 'platejs';

import { getInjectMatch } from 'platejs';

import type { IndentConfig } from './BaseIndentPlugin';

import { indent, outdent } from './transforms/index';

/**
 * - `node.indent` can not exceed `indentMax`
 * - `node.indent` is unset if `node.type` is not in `types`
 */
export const withIndent: OverrideEditor<IndentConfig> = ({
  editor,
  getOptions,
  plugin,
  tf: { normalizeNode, tab },
}) => ({
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
    tab: (options) => {
      const apply = () => {
        const match = getInjectMatch(editor, plugin);
        const entry = editor.api.block();

        if (!entry) return;

        const [element, path] = entry;

        if (!match(element, path)) return;

        if (options.reverse) {
          outdent(editor);
        } else {
          indent(editor);
        }

        return true;
      };

      if (apply()) return true;

      return tab(options);
    },
  },
});
