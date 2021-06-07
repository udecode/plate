import { match } from '@udecode/slate-plugins-common';
import {
  getSlatePluginType,
  isElement,
  SPEditor,
} from '@udecode/slate-plugins-core';
import { NodeEntry, Transforms } from 'slate';
import { ELEMENT_LI } from '../defaults';
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
        // Tree changed - kick off another normalization
        return;
      }
    }

    normalizeNode([node, path]);
  };
};
