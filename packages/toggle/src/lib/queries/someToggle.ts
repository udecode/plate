import type { SlateEditor } from '@udecode/plate';

import { BaseTogglePlugin } from '../BaseTogglePlugin';

export const someToggle = (editor: SlateEditor) => {
  return (
    !!editor.selection &&
    editor.api.some({
      match: (n) => n.type === BaseTogglePlugin.key,
    })
  );
};
