import { type SlateEditor, type TElement, PathApi } from '@udecode/plate';

import {
  BaseListItemContentPlugin,
  BaseListItemPlugin,
} from '../BaseListPlugin';

/** Insert list item if selection in li>p. TODO: test */
export const insertListItem = (editor: SlateEditor): boolean => {
  const liType = editor.getType(BaseListItemPlugin);
  const licType = editor.getType(BaseListItemContentPlugin);

  if (!editor.selection) {
    return false;
  }

  const licEntry = editor.api.above({ match: { type: licType } });

  if (!licEntry) return false;

  const [, paragraphPath] = licEntry;

  const listItemEntry = editor.api.parent(paragraphPath);

  if (!listItemEntry) return false;

  const [listItemNode, listItemPath] = listItemEntry;

  if (listItemNode.type !== liType) return false;

  let success = false;

  editor.tf.withoutNormalizing(() => {
    if (!editor.api.isCollapsed()) {
      editor.tf.delete();
    }

    const isStart = editor.api.isStart(editor.selection!.focus, paragraphPath);
    const isEnd = editor.api.isEmpty(editor.selection, { after: true });

    const nextParagraphPath = PathApi.next(paragraphPath);
    const nextListItemPath = PathApi.next(listItemPath);

    /** If start, insert a list item before */
    if (isStart) {
      editor.tf.insertNodes(
        {
          children: [{ children: [{ text: '' }], type: licType }],
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
      const marks = editor.api.marks() || {};
      editor.tf.insertNodes(
        {
          children: [{ children: [{ text: '', ...marks }], type: licType }],
          type: liType,
        },
        { at: nextListItemPath }
      );
      editor.tf.select(nextListItemPath);
    } else {
      editor.tf.withoutNormalizing(() => {
        editor.tf.splitNodes();
        editor.tf.wrapNodes<TElement>(
          {
            children: [],
            type: liType,
          },
          { at: nextParagraphPath }
        );
        editor.tf.moveNodes({
          at: nextParagraphPath,
          to: nextListItemPath,
        });
        editor.tf.select(nextListItemPath);
        editor.tf.collapse({
          edge: 'start',
        });
      });
    }
    /** If there is a list in the list item, move it to the next list item */
    if (listItemNode.children.length > 1) {
      editor.tf.moveNodes({
        at: nextParagraphPath,
        to: nextListItemPath.concat(1),
      });
    }

    success = true;
  });

  return success;
};
