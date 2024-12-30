import type { EditorFragmentDeletionOptions } from 'slate/dist/interfaces/editor';

import { Editor } from 'slate';

import type { TEditor } from './TEditor';

export const deleteFragment = (
  editor: TEditor,
  options?: EditorFragmentDeletionOptions
) => Editor.deleteFragment(editor as any, options);
