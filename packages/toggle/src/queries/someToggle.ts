import { type PlateEditor, someNode } from '@udecode/plate-common/server';

import { ELEMENT_TOGGLE } from '../types';

export const someToggle = (editor: PlateEditor) => {
  return (
    !!editor.selection &&
    someNode(editor, {
      match: (n) => n.type === ELEMENT_TOGGLE,
    })
  );
};
