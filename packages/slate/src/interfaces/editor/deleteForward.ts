import type { EditorDirectedDeletionOptions } from 'slate/dist/interfaces/editor';

import { Editor } from 'slate';

import type { TEditor } from './TEditor';

/** Delete content in the editor forward from the current selection. */
export const deleteForward = (
  editor: TEditor,
  options?: EditorDirectedDeletionOptions
) => Editor.deleteForward(editor as any, options);
