import {
  ELEMENT_DEFAULT,
  getNode,
  getParent,
  getPreviousPath,
  match,
  setNodes,
} from '@udecode/plate-common';
import {
  getPluginType,
  isElement,
  PlateEditor,
  TDescendant,
  TElement,
} from '@udecode/plate-core';
import { Descendant, NodeEntry, Path, Transforms } from 'slate';
import { ELEMENT_LI, ELEMENT_LIC } from '../createListPlugin';
import { getListTypes } from '../queries/getListTypes';
import { moveListItemsToList } from '../transforms';
import { ListPlugin } from '../types';
import { normalizeListItem } from './normalizeListItem';
import { normalizeNestedList } from './normalizeNestedList';

/**
 * Normalize list node to force the ul>li>p+ul structure.
 */
export const getListNormalizer = (
  editor: PlateEditor,
  { validLiChildrenTypes }: ListPlugin
) => {
  const { normalizeNode } = editor;
  const liType = getPluginType(editor, ELEMENT_LI);
  const licType = getPluginType(editor, ELEMENT_LIC);
  const defaultType = getPluginType(editor, ELEMENT_DEFAULT);

  return ([node, path]: NodeEntry) => {
    if (!isElement(node)) return;

    // remove empty list
    if (match(node, { type: getListTypes(editor) })) {
      if (
        !node.children.length ||
        !node.children.find(
          (item: Descendant) => (item as TDescendant).type === liType
        )
      ) {
        return Transforms.removeNodes(editor, { at: path });
      }

      const nextPath = Path.next(path);
      const nextNode = getNode(editor, nextPath) as TElement | null;

      // Has a list afterwards with the same type
      if (nextNode?.type === node.type) {
        moveListItemsToList(editor, {
          fromList: [nextNode, nextPath],
          toList: [node, path],
          deleteFromList: true,
        });
      }

      const prevPath = getPreviousPath(path) as Path;
      const prevNode = getNode(editor, prevPath) as TElement | null;

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

    if (node.type === getPluginType(editor, ELEMENT_LI)) {
      if (
        normalizeListItem(editor, {
          listItem: [node, path],
          validLiChildrenTypes,
        })
      ) {
        return;
      }
    }

    // LIC should have LI parent. If not, set LIC to DEFAULT type.
    if (node.type === licType && licType !== defaultType) {
      if (getParent(editor, path)?.[0].type !== liType) {
        setNodes(editor, { type: defaultType }, { at: path });
        return;
      }
    }

    normalizeNode([node, path]);
  };
};
