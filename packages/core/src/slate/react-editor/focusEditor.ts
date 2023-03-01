import { Location } from 'slate';
import { ReactEditor } from 'slate-react';
import { withoutNormalizing } from '../../../../slate-utils/src/slate/editor';
import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { deselect, select } from '../../../../slate-utils/src/slate/transforms';
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
