import { TEditor, Value } from '../slate/editor/TEditor';
import { EDescendant } from '../slate/node/TDescendant';
import { TOperation } from '../slate/types/TOperation';

/**
 * Get typed editor operations.
 */
export const getOperations = <V extends Value>(editor: TEditor<V>) =>
  editor.operations as TOperation<EDescendant<V>>[];
