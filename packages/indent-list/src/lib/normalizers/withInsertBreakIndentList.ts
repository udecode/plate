import { type OverrideEditor, type TElement, isDefined } from '@udecode/plate';

import {
  type BaseIndentListConfig,
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
} from '../BaseIndentListPlugin';

export const withInsertBreakIndentList: OverrideEditor<
  BaseIndentListConfig
> = ({ editor, tf: { insertBreak } }) => {
  return {
    transforms: {
      insertBreak() {
        const nodeEntry = editor.api.above();

        if (!nodeEntry) return insertBreak();

        const [node, path] = nodeEntry;

        if (
          !isDefined(node[BaseIndentListPlugin.key]) ||
          node[BaseIndentListPlugin.key] !== INDENT_LIST_KEYS.todo ||
          editor.api.isExpanded() ||
          !editor.api.isEnd(editor.selection?.focus, path)
        ) {
          return insertBreak();
        }

        editor.tf.withoutNormalizing(() => {
          insertBreak();

          const newEntry = editor.api.above<TElement>();

          if (newEntry) {
            editor.tf.setNodes(
              {
                checked: false,
              },
              { at: newEntry[1] }
            );
          }
        });
      },
    },
  };
};
