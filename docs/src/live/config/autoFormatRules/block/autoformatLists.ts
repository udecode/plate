import {
  AutoformatRule,
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_TODO_LI,
  ELEMENT_UL,
  TodoListItemNodeData,
} from '@udecode/plate';
import { setNodes } from '@udecode/plate-common';
import { TElement } from '@udecode/plate-core';
import { Editor } from 'slate';
import { formatList, preFormat } from '../autoformatUtils';

export const autoformatLists: AutoformatRule[] = [
  {
    mode: 'block',
    type: ELEMENT_LI,
    markup: ['*', '-'],
    preFormat,
    format: (editor) => formatList(editor, ELEMENT_UL),
  },
  {
    mode: 'block',
    type: ELEMENT_LI,
    markup: ['1.', '1)'],
    preFormat,
    format: (editor) => formatList(editor, ELEMENT_OL),
  },
  {
    mode: 'block',
    type: ELEMENT_TODO_LI,
    markup: '[]',
  },
  {
    mode: 'block',
    type: ELEMENT_TODO_LI,
    markup: '[x]',
    format: (editor) =>
      setNodes<TElement<TodoListItemNodeData>>(
        editor,
        { type: ELEMENT_TODO_LI, checked: true },
        {
          match: (n) => Editor.isBlock(editor, n),
        }
      ),
  },
];
