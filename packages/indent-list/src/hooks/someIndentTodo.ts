import { PlateEditor, someNode, Value } from '@udecode/plate-common';

import {
  KEY_LIST_CHECKED,
  KEY_LIST_STYLE_TYPE,
  KEY_TODO_STYLE_TYPE,
} from '../index';

export const someIndentTodo = <V extends Value>(
  editor: PlateEditor<V>,
  type: string
) => {
  return someNode(editor, {
    at: editor.selection!,
    match: (n) => {
      const list = n[KEY_LIST_STYLE_TYPE];
      const isHasProperty = n.hasOwnProperty(KEY_LIST_CHECKED);
      return n.type === 'p' && isHasProperty && list === KEY_TODO_STYLE_TYPE;
    },
  });
};
