import { deserializeInlineMd } from '@udecode/plate-markdown';
import { type PlateEditor, getEditorPlugin } from '@udecode/plate/react';

import type { CopilotPluginConfig } from '../CopilotPlugin';

import { withoutAbort } from '../utils';

export const acceptCopilotNextWord = (editor: PlateEditor) => {
  const { api, getOptions } = getEditorPlugin<CopilotPluginConfig>(editor, {
    key: 'copilot',
  });

  const { getNextWord, suggestionText } = getOptions();

  if (suggestionText?.length) {
    const { firstWord, remainingText } = getNextWord!({ text: suggestionText });

    api.copilot.setBlockSuggestion({
      text: remainingText,
    });

    withoutAbort(editor, () => {
      editor.tf.insertFragment(deserializeInlineMd(editor, firstWord));
    });
  }
};
