import type { EditorFragmentDeletionOptions } from 'slate/dist/interfaces/editor';

import { Editor } from 'slate';

import type { TEditor, Value } from './TEditor';

/** Delete the content in the current selection. */
export const deleteFragment = <V extends Value>(
  editor: TEditor<V>,
  options?: EditorFragmentDeletionOptions
) => Editor.deleteFragment(editor as any, options);
