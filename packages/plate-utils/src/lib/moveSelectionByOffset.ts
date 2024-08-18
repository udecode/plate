import { type SlateEditor, isHotkey } from '@udecode/plate-core';
import { moveSelection } from '@udecode/slate';
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
    moveSelection(editor, { reverse: true, unit: 'offset' });

    return true;
  }
  if (isHotkey('right', event)) {
    event.preventDefault();
    moveSelection(editor, { unit: 'offset' });

    return true;
  }
};
