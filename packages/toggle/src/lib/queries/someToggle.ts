import { type SlateEditor, someNode } from '@udecode/plate-common';

import { BaseTogglePlugin } from '../BaseTogglePlugin';

export const someToggle = (editor: SlateEditor) => {
  return (
    !!editor.selection &&
    someNode(editor, {
      match: (n) => n.type === BaseTogglePlugin.key,
    })
  );
};
