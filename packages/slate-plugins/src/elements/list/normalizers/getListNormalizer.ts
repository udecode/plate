import { Descendant, Editor, NodeEntry, Transforms } from 'slate';
import { match } from '../../../common/utils/match';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_LIST } from '../defaults';
import { getListTypes } from '../queries/getListTypes';
import { ListNormalizerOptions, ListOptions } from '../types';
import { normalizeListItem } from './normalizeListItem';

/**
 * Normalize list node to force the ul>li>p+ul structure.
 */
export const getListNormalizer = (
  editor: Editor,
  { validLiChildrenTypes }: ListNormalizerOptions,
  options?: ListOptions
) => {
  const { li } = setDefaults(options, DEFAULTS_LIST);

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
