import { PlateEditor, Value } from '@udecode/plate-core';
import { KeyboardEventHandler } from '../../../mention/src/handlers/KeyboardEventHandler';
import {
  moveSelectionByOffset,
  MoveSelectionByOffsetOptions,
} from '../../../mention/src/handlers/moveSelectionByOffset';

export const emojiOnKeyDownHandler: <V extends Value>(
  options?: MoveSelectionByOffsetOptions<V>
) => (editor: PlateEditor<V>) => KeyboardEventHandler = (options) => (
  editor
) => (event) => {
  return moveSelectionByOffset(editor, options)(event);
};
