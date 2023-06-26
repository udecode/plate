import { moveSelection, PlateEditor, Value } from '@udecode/plate-common';
import isHotkey from 'is-hotkey';
import { Range } from 'slate';
import { KeyboardEventHandler } from './KeyboardEventHandler';

export interface MoveSelectionByOffsetOptions<V extends Value = Value> {
  query?: (editor: PlateEditor<V>) => boolean;
}

// TODO: move to core
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
