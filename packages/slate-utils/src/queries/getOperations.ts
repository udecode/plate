import type { DescendantOf, TEditor, TOperation } from '@udecode/slate';

/** Get typed editor operations. */
export const getOperations = <E extends TEditor>(editor: E) =>
  editor.operations as TOperation<DescendantOf<E>>[];
