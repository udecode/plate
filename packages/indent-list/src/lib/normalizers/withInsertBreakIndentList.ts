import {
  type ExtendEditor,
  type TElement,
  isDefined,
} from '@udecode/plate-common';

import {
  type BaseIndentListConfig,
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
} from '../BaseIndentListPlugin';

export const withInsertBreakIndentList: ExtendEditor<BaseIndentListConfig> = ({
  editor,
}) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    const nodeEntry = editor.api.above();

    if (!nodeEntry) return insertBreak();

    const [node, path] = nodeEntry;

    if (
      !isDefined(node[BaseIndentListPlugin.key]) ||
      node[BaseIndentListPlugin.key] !== INDENT_LIST_KEYS.todo ||
      // https://github.com/udecode/plate/issues/3340
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
  };

  return editor;
};
