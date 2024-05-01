import {
  isHotkey,
  KeyboardEventHandler,
  PlateEditor,
} from '@udecode/plate-core';
import { moveSelection, Value } from '@udecode/slate';
import { Range } from 'slate';

export interface MoveSelectionByOffsetOptions<V extends Value = Value> {
  query?: (editor: PlateEditor<V>) => boolean;
}

export const moveSelectionByOffset: <V extends Value>(
  editor: PlateEditor<V>,
  options?: MoveSelectionByOffsetOptions<V>
) => KeyboardEventHandler =
  (editor, { query = () => true } = {}) =>
  (event) => {
    const { selection } = editor;

    if (!selection || Range.isExpanded(selection) || !query(editor)) {
      return false;
    }

    if (isHotkey('left', event)) {
      event.preventDefault();
      moveSelection(editor, { unit: 'offset', reverse: true });
      return true;
    }

    if (isHotkey('right', event)) {
      event.preventDefault();
      moveSelection(editor, { unit: 'offset' });
      return true;
    }
  };
