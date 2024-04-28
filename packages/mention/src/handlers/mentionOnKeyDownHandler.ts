import {
  isHotkey,
  KeyboardEventHandler,
  moveSelection,
  moveSelectionByOffset,
  MoveSelectionByOffsetOptions,
  PlateEditor,
  Value,
} from '@udecode/plate-common';

import { findMentionInput } from '../queries/index';
import { removeMentionInput } from '../transforms/index';

// import {
//   moveSelectionByOffset,
//   MoveSelectionByOffsetOptions,
// } from './moveSelectionByOffset';

export const mentionOnKeyDownHandler: <V extends Value>(
  options?: MoveSelectionByOffsetOptions<V>
) => (editor: PlateEditor<V>) => KeyboardEventHandler =
  (options) => (editor) => (event) => {
    if (isHotkey('escape', event)) {
      const currentMentionInput = findMentionInput(editor)!;
      if (currentMentionInput) {
        event.preventDefault();
        removeMentionInput(editor, currentMentionInput[1]);
        moveSelection(editor, { unit: 'word' });
        return true;
      }
      return false;
    }

    return moveSelectionByOffset(editor, options)(event);
  };
