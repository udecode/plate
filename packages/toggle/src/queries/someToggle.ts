import { type PlateEditor, someNode } from '@udecode/plate-common';

import { TogglePlugin } from '../TogglePlugin';

export const someToggle = (editor: PlateEditor) => {
  return (
    !!editor.selection &&
    someNode(editor, {
      match: (n) => n.type === TogglePlugin.key,
    })
  );
};
