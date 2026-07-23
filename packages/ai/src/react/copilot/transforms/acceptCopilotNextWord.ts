import type { MarkdownEditor } from '@platejs/markdown';
import type { EditorUpdateTransaction } from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import type { PlateEditor } from '@platejs/core/react';

import type { CopilotPluginConfig } from '../CopilotPlugin';
import { setCopilotSuggestion } from '../withCopilot';

import { withoutAbort } from '../utils';

export const acceptCopilotNextWord = (
  editor: MarkdownEditor<PlateEditor>,
  tx: EditorUpdateTransaction
) => {
  const { getOptions } = editor.plugin<CopilotPluginConfig>({
    key: KEYS.copilot,
  });

  const { getNextWord, suggestionNodeId, suggestionText } = getOptions();

  if (!getNextWord || !suggestionText?.length) {
    return false;
  }

  const { firstWord, remainingText } = getNextWord({ text: suggestionText });

  withoutAbort(tx, () => {
    setCopilotSuggestion(tx, {
      id: suggestionNodeId ?? null,
      text: remainingText,
    });
    tx.fragment.replace(editor.api.markdown.deserializeInline(firstWord));
  });
};
