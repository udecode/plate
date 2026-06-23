import { PathApi } from '@platejs/slate';
import type { SlateEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';
import {
  isEditorPointEnd,
  isEditorPointStart,
} from '../internal/editorQueries';
import { runWithoutNormalizing } from '../internal/runWithoutNormalizing';
import { getEditorMarks } from '../internal/getEditorMarks';

import { BaseTodoListPlugin } from '../BaseTodoListPlugin';

/** Insert todo list item if selection in li>p. TODO: test */
export const insertTodoListItem = (editor: SlateEditor): boolean => {
  const { inheritCheckStateOnLineEndBreak, inheritCheckStateOnLineStartBreak } =
    editor.getOptions(BaseTodoListPlugin);
  const todoType = editor.getType(KEYS.listTodoClassic);

  if (!editor.selection) {
    return false;
  }

  const todoEntry = editor.api.above({
    match: (node) => node.type === todoType,
  });

  if (!todoEntry) return false;

  const [todo, paragraphPath] = todoEntry;

  let success = false;

  editor.update((tx) => {
    runWithoutNormalizing(tx, () => {
      if (!editor.api.isCollapsed()) {
        tx.text.delete();
      }

      const isStart = isEditorPointStart(
        editor,
        editor.selection!.focus,
        paragraphPath
      );
      const isEnd =
        isEditorPointEnd(editor, editor.selection!.focus, paragraphPath) ||
        editor.api.isEmpty?.(editor.selection, { after: true });

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

        success = true;

        return;
      }
      /** If not end, split the nodes */
      if (isEnd) {
        /** If end, insert a list item after and select it */
        const marks = getEditorMarks(editor);
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
        runWithoutNormalizing(tx, () => {
          tx.nodes.split();
        });
      }

      success = true;
    });
  });

  return success;
};
