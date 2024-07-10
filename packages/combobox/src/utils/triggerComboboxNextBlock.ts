import {
  ELEMENT_DEFAULT,
  type PlateEditor,
  type TElement,
  type Value,
  insertNodes,
  nanoid,
} from '@udecode/plate-common';
import { Path } from 'slate';

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

  let _at: Path | undefined;

  if (at) {
    const slicedPath = at.slice(0, 1);
    _at = Path.next(slicedPath);
  }

  insertNodes<TElement>(editor, emptyBlock, {
    at: _at,
    select: true,
  });
  editor.insertText(triggerText);
};
