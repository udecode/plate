import type { SlateEditor, TElement } from 'platejs';

import { KEYS } from 'platejs';

import { isDuplicateFootnoteDefinition } from '../queries/getFootnoteDefinition';
import {
  getFootnoteDefinitionsByIdentifier,
  getNextFootnoteIdentifier,
} from '../queries';

export const normalizeDuplicateFootnoteDefinition = (
  editor: SlateEditor,
  { path, identifier }: { path: number[]; identifier?: string }
) => {
  const entry = editor.api.node<TElement>(path);

  if (!entry) return false;

  const [node] = entry;
  const definitionType = editor.getType(KEYS.footnoteDefinition);

  if (node.type !== definitionType) return false;
  if (!isDuplicateFootnoteDefinition(editor, { path })) return false;

  const nextIdentifier = identifier ?? getNextFootnoteIdentifier(editor);

  if (!nextIdentifier) return false;
  if (
    nextIdentifier !==
      (node as TElement & { identifier?: string }).identifier &&
    getFootnoteDefinitionsByIdentifier(editor, {
      identifier: nextIdentifier,
    }).length > 0
  ) {
    return false;
  }

  editor.tf.setNodes({ identifier: nextIdentifier }, { at: path });

  return nextIdentifier;
};
