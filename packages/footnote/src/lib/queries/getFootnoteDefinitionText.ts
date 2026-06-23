import type { BasePlateEditor } from 'platejs';

import { getFootnoteDefinition } from './getFootnoteDefinition';

export const getFootnoteDefinitionText = (
  editor: BasePlateEditor,
  { identifier }: { identifier: string }
) => {
  const definition = getFootnoteDefinition(editor, { identifier });

  if (!definition) return;

  return editor.api.string(definition[1]);
};
