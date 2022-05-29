import { PlateEditor, Value } from '@udecode/plate-core';
import { withDeleteTable } from './withDeleteTable';
import { withGetFragmentTable } from './withGetFragmentTable';
import { withInsertFragmentTable } from './withInsertFragmentTable';

export const withTable = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E
) => {
  editor = withDeleteTable<V, E>(editor);
  editor = withGetFragmentTable<V, E>(editor);
  editor = withInsertFragmentTable<V, E>(editor);

  return editor;
};
