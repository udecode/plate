import type {
  PlateEditor,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common/server';

import type { ListPlugin } from './types';

import { deleteBackwardList } from './deleteBackwardList';
import { deleteForwardList } from './deleteForwardList';
import { deleteFragmentList } from './deleteFragmentList';
import { insertBreakList } from './insertBreakList';
import { insertFragmentList } from './insertFragmentList';
import { normalizeList } from './normalizers/index';

export const withList = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  { options: { validLiChildrenTypes } }: WithPlatePlugin<ListPlugin, V, E>
) => {
  const { deleteBackward, deleteForward, deleteFragment, insertBreak } = editor;

  editor.insertBreak = () => {
    if (insertBreakList(editor)) return;

    insertBreak();
  };

  editor.deleteBackward = (unit) => {
    if (deleteBackwardList(editor, unit)) return;

    deleteBackward(unit);
  };

  editor.deleteForward = (unit) => {
    if (deleteForwardList(editor, deleteForward, unit)) return;

    deleteForward(unit);
  };

  editor.deleteFragment = (direction) => {
    if (deleteFragmentList(editor)) return;

    deleteFragment(direction);
  };

  editor.insertFragment = insertFragmentList(editor);

  editor.normalizeNode = normalizeList(editor, { validLiChildrenTypes });

  return editor;
};
