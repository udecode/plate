import type { Path } from 'slate';

import {
  ELEMENT_DEFAULT,
  type PlateEditor,
  type TElement,
  type Value,
  insertNodes,
  nanoid,
} from '@udecode/plate-common';

// if at is provided, it triggers in the next block after the at; otherwise, it triggers in the next block after the current selection.
export const triggerComboboxNextBlock = <V extends Value>(
  editor: PlateEditor<V>,
  triggerText: string,
  at?: Path
) => {
  const emptyBlock = {
    children: [{ text: '' }],
    id: nanoid(),
    type: ELEMENT_DEFAULT,
  };
  insertNodes<TElement>(editor, emptyBlock, {
    at,
    nextBlock: true,
    select: true,
  });
  editor.insertText(triggerText);
};
