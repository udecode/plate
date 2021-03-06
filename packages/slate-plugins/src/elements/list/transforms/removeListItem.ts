import { Ancestor, Editor, NodeEntry, Path, Transforms } from 'slate';
import { getPreviousPath } from '../../../common/queries/getPreviousPath';
import { isExpanded } from '../../../common/queries/isExpanded';
import { deleteFragment } from '../../../common/transforms/deleteFragment';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_LIST } from '../defaults';
import { hasListChild } from '../queries/hasListChild';
import { ListOptions } from '../types';
import { moveListItemsToList } from './moveListItemsToList';
import { moveListItemSublistItemsToListItemSublist } from './moveListItemSublistItemsToListItemSublist';

export interface RemoveListItemOptions {
  list: NodeEntry<Ancestor>;
  listItem: NodeEntry<Ancestor>;
}

/**
 * Remove list item and move its sublist to list if any.
 */
export const removeListItem = (
  editor: Editor,
  { list, listItem }: RemoveListItemOptions,
  options?: ListOptions
) => {
  const { p, li } = setDefaults(options, DEFAULTS_LIST);
  const [liNode, liPath] = listItem;

  // Stop if the list item has no sublist
  if (isExpanded(editor.selection) || !hasListChild(liNode, options)) {
    return false;
  }

  const previousLiPath = getPreviousPath(liPath);

  /**
   * If there is a previous li, we need to move sub-lis to the previous li.
   * As we need to delete first, we will:
   * 1. insert a temporary li: tempLi
   * 2. move sub-lis to tempLi
   * 3. delete
   * 4. move sub-lis from tempLi to the previous li.
   * 5. remove tempLi
   */
  if (previousLiPath) {
    const previousLi = Editor.node(
      editor,
      previousLiPath
    ) as NodeEntry<Ancestor>;

    // 1
    let tempLiPath = Path.next(liPath);
    Transforms.insertNodes(
      editor,
      {
        type: li.type,
        children: [{ type: p.type, children: [{ text: '' }] }],
      },
      { at: tempLiPath }
    );

    const tempLi = Editor.node(editor, tempLiPath) as NodeEntry<Ancestor>;
    const tempLiPathRef = Editor.pathRef(editor, tempLi[1]);

    // 2
    moveListItemSublistItemsToListItemSublist(
      editor,
      {
        fromListItem: listItem,
        toListItem: tempLi,
      },
      options
    );

    // 3
    deleteFragment(editor, {
      reverse: true,
    });

    tempLiPath = tempLiPathRef.unref()!;

    // 4
    moveListItemSublistItemsToListItemSublist(
      editor,
      {
        fromListItem: [tempLi[0], tempLiPath],
        toListItem: previousLi,
      },
      options
    );

    // 5
    Transforms.removeNodes(editor, { at: tempLiPath });

    return true;
  }

  // If it's the first li, move the sublist to the parent list
  moveListItemsToList(
    editor,
    {
      fromListItem: listItem,
      toList: list,
      toListIndex: 1,
    },
    options
  );
};
