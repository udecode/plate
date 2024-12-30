import type { DescendantOf, TEditor } from '../interfaces';
import type { TOperation } from '../types';

/** Get typed editor operations. */
export const getOperations = <E extends TEditor>(editor: E) =>
  editor.operations as TOperation<DescendantOf<E>>[];
