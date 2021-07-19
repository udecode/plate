import {
  ELEMENT_DEFAULT,
  getParent,
  match,
  setNodes,
} from '@udecode/plate-common';
import {
  getPlatePluginType,
  isElement,
  SPEditor,
  TDescendant,
} from '@udecode/plate-core';
import { NodeEntry, Transforms } from 'slate';
import { ELEMENT_LI, ELEMENT_LIC } from '../defaults';
import { getListTypes } from '../queries/getListTypes';
import { ListNormalizerOptions } from '../types';
import { normalizeListItem } from './normalizeListItem';

/**
 * Normalize list node to force the ul>li>p+ul structure.
 */
export const getListNormalizer = (
  editor: SPEditor,
  { validLiChildrenTypes }: ListNormalizerOptions
) => {
  const { normalizeNode } = editor;
  const liType = getPlatePluginType(editor, ELEMENT_LI);
  const licType = getPlatePluginType(editor, ELEMENT_LIC);
  const defaultType = getPlatePluginType(editor, ELEMENT_DEFAULT);

  return ([node, path]: NodeEntry) => {
    if (!isElement(node)) return;

    if (match(node, { type: getListTypes(editor) })) {
      if (
        !node.children.length ||
        !node.children.find((item) => (item as TDescendant).type === liType)
      ) {
        return Transforms.removeNodes(editor, { at: path });
      }
    }

    if (node.type === getPlatePluginType(editor, ELEMENT_LI)) {
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
