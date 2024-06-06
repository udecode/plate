import type { EditorDirectedDeletionOptions } from 'slate/dist/interfaces/editor';

import { Editor } from 'slate';

import type { TEditor, Value } from './TEditor';

/** Delete content in the editor forward from the current selection. */
export const deleteForward = <V extends Value>(
  editor: TEditor<V>,
  options?: EditorDirectedDeletionOptions
) => Editor.deleteForward(editor as any, options);
