import type { Location } from 'slate';

import {
  type Value,
  deselect,
  select,
  withoutNormalizing,
} from '@udecode/slate';
import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/**
 * Focus the editor. Extension:
 *
 * If `target` is defined:
 *
 * - Deselect the editor (otherwise it will focus the start of the editor)
 * - Select the editor
 * - Focus the editor
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

  // From slate-react 0.99.0, setTimeout is mandatory to focus the editor after a transform.
  // setTimeout(() => {
  ReactEditor.focus(editor as any);
  // }, 0);
};
