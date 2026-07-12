import type { BaseEditor } from '@platejs/core';

import { getFootnoteDefinition } from './getFootnoteDefinition';

export const getFootnoteDefinitionText = (
  editor: BaseEditor,
  { identifier }: { identifier: string }
) => {
  const definition = getFootnoteDefinition(editor, { identifier });

  if (!definition) return;

  return editor.read.text.string(definition[1]);
};
