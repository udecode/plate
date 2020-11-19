import { Ancestor, Editor, NodeEntry, Path, Transforms } from 'slate';
import { moveChildren } from '../../../common/transforms/moveChildren';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_LIST } from '../defaults';
import { isNodeTypeList } from '../queries/isNodeTypeList';
import { ListOptions } from '../types';

export interface MoveChildrenListItemsOptions {
  listItem: NodeEntry<Ancestor>;
  targetListPath: Path;
}

// TODO: test
export const moveChildrenListItems = (
  editor: Editor,
  { listItem, targetListPath }: MoveChildrenListItemsOptions,
  options?: ListOptions
): number => {
  const { li } = setDefaults(options, DEFAULTS_LIST);

  const [listItemNode, listItemPath] = listItem;

  // redundant?
  if (listItemNode.type !== li.type) return 0;

  let moved = 0;

  for (let i = 0; i < listItemNode.children.length; i++) {
    const childNode = listItemNode.children[i];
    if (
      Editor.isBlock(editor, childNode) &&
      isNodeTypeList(childNode, options)
    ) {
      const listPath = [...listItemPath, i];

      moved +=
        moveChildren(editor, {
          at: [childNode, listPath],
          to: targetListPath,
          match: ([node]) => node.type === li.type,
        }) ?? 0;

      // Remove the empty list
      Transforms.delete(editor, { at: listPath });
    }
  }
  return moved;
};
