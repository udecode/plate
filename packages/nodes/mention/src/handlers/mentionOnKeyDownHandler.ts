import { PlateEditor, Value } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { findMentionInput } from '../queries';
import { removeMentionInput } from '../transforms';
import { KeyboardEventHandler } from './KeyboardEventHandler';
import {
  moveSelectionByOffset,
  MoveSelectionByOffsetOptions,
} from './moveSelectionByOffset';

export const mentionOnKeyDownHandler: <V extends Value>(
  options?: MoveSelectionByOffsetOptions<V>
) => (editor: PlateEditor<V>) => KeyboardEventHandler = (options) => (
  editor
) => (event) => {
  if (isHotkey('escape', event)) {
    event.preventDefault();
    const currentMentionInput = findMentionInput(editor)!;
    if (currentMentionInput) {
      removeMentionInput(editor, currentMentionInput[1]);
    }
    return true;
  }

  return moveSelectionByOffset(editor, options)(event);
};
