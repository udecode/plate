import {
  deselect,
  select,
  Value,
  withoutNormalizing,
} from '@udecode/slate-utils';
import { Location } from 'slate';
import { ReactEditor } from 'slate-react';
import { TReactEditor } from './TReactEditor';

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
