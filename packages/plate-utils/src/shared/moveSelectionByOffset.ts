import {
  type KeyboardEventHandler,
  type PlateEditor,
  isHotkey,
} from '@udecode/plate-core/server';
import { moveSelection } from '@udecode/slate';
import { Range } from 'slate';

export interface MoveSelectionByOffsetOptions {
  query?: (editor: PlateEditor) => boolean;
}

export const moveSelectionByOffset: (
  editor: PlateEditor,
  options?: MoveSelectionByOffsetOptions
) => KeyboardEventHandler =
  (editor, { query = () => true } = {}) =>
  (event) => {
    const { selection } = editor;

    if (!selection || Range.isExpanded(selection) || !query(editor)) {
      return false;
    }
    if (isHotkey('left', event)) {
      event.preventDefault();
      moveSelection(editor, { reverse: true, unit: 'offset' });

      return true;
    }
    if (isHotkey('right', event)) {
      event.preventDefault();
      moveSelection(editor, { unit: 'offset' });

      return true;
    }
  };
