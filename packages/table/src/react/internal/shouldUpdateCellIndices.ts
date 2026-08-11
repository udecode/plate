import type { EditorCommit } from '@platejs/plite';

export const shouldUpdateCellIndices = (change?: EditorCommit) =>
  !change ||
  change.changed.hasAny('properties') ||
  change.changed.hasAny('structure') ||
  change.changed.hasAny('replace') ||
  change.changed.hasAny('root-order');
