import type { PlateEditor } from 'platejs/react';

import { deserializeInlineMd } from '@platejs/markdown';
import { KEYS } from 'platejs';

import type { CopilotPluginConfig } from '../CopilotPlugin';

export const acceptCopilot = (editor: PlateEditor) => {
  const { suggestionText } = editor.getOptions<CopilotPluginConfig>({
    key: KEYS.copilot,
  });

  if (!suggestionText?.length) return false;

  editor.tf.insertFragment(deserializeInlineMd(editor, suggestionText));
};
