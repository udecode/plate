import type { PlateEditor } from '@udecode/plate-common/react';

import { CopilotPlugin } from '..';

export const withoutAbort = (editor: PlateEditor, fn: () => void) => {
  editor.setOptions(CopilotPlugin, { shouldAbort: false });
  fn();
  editor.setOptions(CopilotPlugin, { shouldAbort: true });
};
