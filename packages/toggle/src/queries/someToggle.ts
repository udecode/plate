import { PlateEditor, someNode, Value } from '@udecode/plate-common';

import { ELEMENT_TOGGLE } from '../types';

export const someToggle = <V extends Value>(editor: PlateEditor<V>) => {
  return (
    !!editor.selection &&
    someNode(editor, {
      match: (n) => n.type === ELEMENT_TOGGLE,
    })
  );
};
