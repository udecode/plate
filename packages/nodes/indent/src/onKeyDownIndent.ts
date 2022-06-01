import {
  KeyboardHandlerReturnType,
  PlateEditor,
  Value,
} from '@udecode/plate-core';
import { ReactEditor } from 'slate-react';
import { indent, outdent } from './transforms/index';

export const onKeyDownIndent = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E
): KeyboardHandlerReturnType => (e) => {
  if (
    e.key === 'Tab' &&
    !e.altKey &&
    !e.ctrlKey &&
    !e.metaKey &&
    !ReactEditor.isComposing((editor as unknown) as ReactEditor)
  ) {
    e.preventDefault();
    e.shiftKey ? outdent(editor) : indent(editor);
  }
};
