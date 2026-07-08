import type { PlateEditor } from 'platejs/react';

import { CopilotPlugin } from '..';

export const withoutAbort = (editor: PlateEditor, fn: () => void) => {
  editor.plugin(CopilotPlugin).setOption('shouldAbort', false);
  fn();
  editor.plugin(CopilotPlugin).setOption('shouldAbort', true);
};
