import { insertNodes, PlateEditor, Value } from '@udecode/plate-common';

import { ELEMENT_INDENT_TODO, TIndentTodoListItemElement } from '../types';

export const insertEmptyIndentTodo = <V extends Value>(
  editor: PlateEditor<V>,
  props: { checked: boolean; indent?: number }
) =>
  insertNodes<TIndentTodoListItemElement>(editor, {
    type: ELEMENT_INDENT_TODO,
    children: [{ text: '' }],
    ...props,
  });
