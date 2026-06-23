import { PathApi } from '@platejs/plite';
import type { BasePlateEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';
import { isEditorPointStart } from '../internal/editorQueries';
import { runWithoutNormalizing } from '../internal/runWithoutNormalizing';
import { getEditorMarks } from '../internal/getEditorMarks';

export type InsertListItemOptions = {
  inheritCheckStateOnLineEndBreak?: boolean;
  inheritCheckStateOnLineStartBreak?: boolean;
};

/** Insert list item if selection in li>p. TODO: test */
export const insertListItem = (
  editor: BasePlateEditor,
  options: InsertListItemOptions = {}
): boolean => {
  const liType = editor.getType(KEYS.li);
  const licType = editor.getType(KEYS.lic);

  if (!editor.selection) {
    return false;
  }

  const licEntry = editor.api.above({
    match: (node) => node.type === licType,
  });

  if (!licEntry) return false;

  const [, paragraphPath] = licEntry;

  const listItemEntry = editor.api.parent(paragraphPath);

  if (!listItemEntry) return false;

  const [listItemNode, listItemPath] = listItemEntry;

  if (listItemNode.type !== liType) return false;

  const optionalTasklistProps =
    'checked' in listItemNode ? { checked: false } : undefined;

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
      const isEnd = editor.api.isEmpty(editor.selection!, { after: true });

      const nextParagraphPath = PathApi.next(paragraphPath);
      const nextListItemPath = PathApi.next(listItemPath);

      /** If start, insert a list item before */
      if (isStart) {
        if (
          optionalTasklistProps &&
          options.inheritCheckStateOnLineStartBreak
        ) {
          optionalTasklistProps.checked = listItemNode.checked as boolean;
        }

        tx.nodes.insert(
          {
            children: [{ children: [{ text: '' }], type: licType }],
            ...optionalTasklistProps,
            type: liType,
          },
          { at: listItemPath }
        );

        success = true;

        return;
      }
      /**
       * If not end, split nodes, wrap a list item on the new paragraph and move
       * it to the next list item
       */
      if (isEnd) {
        /** If end, insert a list item after and select it */
        const marks = getEditorMarks(editor);

        if (optionalTasklistProps && options.inheritCheckStateOnLineEndBreak) {
          optionalTasklistProps.checked = listItemNode.checked as boolean;
        }

        tx.nodes.insert(
          {
            children: [{ children: [{ text: '', ...marks }], type: licType }],
            ...optionalTasklistProps,
            type: liType,
          },
          { at: nextListItemPath }
        );
        tx.selection.set(nextListItemPath);
      } else {
        runWithoutNormalizing(tx, () => {
          tx.nodes.split();
          tx.nodes.wrap(
            {
              children: [],
              ...optionalTasklistProps,
              type: liType,
            },
            { at: nextParagraphPath }
          );
          tx.nodes.move({
            at: nextParagraphPath,
            to: nextListItemPath,
          });
          tx.selection.set(nextListItemPath);
          tx.selection.collapse({
            edge: 'start',
          });
        });
      }
      /** If there is a list in the list item, move it to the next list item */
      if (listItemNode.children.length > 1) {
        tx.nodes.move({
          at: nextParagraphPath,
          to: nextListItemPath.concat(1),
        });
      }

      success = true;
    });
  });

  return success;
};
