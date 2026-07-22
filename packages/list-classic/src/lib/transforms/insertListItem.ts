import type { BaseEditor } from '@platejs/core';
import { type Element, PathApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { ListTransaction } from '../BaseListPlugin';

export type InsertListItemOptions = {
  inheritCheckStateOnLineEndBreak?: boolean;
  inheritCheckStateOnLineStartBreak?: boolean;
};

/** Insert list item if selection in li>p. TODO: test */
export const insertListItem = (
  editor: BaseEditor,
  tx: ListTransaction,
  options: InsertListItemOptions = {}
): boolean => {
  const liType = editor.getType(KEYS.li);
  const licType = editor.getType(KEYS.lic);

  const selection = tx.selection();

  if (!selection) return false;

  const licEntry = tx.nodes.above<Element>({
    match: { type: licType },
  });

  if (!licEntry) return false;

  const [, paragraphPath] = licEntry;

  const listItemEntry = tx.nodes.parent<Element>(paragraphPath);

  if (!listItemEntry) return false;

  const [listItemNode, listItemPath] = listItemEntry;

  if (listItemNode.type !== liType) return false;

  const optionalTasklistProps =
    'checked' in listItemNode ? { checked: false } : undefined;

  {
    if (!tx.selection.isCollapsed()) {
      tx.text.delete();
    }

    const isStart = tx.points.isStart(selection.focus, paragraphPath);
    const isEnd = tx.points.isEnd(selection.focus, paragraphPath);

    const nextParagraphPath = PathApi.next(paragraphPath);
    const nextListItemPath = PathApi.next(listItemPath);

    /** If start, insert a list item before */
    if (isStart) {
      if (optionalTasklistProps && options.inheritCheckStateOnLineStartBreak) {
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

      return true;
    }
    /**
     * If not end, split nodes, wrap a list item on the new paragraph and move
     * it to the next list item
     */
    if (isEnd) {
      /** If end, insert a list item after and select it */
      const marks = tx.marks() || {};

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
    }
    /** If there is a list in the list item, move it to the next list item */
    if (listItemNode.children.length > 1) {
      tx.nodes.move({
        at: nextParagraphPath,
        to: nextListItemPath.concat(1),
      });
    }

    return true;
  }
};
