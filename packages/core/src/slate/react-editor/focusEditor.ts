import { ReactEditor } from 'slate-react';
import { Value } from '../types/TEditor';
import { TReactEditor } from '../types/TReactEditor';

/**
 * Focus the editor.
 */
export const focusEditor = <V extends Value>(editor: TReactEditor<V>) =>
  ReactEditor.focus(editor as any);
