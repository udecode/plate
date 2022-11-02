import { PlateEditor } from '@udecode/plate-core';
import { Path, Transforms } from 'slate';
import { isTextNode, retrieveNode, retrievePreviousSibling } from '../queries';
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
  if (
    previousSiblingNodeEntry &&
    // @ts-ignore
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
};
