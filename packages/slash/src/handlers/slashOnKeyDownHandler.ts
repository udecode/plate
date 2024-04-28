import {
  isHotkey,
  moveSelection,
  PlateEditor,
  Value,
} from '@udecode/plate-common';

import { findSlashInput } from '../queries/index';
import { removeSlashInput } from '../transforms/index';
import { KeyboardEventHandler } from './KeyboardEventHandler';
import {
  moveSelectionByOffset,
  MoveSelectionByOffsetOptions,
} from './moveSelectionByOffset';

export const slashOnKeyDownHandler: <V extends Value>(
  options?: MoveSelectionByOffsetOptions<V>
) => (editor: PlateEditor<V>) => KeyboardEventHandler =
  (options) => (editor) => (event) => {
    if (isHotkey('escape', event)) {
      const currentSlashInput = findSlashInput(editor)!;
      if (currentSlashInput) {
        event.preventDefault();
        removeSlashInput(editor, currentSlashInput[1]);
        moveSelection(editor, { unit: 'word' });
        return true;
      }
      return false;
    }

    return moveSelectionByOffset(editor, options)(event);
  };
