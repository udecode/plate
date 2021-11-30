import {
  ELEMENT_DEFAULT,
  getNode,
  getParent,
  getPluginType,
  getPreviousPath,
  isElement,
  match,
  PlateEditor,
  setNodes,
  getPlugin,
  TDescendant,
  TElement,
} from '@udecode/plate-core';
import { Descendant, NodeEntry, Path, Transforms } from 'slate';
import { ELEMENT_LI, ELEMENT_LIC, KEY_LIST } from '../createListPlugin';
import { getListTypes } from '../queries';
import { moveListItemsToList } from '../transforms';
import { normalizeListItem } from './normalizeListItem';
import { normalizeNestedList } from './normalizeNestedList';
import { ListPlugin } from '../types';

/**
 * Normalize list node to force the ul>li>p+ul structure.
 */
export const normalizeList = (
  editor: PlateEditor,
  [node, path]: NodeEntry
): boolean => {
  const liType = getPluginType(editor, ELEMENT_LI);
  const licType = getPluginType(editor, ELEMENT_LIC);
  const defaultType = getPluginType(editor, ELEMENT_DEFAULT);
  const { options: {validLiChildrenTypes} } = getPlugin<
    Required<ListPlugin>
  >(editor, KEY_LIST);

  if (!isElement(node)) return true;

  // remove empty list
  if (match(node, { type: getListTypes(editor) })) {
    if (
      !node.children.length ||
      !node.children.find(
        (item: Descendant) => (item as TDescendant).type === liType
      )
    ) {
      Transforms.removeNodes(editor, { at: path });
      return true;
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
      return true;
    }

    if (normalizeNestedList(editor, { nestedListItem: [node, path] })) {
      return true;
    }
  }

  if (node.type === getPluginType(editor, ELEMENT_LI)) {
    if (
      normalizeListItem(editor, {
        listItem: [node, path],
        validLiChildrenTypes,
      })
    ) {
      return true;
    }
  }

  // LIC should have LI parent. If not, set LIC to DEFAULT type.
  if (node.type === licType && licType !== defaultType) {
    if (getParent(editor, path)?.[0].type !== liType) {
      setNodes(editor, { type: defaultType }, { at: path });
    }
  }

  return false;
};
