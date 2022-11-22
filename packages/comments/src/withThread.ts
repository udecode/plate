import { PlateEditor, Value, WithPlatePlugin } from '@udecode/plate-core';
import { TablePlugin } from '@udecode/plate-table/src/index';
import { withInsertTextThread } from './withInsertTextThread';

export const withThread = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  plugin: WithPlatePlugin<TablePlugin<V>, V, E>
) => {
  editor = withInsertTextThread(editor, plugin);

  return editor;
};
