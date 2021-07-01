import {
  ELEMENT_DEFAULT,
  getParent,
  match,
  setNodes,
} from '@udecode/slate-plugins-common';
import {
  getSlatePluginType,
  isElement,
  SPEditor,
} from '@udecode/slate-plugins-core';
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
  const liType = getSlatePluginType(editor, ELEMENT_LI);
  const licType = getSlatePluginType(editor, ELEMENT_LIC);
  const defaultType = getSlatePluginType(editor, ELEMENT_DEFAULT);

  return ([node, path]: NodeEntry) => {
    if (!isElement(node)) return;

    if (match(node, { type: getListTypes(editor) })) {
      if (!node.children.length) {
        return Transforms.removeNodes(editor, { at: path });
      }
    }

    if (node.type === getSlatePluginType(editor, ELEMENT_LI)) {
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
