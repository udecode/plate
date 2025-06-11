import { KEYS } from 'platejs';
import { deserializeInlineMd } from '@platejs/markdown';
import { type PlateEditor, getEditorPlugin } from 'platejs/react';

import type { CopilotPluginConfig } from '../CopilotPlugin';

import { withoutAbort } from '../utils';

export const acceptCopilotNextWord = (editor: PlateEditor) => {
  const { api, getOptions } = getEditorPlugin<CopilotPluginConfig>(editor, {
    key: KEYS.copilot,
  });

  const { getNextWord, suggestionText } = getOptions();

  if (!suggestionText?.length) {
    return false;
  }

  const { firstWord, remainingText } = getNextWord!({ text: suggestionText });

  api.copilot.setBlockSuggestion({
    text: remainingText,
  });

  withoutAbort(editor, () => {
    editor.tf.insertFragment(deserializeInlineMd(editor, firstWord));
  });
};
