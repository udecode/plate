import type { Element } from '@platejs/slate';
import { type OverrideEditor, isDefined, KEYS } from 'platejs';

import type { BaseListConfig } from '../BaseListPlugin';

export const withInsertBreakList: OverrideEditor<BaseListConfig> = ({
  editor,
  tf: { insertBreak },
}) => ({
  transforms: {
    insertBreak() {
      const nodeEntry = editor.api.above();

      if (!nodeEntry) return insertBreak();

      const [node, path] = nodeEntry;

      if (
        !isDefined(node[KEYS.listType]) ||
        node[KEYS.listType] !== KEYS.listTodo ||
        editor.api.isExpanded() ||
        !editor.api.isEnd(editor.selection?.focus, path)
      ) {
        return insertBreak();
      }

      editor.tf.withoutNormalizing(() => {
        insertBreak();

        const newEntry = editor.api.above<Element>();

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
});
