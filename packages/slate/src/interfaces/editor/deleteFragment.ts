import type { EditorFragmentDeletionOptions } from 'slate/dist/interfaces/editor';

import { Editor } from 'slate';

import type { TEditor } from './TEditor';

/** Delete the content in the current selection. */
export const deleteFragment = (
  editor: TEditor,
  options?: EditorFragmentDeletionOptions
) => Editor.deleteFragment(editor as any, options);
