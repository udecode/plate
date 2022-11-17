import { PlateEditor, Value } from '@udecode/plate-core';
import {
  KeyboardEventHandler,
  moveSelectionByOffset,
  MoveSelectionByOffsetOptions,
} from '@udecode/plate-mention';

export const emojiOnKeyDownHandler: <V extends Value>(
  options?: MoveSelectionByOffsetOptions<V>
) => (editor: PlateEditor<V>) => KeyboardEventHandler = (options) => (
  editor
) => (event) => {
  return moveSelectionByOffset(editor, options)(event);
};
