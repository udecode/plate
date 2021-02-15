import { getPreviousPath, isExpanded } from '@udecode/slate-plugins-common';
import { Ancestor, Editor, NodeEntry, Transforms } from 'slate';
import { hasListChild } from '../queries/hasListChild';
import { ListOptions } from '../types';
import { moveListItemSublistItemsToList } from './moveListItemSublistItemsToList';
import { moveListItemSublistItemsToListItemSublist } from './moveListItemSublistItemsToListItemSublist';

export interface RemoveListItemOptions {
  list: NodeEntry<Ancestor>;
  listItem: NodeEntry<Ancestor>;
}

/**
 * Remove list item and move its sublist to list if any.
 * TODO: handle expanded selection
 * TODO: move p children in the previous list item if any
 */
export const removeRootListItem = (
  editor: Editor,
  { list, listItem }: RemoveListItemOptions,
  options?: ListOptions
) => {
  const [listItemNode, listItemPath] = listItem;

  if (!hasListChild(listItemNode, options)) {
    // No sub-lists to move over
    return false;
  }

  if (isExpanded(editor.selection)) {
    return false;
  }

  const listItemPathRef = Editor.pathRef(editor, listItemPath);
  const previousListItemPath = getPreviousPath(listItemPath);

  if (previousListItemPath) {
    const [previousListItemNode] = Editor.node(editor, previousListItemPath);

    // We may have a trailing sub-list
    // that we need to merge backwards
    moveListItemSublistItemsToListItemSublist(
      editor,
      {
        fromListItem: listItem,
        toListItem: [previousListItemNode as Ancestor, previousListItemPath],
      },
      options
    );

    // Select the P tag at the previous list item
    Transforms.select(
      editor,
      Editor.end(editor, previousListItemPath.concat([0]))
    );
  } else {
    // We may have a trailing sub-list that we
    // need to move into the root list
    moveListItemSublistItemsToList(
      editor,
      {
        fromListItem: listItem,
        toList: list,
        // start: true,
      },
      options
    );
  }

  // Remove the list-item
  const listItemPathUnref = listItemPathRef.unref();
  if (listItemPathUnref) {
    Transforms.removeNodes(editor, { at: listItemPathUnref });
  }

  return true;
};
