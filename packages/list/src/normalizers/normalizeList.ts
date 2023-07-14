import {
  ELEMENT_DEFAULT,
  getChildren,
  getNode,
  getParentNode,
  getPluginType,
  getPreviousPath,
  isElement,
  match,
  PlateEditor,
  removeNodes,
  setElements,
  TElement,
  TNodeEntry,
  Value,
  wrapNodes,
} from '@udecode/plate-common';
import { Path } from 'slate';

import { ELEMENT_LI, ELEMENT_LIC } from '../createListPlugin';
import { getListTypes, isListRoot } from '../queries/index';
import { moveListItemsToList } from '../transforms/index';
import { ListPlugin } from '../types';
import { normalizeListItem } from './normalizeListItem';
import { normalizeNestedList } from './normalizeNestedList';

/**
 * Normalize list node to force the ul>li>p+ul structure.
 */
export const normalizeList = <V extends Value>(
  editor: PlateEditor<V>,
  { validLiChildrenTypes }: ListPlugin
) => {
  const { normalizeNode } = editor;
  const liType = getPluginType(editor, ELEMENT_LI);
  const licType = getPluginType(editor, ELEMENT_LIC);
  const defaultType = getPluginType(editor, ELEMENT_DEFAULT);

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
          { type: liType, children: [] },
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
          fromList: [nextNode, nextPath],
          toList: [node, path],
          deleteFromList: true,
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
      node.type === getPluginType(editor, ELEMENT_LI) &&
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
