import {
  type ExtendEditor,
  type TElement,
  getAboveNode,
  isDefined,
  isEndPoint,
  isExpanded,
  setNodes,
  withoutNormalizing,
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
    const nodeEntry = getAboveNode(editor);

    if (!nodeEntry) return insertBreak();

    const [node, path] = nodeEntry;

    if (
      !isDefined(node[BaseIndentListPlugin.key]) ||
      node[BaseIndentListPlugin.key] !== INDENT_LIST_KEYS.todo ||
      // https://github.com/udecode/plate/issues/3340
      isExpanded(editor.selection) ||
      !isEndPoint(editor, editor.selection?.focus, path)
    ) {
      return insertBreak();
    }

    withoutNormalizing(editor, () => {
      insertBreak();

      const newEntry = getAboveNode<TElement>(editor);

      if (newEntry) {
        setNodes<TElement>(
          editor,
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
