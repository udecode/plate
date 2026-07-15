import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction } from '@platejs/plite';

import { ensureFootnoteRegistry } from '../registry';

const NUMERIC_IDENTIFIER_REGEX = /^\d+$/;

export const getNextFootnoteIdentifier = (
  editor: BaseEditor,
  tx?: EditorUpdateTransaction
) => {
  const used = new Set<number>();
  const registry = ensureFootnoteRegistry(editor, tx);

  for (const identifier of registry.definitionsByIdentifier.keys()) {
    if (NUMERIC_IDENTIFIER_REGEX.test(identifier)) {
      used.add(Number.parseInt(identifier, 10));
    }
  }

  for (const identifier of registry.referencesByIdentifier.keys()) {
    if (NUMERIC_IDENTIFIER_REGEX.test(identifier)) {
      used.add(Number.parseInt(identifier, 10));
    }
  }

  let next = 1;

  while (used.has(next)) {
    next += 1;
  }

  return `${next}`;
};
