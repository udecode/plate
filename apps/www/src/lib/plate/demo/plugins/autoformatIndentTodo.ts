import { AutoformatRule } from '@udecode/plate-autoformat';
import { ELEMENT_INDENT_TODO } from '@udecode/plate-indent-todo';
import { setNodes } from '@udecode/slate';

import { preFormat } from './autoformatUtils';

export const autoformatIndentTodo: AutoformatRule[] = [
  {
    mode: 'block',
    type: ELEMENT_INDENT_TODO,
    match: '[] ',
    preFormat: preFormat,
  },
  {
    mode: 'block',
    type: ELEMENT_INDENT_TODO,
    match: '[x] ',
    format: (editor) => {
      setNodes(editor, {
        type: ELEMENT_INDENT_TODO,
        checked: true,
      });
    },
  },
];
