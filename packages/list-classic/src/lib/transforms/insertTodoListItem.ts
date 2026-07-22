import type { BaseEditor } from '@platejs/core';
import { type Element, PathApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { BaseTodoListPlugin } from '../BaseTodoListPlugin';
import type { ListTransaction } from '../BaseListPlugin';

/** Insert todo list item if selection in li>p. TODO: test */
export const insertTodoListItem = (
  editor: BaseEditor,
  tx: ListTransaction
): boolean => {
  const { inheritCheckStateOnLineEndBreak, inheritCheckStateOnLineStartBreak } =
    editor.plugin(BaseTodoListPlugin).getOptions();
  const todoType = editor.getType(KEYS.listTodoClassic);

  const selection = tx.selection();

  if (!selection) return false;

  const todoEntry = tx.nodes.above<Element>({
    match: { type: todoType },
  });

  if (!todoEntry) return false;

  const [todo, paragraphPath] = todoEntry;

  {
    if (!tx.selection.isCollapsed()) {
      tx.text.delete();
    }

    const isStart = tx.points.isStart(selection.focus, paragraphPath);
    const isEnd = tx.points.isEnd(selection.focus, paragraphPath);

    const nextParagraphPath = PathApi.next(paragraphPath);

    /** If start, insert a list item before */
    if (isStart) {
      tx.nodes.insert(
        {
          checked: inheritCheckStateOnLineStartBreak ? todo.checked : false,
          children: [{ text: '' }],
          type: todoType,
        },
        { at: paragraphPath }
      );

      return true;
    }
    /** If not end, split the nodes */
    if (isEnd) {
      /** If end, insert a list item after and select it */
      const marks = tx.marks() || {};
      tx.nodes.insert(
        {
          checked: inheritCheckStateOnLineEndBreak ? todo.checked : false,
          children: [{ text: '', ...marks }],
          type: todoType,
        },
        { at: nextParagraphPath }
      );
      tx.selection.set(nextParagraphPath);
    } else {
      tx.nodes.split();
    }

    return true;
  }
};
