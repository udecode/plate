import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction } from '@platejs/plite';

import { navigateToFootnote } from '../../internal/navigateToFootnote';
import { getFootnoteDefinition } from '../queries/getFootnoteDefinition';

export const focusFootnoteDefinition = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  { identifier }: { identifier: string }
) => {
  const definition = getFootnoteDefinition(editor, { identifier }, tx);

  if (!definition) return false;

  const point = tx.points.start(definition[1]);

  if (!point) return false;

  return navigateToFootnote(editor, tx, {
    point,
    targetPath: definition[1],
  });
};
