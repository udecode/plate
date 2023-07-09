import { Value, deselect, select, withoutNormalizing } from '@udecode/slate';
import { Location } from 'slate';
import { ReactEditor } from 'slate-react';

import { TReactEditor } from '../types/TReactEditor';

/**
 * Focus the editor. Extension:
 *
 * If `target` is defined:
 * - deselect the editor (otherwise it will focus the start of the editor)
 * - select the editor
 * - focus the editor
 */
export const focusEditor = <V extends Value>(
  editor: TReactEditor<V>,
  target?: Location
) => {
  if (target) {
    withoutNormalizing(editor, () => {
      deselect(editor);
      select(editor, target);
    });
  }
  ReactEditor.focus(editor as any);
};
