import type { TEditor } from '@udecode/plate-common';

import { findNode, getStartPoint, select } from '@udecode/plate-common';
import { focusEditor } from '@udecode/plate-common/react';

/** Select the start of a block by id and focus the editor. */
export const focusBlockStartById = (editor: TEditor, id: string) => {
  const path = findNode(editor, { at: [], match: { id } })?.[1];

  if (!path) return;

  select(editor, getStartPoint(editor, path));
  focusEditor(editor);
};
