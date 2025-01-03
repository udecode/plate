import type { EditorDirectedDeletionOptions } from 'slate/dist/interfaces/editor';

import { deleteForward as deleteForwardBase } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';

/** Delete content in the editor forward from the current selection. */
export const deleteForward = (
  editor: TEditor,
  options: EditorDirectedDeletionOptions = {}
) => {
  const { unit = 'character' } = options;

  deleteForwardBase(editor as any, unit);
};
