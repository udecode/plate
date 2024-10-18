import type { PlateEditor } from '@udecode/plate-common/react';

import { CopilotPlugin } from '..';

export const withoutAbort = (editor: PlateEditor, fn: () => void) => {
  editor.setOption(CopilotPlugin, 'shouldAbort', false);
  fn();
  editor.setOption(CopilotPlugin, 'shouldAbort', true);
};
