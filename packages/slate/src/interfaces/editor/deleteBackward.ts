import type { EditorDirectedDeletionOptions } from 'slate/dist/interfaces/editor';

import { deleteBackward as deleteBackwardBase } from 'slate';

import type { TEditor } from './TEditor';

/** Delete content in the editor backward from the current selection. */
export const deleteBackward = (
  editor: TEditor,
  options: EditorDirectedDeletionOptions = {}
) => {
  const { unit = 'character' } = options;

  deleteBackwardBase(editor as any, unit);
};
