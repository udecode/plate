import type {
  PlateEditor,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common/server';

import type { TablePlugin } from './types';

import { withDeleteTable } from './withDeleteTable';
import { withGetFragmentTable } from './withGetFragmentTable';
import { withInsertFragmentTable } from './withInsertFragmentTable';
import { withInsertTextTable } from './withInsertTextTable';
import { withMarkTable } from './withMarkTable';
import { withNormalizeTable } from './withNormalizeTable';
import { withSelectionTable } from './withSelectionTable';
import { withSetFragmentDataTable } from './withSetFragmentDataTable';

export const withTable = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  plugin: WithPlatePlugin<TablePlugin<V>, V, E>
) => {
  editor = withNormalizeTable<V, E>(editor);
  editor = withDeleteTable<V, E>(editor);
  editor = withGetFragmentTable<V, E>(editor);
  editor = withInsertFragmentTable<V, E>(editor, plugin);
  editor = withInsertTextTable<V, E>(editor, plugin);
  editor = withSelectionTable<V, E>(editor);
  editor = withSetFragmentDataTable<V, E>(editor);
  editor = withMarkTable<V, E>(editor);

  return editor;
};
