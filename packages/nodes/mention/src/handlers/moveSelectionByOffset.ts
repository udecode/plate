import { PlateEditor } from '@udecode/plate-core';
import { Range, Transforms } from 'slate';
import { KeyboardEventHandler } from './KeyboardEventHandler';

export interface MoveSelectionByOffsetOptions {
  query?: (editor: PlateEditor) => boolean;
}

// TODO: move to core
export const moveSelectionByOffset: (
  editor: PlateEditor,
  options?: MoveSelectionByOffsetOptions
) => KeyboardEventHandler = (editor, { query = () => true } = {}) => (
  event
) => {
  const { selection } = editor;

  if (!selection || Range.isExpanded(selection) || !query(editor)) {
    return false;
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    Transforms.move(editor, { unit: 'offset', reverse: true });
    return true;
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault();
    Transforms.move(editor, { unit: 'offset' });
    return true;
  }
};
