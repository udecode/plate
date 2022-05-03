import { ReactEditor } from 'slate-react';
import { Value } from '../types/TEditor';
import { TReactEditor } from '../types/TReactEditor';

/**
 * Deselect the editor.
 */
export const deselectEditor = <V extends Value>(editor: TReactEditor<V>) =>
  ReactEditor.deselect(editor as any);
