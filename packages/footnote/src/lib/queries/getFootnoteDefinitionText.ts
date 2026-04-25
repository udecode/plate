import type { SlateEditor } from 'platejs';

import { getFootnoteDefinition } from './getFootnoteDefinition';

export const getFootnoteDefinitionText = (
  editor: SlateEditor,
  { identifier }: { identifier: string }
) => {
  const definition = getFootnoteDefinition(editor, { identifier });

  if (!definition) return;

  return editor.api.string(definition[1]);
};
