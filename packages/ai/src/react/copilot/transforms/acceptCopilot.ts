import type { PlateEditor } from '@platejs/core/react';

import { deserializeInlineMd } from '@platejs/markdown';
import type { EditorUpdateTransaction } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { CopilotPluginConfig } from '../CopilotPlugin';
import { copilotSuggestionField } from '../withCopilot';
import { withoutAbort } from '../utils';

export const acceptCopilot = (
  editor: PlateEditor,
  tx: EditorUpdateTransaction
) => {
  const { suggestionText } = editor
    .plugin<CopilotPluginConfig>(KEYS.copilot)
    .getOptions();

  if (!suggestionText?.length) return false;

  withoutAbort(editor, () => {
    tx.setField(copilotSuggestionField, { id: null, text: null });
    tx.fragment.insert(deserializeInlineMd(editor, suggestionText));
  });
};
