import type { PlateEditor } from '@platejs/core/react';

import type { MarkdownEditor } from '@platejs/markdown';
import type { EditorUpdateTransaction } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { CopilotPluginConfig } from '../CopilotPlugin';
import { setCopilotSuggestion } from '../withCopilot';
import { withoutAbort } from '../utils';

export const acceptCopilot = (
  editor: MarkdownEditor<PlateEditor>,
  tx: EditorUpdateTransaction
) => {
  const { suggestionText } = editor
    .plugin<CopilotPluginConfig>({ key: KEYS.copilot })
    .getOptions();

  if (!suggestionText?.length) return false;

  withoutAbort(tx, () => {
    setCopilotSuggestion(tx, { id: null, text: null });
    tx.fragment.replace(editor.api.markdown.deserializeInline(suggestionText));
  });
};
