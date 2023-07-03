import { PlateEditor, Value } from '@udecode/plate-common';
import isHotkey from 'is-hotkey';

import { findMentionInput } from '../queries/index';
import { removeMentionInput } from '../transforms/index';
import { KeyboardEventHandler } from './KeyboardEventHandler';
import {
  MoveSelectionByOffsetOptions,
  moveSelectionByOffset,
} from './moveSelectionByOffset';

export const mentionOnKeyDownHandler: <V extends Value>(
  options?: MoveSelectionByOffsetOptions<V>
) => (editor: PlateEditor<V>) => KeyboardEventHandler =
  (options) => (editor) => (event) => {
    if (isHotkey('escape', event)) {
      const currentMentionInput = findMentionInput(editor)!;
      if (currentMentionInput) {
        event.preventDefault();
        removeMentionInput(editor, currentMentionInput[1]);
        return true;
      }
      return false;
    }

    return moveSelectionByOffset(editor, options)(event);
  };
