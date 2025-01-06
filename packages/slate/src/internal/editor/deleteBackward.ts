import type { EditorDirectedDeletionOptions } from 'slate/dist/interfaces/editor';

import { deleteBackward as deleteBackwardBase } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';

/** Delete content in the editor backward from the current selection. */
export const deleteBackward = (
  editor: Editor,
  options: EditorDirectedDeletionOptions = {}
) => {
  const { unit = 'character' } = options;

  deleteBackwardBase(editor as any, unit);
};
