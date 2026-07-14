import { deserializeInlineMd } from '@platejs/markdown';
import type { EditorUpdateTransaction } from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import type { PlateEditor } from '@platejs/core/react';

import type { CopilotPluginConfig } from '../CopilotPlugin';
import { copilotSuggestionField } from '../withCopilot';

import { withoutAbort } from '../utils';

export const acceptCopilotNextWord = (
  editor: PlateEditor,
  tx: EditorUpdateTransaction
) => {
  const { getOptions } = editor.plugin<CopilotPluginConfig>(KEYS.copilot);

  const { getNextWord, suggestionNodeId, suggestionText } = getOptions();

  if (!getNextWord || !suggestionText?.length) {
    return false;
  }

  const { firstWord, remainingText } = getNextWord({ text: suggestionText });

  withoutAbort(editor, () => {
    tx.setField(copilotSuggestionField, {
      id: suggestionNodeId ?? null,
      text: remainingText,
    });
    tx.fragment.insert(deserializeInlineMd(editor, firstWord));
  });
};
