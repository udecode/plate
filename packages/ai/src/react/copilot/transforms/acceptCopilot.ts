import type { PlateEditor } from '@udecode/plate-common/react';

import type { CopilotPluginConfig } from '../CopilotPlugin';

import { deserializeInlineMd } from '../utils/deserializeInlineMd';

export const acceptCopilot = (editor: PlateEditor) => {
  const { suggestionText } = editor.getOptions<CopilotPluginConfig>({
    key: 'copilot',
  });

  if (suggestionText?.length) {
    editor.insertFragment(deserializeInlineMd(editor, suggestionText));
  }
};
