import {
  collapseSelection,
  insertNodes,
  isText,
  PlateEditor,
  select,
} from '@udecode/plate-core';
import { Path } from 'slate';
import { retrievePreviousSibling } from '../queries';
import { changeSelectionToBeBasedOnThePreviousNode } from './changeSelectionToBeBasedOnThePreviousNode';

export const insertTextAtTheStartOfAThreadNode = (
  editor: PlateEditor,
  threadPath: Path,
  text: string
) => {
  let insertHasBeenHandled = false;
  const previousSiblingNodeEntry = retrievePreviousSibling(
    editor,
    editor.selection!.focus.path
  );
  if (previousSiblingNodeEntry && isText(previousSiblingNodeEntry[0])) {
    changeSelectionToBeBasedOnThePreviousNode(editor);
  } else {
    const insertPath = threadPath;
    insertNodes(
      editor,
      { text },
      {
        at: insertPath,
      }
    );
    select(editor, insertPath);
    collapseSelection(editor, { edge: 'end' });
    insertHasBeenHandled = true;
  }

  return insertHasBeenHandled;
};
