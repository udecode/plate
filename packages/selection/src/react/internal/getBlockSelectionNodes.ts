import { ElementApi, type EditorUpdateTransaction } from '@platejs/plite';
import type { TIdElement } from '@platejs/utils';

export const getBlockSelectionNodes = (
  tx: EditorUpdateTransaction,
  selectedIds: ReadonlySet<string> | undefined
) => {
  if (!selectedIds?.size) return [];

  return tx.nodes.toArray<TIdElement>({
    at: [],
    match: (node) =>
      ElementApi.isElement(node) &&
      !!node.id &&
      selectedIds.has(node.id as string),
  });
};
