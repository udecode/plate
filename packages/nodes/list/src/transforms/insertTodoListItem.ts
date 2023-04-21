import {
  deleteText,
  getAboveNode,
  getMarks,
  getPluginType,
  insertElements,
  isBlockTextEmptyAfterSelection,
  isStartPoint,
  PlateEditor,
  select,
  splitNodes,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { Path, Range } from 'slate';
import { ELEMENT_TODO_LI } from '../todo-list';
import { TodoListPlugin } from '../types';

/**
 * Insert todo list item if selection in li>p.
 * TODO: test
 */
export const insertTodoListItem = <V extends Value>(
  editor: PlateEditor<V>,
  {
    inheritCheckStateOnLineStartInsert = false,
    inheritCheckStateOnLineEndInsert = false,
  }: TodoListPlugin
): boolean => {
  const todoType = getPluginType(editor, ELEMENT_TODO_LI);

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

    /**
     * If start, insert a list item before
     */
    if (isStart) {
      insertElements(
        editor,
        {
          type: todoType,
          checked: inheritCheckStateOnLineStartInsert ? todo.checked : false,
          children: [{ text: '' }],
        },
        { at: paragraphPath }
      );

      success = true;

      return;
    }

    /**
     * If not end, split the nodes
     */
    if (!isEnd) {
      withoutNormalizing(editor, () => {
        splitNodes(editor);
      });
    } else {
      /**
       * If end, insert a list item after and select it
       */
      const marks = getMarks(editor) || {};
      insertElements(
        editor,
        {
          type: todoType,
          checked: inheritCheckStateOnLineEndInsert ? todo.checked : false,
          children: [{ text: '', ...marks }],
        },
        { at: nextParagraphPath }
      );
      select(editor, nextParagraphPath);
    }

    success = true;
  });

  return success;
};
