import {
  ELEMENT_DEFAULT,
  getAboveNode,
  insertNodes,
  isDefined,
  PlateEditor,
  TElement,
  Value,
} from '@udecode/plate-common';

import {
  KEY_LIST_STYLE_TYPE,
  KEY_TODO_STYLE_TYPE,
} from '../createIndentListPlugin';

export const insertBreakIndentList = <V extends Value>(
  editor: PlateEditor<V>
) => {
  const { insertBreak } = editor;

  return function () {
    const nodeEntry = getAboveNode(editor);

    if (!nodeEntry) return insertBreak();

    const [node, _] = nodeEntry;

    if (
      !isDefined(node[KEY_LIST_STYLE_TYPE]) ||
      node[KEY_LIST_STYLE_TYPE] !== KEY_TODO_STYLE_TYPE
    )
      return insertBreak();

    insertNodes<TElement>(editor, {
      type: ELEMENT_DEFAULT,
      [KEY_LIST_STYLE_TYPE]: KEY_TODO_STYLE_TYPE,
      children: [{ text: '' }],
      checked: false,
      indent: node.indent,
    });
  };
};
