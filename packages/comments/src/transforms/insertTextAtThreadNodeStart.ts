import {
  collapseSelection,
  insertNodes,
  isText,
  PlateEditor,
  select,
  TText,
  Value,
} from '@udecode/plate-core';
import { Path } from 'slate';
import { getPreviousSiblingNode } from '../queries';
import { rebaseSelectionFromPreviousNode } from './rebaseSelectionFromPreviousNode';

export const insertTextAtThreadNodeStart = <V extends Value = Value>(
  editor: PlateEditor<V>,
  {
    at,
    text,
  }: {
    text: string;
    at: Path;
  }
) => {
  let insertHasBeenHandled = false;
  const previousSiblingNodeEntry = getPreviousSiblingNode(
    editor,
    editor.selection!.focus.path
  );
  if (previousSiblingNodeEntry && isText(previousSiblingNodeEntry[0])) {
    rebaseSelectionFromPreviousNode(editor);
  } else {
    insertNodes<TText>(
      editor,
      { text },
      {
        at,
      }
    );
    select(editor, at);
    collapseSelection(editor, { edge: 'end' });
    insertHasBeenHandled = true;
  }

  return insertHasBeenHandled;
};
