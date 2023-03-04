import { Value } from '@udecode/slate-utils';
import { ReactEditor } from 'slate-react';
import { TReactEditor } from './TReactEditor';

/**
 * Check if the editor is in read-only mode.
 */
export const isEditorReadOnly = <V extends Value>(editor: TReactEditor<V>) =>
  ReactEditor.isReadOnly(editor as any);
