import { ReactEditor } from 'slate-react';
import { Value } from '../editor/TEditor';
import { TReactEditor } from './TReactEditor';

/**
 * Focus the editor.
 */
export const focusEditor = <V extends Value>(editor: TReactEditor<V>) =>
  ReactEditor.focus(editor as any);
