import { ReactEditor } from 'slate-react';
import { Value } from '../editor/index';
import { TReactEditor } from './TReactEditor';

/**
 * Check if the user is currently composing inside the editor.
 */
export const isComposing = <V extends Value>(editor: TReactEditor<V>) =>
  ReactEditor.isComposing(editor as any);
