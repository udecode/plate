import { type PlateEditor, someNode } from '@udecode/plate-common';

import {
  IndentListPlugin,
  KEY_LIST_CHECKED,
  KEY_TODO_STYLE_TYPE,
} from '../index';

export const someIndentTodo = (editor: PlateEditor) => {
  return someNode(editor, {
    at: editor.selection!,
    match: (n) => {
      const list = n[IndentListPlugin.key];
      const isHasProperty = n.hasOwnProperty(KEY_LIST_CHECKED);

      return n.type === 'p' && isHasProperty && list === KEY_TODO_STYLE_TYPE;
    },
  });
};
