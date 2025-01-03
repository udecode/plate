import { type SlateEditor, isHotkey } from '@udecode/plate-core';
import { Range } from 'slate';

export interface MoveSelectionByOffsetOptions {
  query?: (editor: SlateEditor) => boolean;
}

export const moveSelectionByOffset = (
  editor: SlateEditor,
  {
    event,
    query = () => true,
  }: {
    event: KeyboardEvent;
  } & MoveSelectionByOffsetOptions
) => {
  const { selection } = editor;

  if (!selection || Range.isExpanded(selection) || !query(editor)) {
    return false;
  }
  if (isHotkey('left', event)) {
    event.preventDefault();
    editor.tf.move({ reverse: true, unit: 'offset' });

    return true;
  }
  if (isHotkey('right', event)) {
    event.preventDefault();
    editor.tf.move({ unit: 'offset' });

    return true;
  }
};
