import type { EditorDirectedDeletionOptions } from 'slate/dist/interfaces/editor';

import { deleteForward as deleteForwardBase } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';

/** Delete content in the editor forward from the current selection. */
export const deleteForward = (
  editor: Editor,
  options: EditorDirectedDeletionOptions = {}
) => {
  const { unit = 'character' } = options;

  deleteForwardBase(editor as any, unit);
};
