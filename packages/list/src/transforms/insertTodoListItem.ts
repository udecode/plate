import {
  type PlateEditor,
  deleteText,
  getAboveNode,
  getMarks,
  insertElements,
  isBlockTextEmptyAfterSelection,
  isStartPoint,
  select,
  splitNodes,
  withoutNormalizing,
} from '@udecode/plate-common';
import { Path, Range } from 'slate';

import { type TodoListConfig, TodoListPlugin } from '../todo-list/index';

/** Insert todo list item if selection in li>p. TODO: test */
export const insertTodoListItem = (
  editor: PlateEditor,
  {
    inheritCheckStateOnLineEndBreak = false,
    inheritCheckStateOnLineStartBreak = false,
  }: TodoListConfig['options']
): boolean => {
  const todoType = editor.getType(TodoListPlugin);

  if (!editor.selection) {
    return false;
  }

  const todoEntry = getAboveNode(editor, { match: { type: todoType } });

  if (!todoEntry) return false;

  const [todo, paragraphPath] = todoEntry;

  let success = false;

  withoutNormalizing(editor, () => {
    if (!Range.isCollapsed(editor.selection!)) {
      deleteText(editor);
    }

    const isStart = isStartPoint(
      editor,
      editor.selection!.focus,
      paragraphPath
    );
    const isEnd = isBlockTextEmptyAfterSelection(editor);

    const nextParagraphPath = Path.next(paragraphPath);

    /** If start, insert a list item before */
    if (isStart) {
      insertElements(
        editor,
        {
          checked: inheritCheckStateOnLineStartBreak ? todo.checked : false,
          children: [{ text: '' }],
          type: todoType,
        },
        { at: paragraphPath }
      );

      success = true;

      return;
    }
    /** If not end, split the nodes */
    if (isEnd) {
      /** If end, insert a list item after and select it */
      const marks = getMarks(editor) || {};
      insertElements(
        editor,
        {
          checked: inheritCheckStateOnLineEndBreak ? todo.checked : false,
          children: [{ text: '', ...marks }],
          type: todoType,
        },
        { at: nextParagraphPath }
      );
      select(editor, nextParagraphPath);
    } else {
      withoutNormalizing(editor, () => {
        splitNodes(editor);
      });
    }

    success = true;
  });

  return success;
};
