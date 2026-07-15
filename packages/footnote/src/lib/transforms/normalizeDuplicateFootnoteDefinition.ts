import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { isDuplicateFootnoteDefinition } from '../queries/getFootnoteDefinition';
import {
  getFootnoteDefinitionsByIdentifier,
  getNextFootnoteIdentifier,
} from '../queries';
import type { TFootnoteElement } from '../types';

export const normalizeDuplicateFootnoteDefinition = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  { path, identifier }: { path: number[]; identifier?: string }
) => {
  const entry = editor.read.nodes.get<TFootnoteElement>(path);

  if (!entry) return false;

  const [node] = entry;
  const definitionType = editor.getType(KEYS.footnoteDefinition);

  if (node.type !== definitionType) return false;
  if (!isDuplicateFootnoteDefinition(editor, { path }, tx)) return false;

  const nextIdentifier = identifier ?? getNextFootnoteIdentifier(editor, tx);

  if (!nextIdentifier) return false;
  if (
    nextIdentifier !== node.identifier &&
    getFootnoteDefinitionsByIdentifier(
      editor,
      {
        identifier: nextIdentifier,
      },
      tx
    ).length > 0
  ) {
    return false;
  }

  tx.nodes.set({ identifier: nextIdentifier }, { at: path });

  return nextIdentifier;
};
