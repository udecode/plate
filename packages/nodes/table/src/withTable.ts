import { PlateEditor, Value, WithPlatePlugin } from '@udecode/plate-core';
import { TablePlugin } from './types';
import { withDeleteTable } from './withDeleteTable';
import { withGetFragmentTable } from './withGetFragmentTable';
import { withInsertFragmentTable } from './withInsertFragmentTable';

export const withTable = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  plugin: WithPlatePlugin<TablePlugin<V, E>>
) => {
  editor = withDeleteTable<V, E>(editor);
  editor = withGetFragmentTable<V, E>(editor);
  editor = withInsertFragmentTable<V, E>(editor, plugin);

  return editor;
};
