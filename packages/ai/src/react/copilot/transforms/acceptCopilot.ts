import type { PlateEditor } from '@udecode/plate/react';

import { KEYS } from '@udecode/plate';
import { deserializeInlineMd } from '@udecode/plate-markdown';

import type { CopilotPluginConfig } from '../CopilotPlugin';

export const acceptCopilot = (editor: PlateEditor) => {
  const { suggestionText } = editor.getOptions<CopilotPluginConfig>({
    key: KEYS.copilot,
  });

  if (suggestionText?.length) {
    editor.tf.insertFragment(deserializeInlineMd(editor, suggestionText));
  }
};
