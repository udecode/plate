import {
  ParagraphPlugin,
  type SlateEditor,
  type TElement,
  type TNodeEntry,
  getChildren,
  getNode,
  getParentNode,
  getPreviousPath,
  isElement,
  match,
  removeNodes,
  setElements,
  wrapNodes,
} from '@udecode/plate-common';
import { Path } from 'slate';

import {
  ListItemContentPlugin,
  ListItemPlugin,
  type ListPluginOptions,
} from '../ListPlugin';
import { getListTypes, isListRoot } from '../queries/index';
import { moveListItemsToList } from '../transforms/index';
import { normalizeListItem } from './normalizeListItem';
import { normalizeNestedList } from './normalizeNestedList';

/** Normalize list node to force the ul>li>p+ul structure. */
export const normalizeList = (
  editor: SlateEditor,
  { validLiChildrenTypes }: ListPluginOptions
) => {
  const { normalizeNode } = editor;
  const liType = editor.getType(ListItemPlugin);
  const licType = editor.getType(ListItemContentPlugin);
  const defaultType = editor.getType(ParagraphPlugin);

  return ([node, path]: TNodeEntry) => {
    if (!isElement(node)) {
      return normalizeNode([node, path]);
    }
    if (isListRoot(editor, node)) {
      const nonLiChild = getChildren([node, path]).find(
        ([child]) => child.type !== liType
      );

      if (nonLiChild) {
        return wrapNodes<TElement>(
          editor,
          { children: [], type: liType },
          { at: nonLiChild[1] }
        );
      }
    }
    // remove empty list
    if (match(node, [], { type: getListTypes(editor) })) {
      if (
        node.children.length === 0 ||
        !node.children.some((item) => item.type === liType)
      ) {
        return removeNodes(editor, { at: path });
      }

      const nextPath = Path.next(path);
      const nextNode = getNode<TElement>(editor, nextPath);

      // Has a list afterwards with the same type
      if (nextNode?.type === node.type) {
        moveListItemsToList(editor, {
          deleteFromList: true,
          fromList: [nextNode, nextPath],
          toList: [node, path],
        });
      }

      const prevPath = getPreviousPath(path) as Path;
      const prevNode = getNode<TElement>(editor, prevPath);

      // Has a list before with the same type
      if (prevNode?.type === node.type) {
        editor.normalizeNode([prevNode, prevPath]);

        // early return since this node will no longer exists
        return;
      }
      if (normalizeNestedList(editor, { nestedListItem: [node, path] })) {
        return;
      }
    }
    if (
      node.type === editor.getType(ListItemPlugin) &&
      normalizeListItem(editor, {
        listItem: [node, path],
        validLiChildrenTypes,
      })
    ) {
      return;
    }
    // LIC should have LI parent. If not, set LIC to DEFAULT type.
    if (
      node.type === licType &&
      licType !== defaultType &&
      getParentNode(editor, path)?.[0].type !== liType
    ) {
      setElements(editor, { type: defaultType }, { at: path });

      return;
    }

    normalizeNode([node, path]);
  };
};
