import type { EditorDirectedDeletionOptions } from 'slate/dist/interfaces/editor';

import { Editor } from 'slate';

import type { TEditor, Value } from './TEditor';

/** Delete content in the editor backward from the current selection. */
export const deleteBackward = <V extends Value>(
  editor: TEditor<V>,
  options?: EditorDirectedDeletionOptions
) => Editor.deleteBackward(editor as any, options);
