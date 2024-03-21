import {
  getAboveNode,
  getNodeString,
  isCollapsed,
  PlateEditor,
  Value,
} from '@udecode/plate-common';
import { outdent } from '@udecode/plate-indent';

import { insertEmptyIndentTodo, unSetIndentTodo } from './transforms';
import { ELEMENT_INDENT_TODO, TIndentTodoListItemElement } from './types';

export const withIndentTodo = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E
) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    if (isCollapsed(editor.selection)) {
      const entry = getAboveNode<TIndentTodoListItemElement>(editor);

      if (!entry) return insertBreak();

      const [node, _] = entry;

      if (node.type !== ELEMENT_INDENT_TODO) return insertBreak();

      if (getNodeString(node).length === 0) {
        return node.indent && node.indent >= 1
          ? outdent(editor)
          : unSetIndentTodo(editor);
      }

      if (node.checked) {
        return insertEmptyIndentTodo(editor, {
          checked: false,
          indent: node.indent,
        });
      }
    }
    insertBreak();
  };

  return editor;
};
