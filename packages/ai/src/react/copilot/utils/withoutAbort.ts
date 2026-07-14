import type { PlateEditor } from '@platejs/core/react';

import { KEYS } from '@platejs/utils';

import type { CopilotPluginConfig } from '../CopilotPlugin';

export const withoutAbort = <T>(editor: PlateEditor, fn: () => T): T => {
  const copilot = editor.plugin<CopilotPluginConfig>(KEYS.copilot);

  copilot.setOption('shouldAbort', false);
  try {
    return fn();
  } finally {
    copilot.setOption('shouldAbort', true);
  }
};
