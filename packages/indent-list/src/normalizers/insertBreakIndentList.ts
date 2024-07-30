import {
  ELEMENT_DEFAULT,
  type PlateEditor,
  type TElement,
  getAboveNode,
  insertNodes,
  isDefined,
  isEndPoint,
  isExpanded,
} from '@udecode/plate-common/server';

import { KEY_LIST_STYLE_TYPE, KEY_TODO_STYLE_TYPE } from '../IndentListPlugin';

export const insertBreakIndentList = (editor: PlateEditor) => {
  const { insertBreak } = editor;

  return function () {
    const nodeEntry = getAboveNode(editor);

    if (!nodeEntry) return insertBreak();

    const [node] = nodeEntry;

    if (
      !isDefined(node[KEY_LIST_STYLE_TYPE]) ||
      node[KEY_LIST_STYLE_TYPE] !== KEY_TODO_STYLE_TYPE ||
      // https://github.com/udecode/plate/issues/3340
      isExpanded(editor.selection) ||
      !isEndPoint(editor, editor.selection?.focus, nodeEntry[1])
    )
      return insertBreak();

    insertNodes<TElement>(editor, {
      [KEY_LIST_STYLE_TYPE]: KEY_TODO_STYLE_TYPE,
      checked: false,
      children: [{ text: '' }],
      indent: node.indent,
      type: ELEMENT_DEFAULT,
    });
  };
};
