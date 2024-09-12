import {
  BaseParagraphPlugin,
  type ExtendEditor,
  type TElement,
  getAboveNode,
  insertNodes,
  isDefined,
  isEndPoint,
  isExpanded,
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

    const [node] = nodeEntry;

    if (
      !isDefined(node[BaseIndentListPlugin.key]) ||
      node[BaseIndentListPlugin.key] !== INDENT_LIST_KEYS.todo ||
      // https://github.com/udecode/plate/issues/3340
      isExpanded(editor.selection) ||
      !isEndPoint(editor, editor.selection?.focus, nodeEntry[1])
    )
      return insertBreak();

    insertNodes<TElement>(editor, {
      [BaseIndentListPlugin.key]: INDENT_LIST_KEYS.todo,
      checked: false,
      children: [{ text: '' }],
      indent: node.indent,
      type: BaseParagraphPlugin.key,
    });
  };

  return editor;
};
