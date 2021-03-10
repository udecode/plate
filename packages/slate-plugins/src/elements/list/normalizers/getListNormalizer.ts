import { match } from '@udecode/slate-plugins-common';
import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Descendant, Editor, NodeEntry, Transforms } from 'slate';
import { getListTypes } from '../queries/getListTypes';
import { ListNormalizerOptions } from '../types';
import { normalizeListItem } from './normalizeListItem';

/**
 * Normalize list node to force the ul>li>p+ul structure.
 */
export const getListNormalizer = (
  editor: Editor,
  { validLiChildrenTypes }: ListNormalizerOptions,
  options: SlatePluginsOptions
) => {
  const { li } = options;
  const { normalizeNode } = editor;

  return ([node, path]: NodeEntry) => {
    if (match(node, { type: getListTypes(options) })) {
      if (!(node.children as Descendant[]).length) {
        return Transforms.removeNodes(editor, { at: path });
      }
    }

    if (node.type === li.type) {
      if (
        normalizeListItem(
          editor,
          { nodeEntry: [node, path], validLiChildrenTypes },
          options
        )
      ) {
        // Tree changed - kick off another normalization
        return;
      }
    }

    normalizeNode([node, path]);
  };
};
