import type { EditorFragmentDeletionOptions } from 'slate/dist/interfaces/editor';

import { deleteFragment as deleteFragmentBase } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';

export const deleteFragment = (
  editor: Editor,
  options?: EditorFragmentDeletionOptions
) => deleteFragmentBase(editor as any, options);
