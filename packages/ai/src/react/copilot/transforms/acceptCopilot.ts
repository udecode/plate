import type { PlateEditor } from '@udecode/plate-common/react';

import { deserializeInlineMd } from '@udecode/plate-markdown';

import type { CopilotPluginConfig } from '../CopilotPlugin';

export const acceptCopilot = (editor: PlateEditor) => {
  const { suggestionText } = editor.getOptions<CopilotPluginConfig>({
    key: 'copilot',
  });

  if (suggestionText?.length) {
    editor.insertFragment(deserializeInlineMd(editor, suggestionText));
  }
};
