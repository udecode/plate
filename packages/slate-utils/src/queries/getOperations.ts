import type { EDescendant, TEditor, TOperation, Value } from '@udecode/slate';

/** Get typed editor operations. */
export const getOperations = <V extends Value>(editor: TEditor<V>) =>
  editor.operations as TOperation<EDescendant<V>>[];
