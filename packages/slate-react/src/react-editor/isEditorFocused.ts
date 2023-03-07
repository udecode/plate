import { Value } from '@udecode/slate';
import { ReactEditor } from 'slate-react';
import { TReactEditor } from '../types/TReactEditor';

/**
 * Check if the editor is focused.
 */
export const isEditorFocused = <V extends Value>(editor: TReactEditor<V>) =>
  ReactEditor.isFocused(editor as any);
