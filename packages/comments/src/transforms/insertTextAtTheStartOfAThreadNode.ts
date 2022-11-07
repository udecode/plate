import { isText, PlateEditor } from '@udecode/plate-core';
import { Path, Transforms } from 'slate';
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
    Transforms.insertNodes(
      editor as any,
      { text },
      {
        at: insertPath,
      }
    );
    Transforms.select(editor as any, insertPath);
    Transforms.collapse(editor as any, { edge: 'end' });
    insertHasBeenHandled = true;
  }

  return insertHasBeenHandled;
};
