import type { BaseEditor } from '@platejs/core';
import {
  type EditorUpdateTransaction,
  type Path,
  PathApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { TFootnoteElement } from '../types';

const NUMERIC_IDENTIFIER_REGEX = /^\d+$/;

export const normalizeDuplicateFootnoteDefinition = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  { path, identifier }: { path: Path; identifier?: string }
) => {
  const entry = tx.nodes.get<TFootnoteElement>(path);

  if (!entry) return false;

  const [node] = entry;
  const definitionType = editor.getType(KEYS.footnoteDefinition);
  const referenceType = editor.getType(KEYS.footnoteReference);

  if (node.type !== definitionType) return false;

  const footnotes = tx.nodes.toArray<TFootnoteElement>({
    at: [],
    match: { type: [definitionType, referenceType] },
  });
  const definitions = footnotes.filter(
    ([candidate]) => candidate.type === definitionType
  );
  const duplicate = definitions
    .filter(([candidate]) => candidate.identifier === node.identifier)
    .some(
      ([, candidatePath], index) =>
        index > 0 && PathApi.equals(candidatePath, path)
    );

  if (!duplicate) return false;

  const nextIdentifier =
    identifier ??
    (() => {
      const used = new Set<number>();

      for (const [footnote] of footnotes) {
        if (
          footnote.identifier &&
          NUMERIC_IDENTIFIER_REGEX.test(footnote.identifier)
        ) {
          used.add(Number.parseInt(footnote.identifier, 10));
        }
      }

      let next = 1;

      while (used.has(next)) next += 1;

      return `${next}`;
    })();

  if (
    nextIdentifier !== node.identifier &&
    definitions.some(([definition]) => definition.identifier === nextIdentifier)
  ) {
    return false;
  }

  tx.nodes.set({ identifier: nextIdentifier }, { at: path });

  return nextIdentifier;
};
