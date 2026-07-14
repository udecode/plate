import type { BaseEditor } from '@platejs/core';
import {
  type EditorUpdateTransaction,
  type NodeEntry,
  ElementApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import { isDefined } from '@udecode/utils';

/** Unset listStyle, listStart if KEYS.indent is not defined. */
export const normalizeListNotIndented = (
  _editor: BaseEditor,
  tx: Pick<EditorUpdateTransaction, 'nodes'>,
  [node, path]: NodeEntry
) => {
  if (!ElementApi.isElement(node)) return false;

  if (
    !isDefined(node[KEYS.indent]) &&
    (node[KEYS.listType] || node[KEYS.listStart])
  ) {
    tx.nodes.unset([KEYS.listType, KEYS.listStart], {
      at: path,
    });

    return true;
  }

  return false;
};
