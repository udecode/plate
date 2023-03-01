import { ReactEditor } from 'slate-react';
import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { TReactEditor } from './TReactEditor';

/**
 * Check if the editor is focused.
 */
export const isEditorFocused = <V extends Value>(editor: TReactEditor<V>) =>
  ReactEditor.isFocused(editor as any);
