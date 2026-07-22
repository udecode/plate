import type { BaseEditor } from '@platejs/core';
import {
  type Element,
  type ElementEntry,
  type Path,
  ElementApi,
} from '@platejs/plite';

import type { ListTransaction } from '../BaseListPlugin';
import { getListTypes } from '../queries/getListTypes';
import { moveListItemsToList } from './moveListItemsToList';

export type MoveListItemSublistItemsToListItemSublistOptions = {
  /** The list item to merge. */
  fromListItem: ElementEntry;

  /** The list item where to merge. */
  toListItem: ElementEntry;

  /** Move to the start of the list instead of the end. */
  start?: boolean;
};

/** Move one list item's nested items into another list item's nested list. */
export const moveListItemSublistItemsToListItemSublist = (
  editor: BaseEditor,
  tx: ListTransaction,
  {
    fromListItem,
    start,
    toListItem,
  }: MoveListItemSublistItemsToListItemSublistOptions
) => {
  const fromSublistIndex = fromListItem[0].children.findIndex(
    (node) =>
      ElementApi.isElement(node) && getListTypes(editor).includes(node.type)
  );

  if (fromSublistIndex === -1) return false;

  const fromSublist = fromListItem[0].children[fromSublistIndex];

  if (!ElementApi.isElement(fromSublist)) return false;

  const fromListItemSublist = [
    fromSublist,
    fromListItem[1].concat(fromSublistIndex),
  ] satisfies ElementEntry;

  const toSublistIndex = toListItem[0].children.findIndex(
    (node) =>
      ElementApi.isElement(node) && getListTypes(editor).includes(node.type)
  );
  const toSublist =
    toSublistIndex === -1 ? undefined : toListItem[0].children[toSublistIndex];
  const toListItemSublist = ElementApi.isElement(toSublist)
    ? ([toSublist, toListItem[1].concat(toSublistIndex)] satisfies ElementEntry)
    : undefined;
  let to: Path;

  if (!toListItemSublist) {
    const fromList = tx.nodes.parent<Element>(fromListItem[1]);

    if (!fromList) return false;

    const toListItemSublistPath = toListItem[1].concat(1);

    tx.nodes.insert(
      { children: [], type: fromList[0].type },
      { at: toListItemSublistPath }
    );
    to = toListItemSublistPath.concat(0);
  } else {
    to = toListItemSublist[1].concat(
      start ? 0 : toListItemSublist[0].children.length
    );
  }

  return moveListItemsToList(editor, tx, {
    fromList: fromListItemSublist,
    to,
  });
};
