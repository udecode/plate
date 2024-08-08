import type { EditorDirectedDeletionOptions } from 'slate/dist/interfaces/editor';

import { Editor } from 'slate';

import type { TEditor } from './TEditor';

/** Delete content in the editor backward from the current selection. */
export const deleteBackward = (
  editor: TEditor,
  options?: EditorDirectedDeletionOptions
) => Editor.deleteBackward(editor as any, options);
