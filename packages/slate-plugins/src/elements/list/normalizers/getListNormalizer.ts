import { match } from '@udecode/slate-plugins-common';
import { getPluginType } from '@udecode/slate-plugins-core';
import { Descendant, Editor, NodeEntry, Transforms } from 'slate';
import { ELEMENT_LI } from '../defaults';
import { getListTypes } from '../queries/getListTypes';
import { ListNormalizerOptions } from '../types';
import { normalizeListItem } from './normalizeListItem';

/**
 * Normalize list node to force the ul>li>p+ul structure.
 */
export const getListNormalizer = (
  editor: Editor,
  { validLiChildrenTypes }: ListNormalizerOptions
) => {
  const { normalizeNode } = editor;

  return ([node, path]: NodeEntry) => {
    if (match(node, { type: getListTypes(editor) })) {
      if (!(node.children as Descendant[]).length) {
        return Transforms.removeNodes(editor, { at: path });
      }
    }

    if (node.type === getPluginType(editor, ELEMENT_LI)) {
      if (
        normalizeListItem(editor, {
          nodeEntry: [node, path],
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
