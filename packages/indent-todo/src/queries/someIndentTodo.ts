import { PlateEditor, someNode, Value } from '@udecode/plate-common';

import { ELEMENT_INDENT_TODO } from '../types';

export const someIndentTodo = <V extends Value>(editor: PlateEditor<V>) => {
  return (
    !!editor.selection &&
    someNode(editor, {
      match: (n) => n.type === ELEMENT_INDENT_TODO,
    })
  );
};
