import { PlateEditor } from '@udecode/plate-core';
import { Path, Transforms } from 'slate';
import { changeSelectionToBeBasedOnThePreviousNode } from './changeSelectionToBeBasedOnThePreviousNode';
import { isTextNode } from './isTextNode';
import { retrieveNode } from './retrieveNode';
import { retrievePreviousSibling } from './retrievePreviousSibling';

export function insertTextAtTheStartOfAThreadNode(
  editor: PlateEditor,
  threadPath: Path,
  text: string
): boolean {
  let insertHasBeenHandled = false;
  const previousSiblingNodeEntry = retrievePreviousSibling(
    editor,
    editor.selection!.focus.path
  );
  if (
    previousSiblingNodeEntry &&
    isTextNode(retrieveNode(previousSiblingNodeEntry))
  ) {
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
}
