import {
  collapseSelection,
  getNextSiblingNodes,
  getParentNode,
  insertNodes,
  isText,
  PlateEditor,
  select,
} from '@udecode/plate-core';
import { last } from 'lodash';
import { Path } from 'slate';
import { changeSelectionToBeBasedOnTheNextNode } from './changeSelectionToBeBasedOnTheNextNode';

export const insertTextAtTheEndOfAThreadNode = (
  editor: PlateEditor,
  threadPath: Path,
  text: string
) => {
  let insertHasBeenHandled = false;
  const parent = getParentNode(editor, threadPath);
  if (parent) {
    const siblings = getNextSiblingNodes(parent, threadPath);
    // @ts-ignore
    if (siblings.length >= 1 && isText(siblings[0][0])) {
      changeSelectionToBeBasedOnTheNextNode(editor);
    } else {
      const insertPath = threadPath
        .slice(0, threadPath.length - 1)
        .concat([last(threadPath)! + 1]);
      insertNodes(
        editor,
        { text },
        {
          at: insertPath,
          hanging: true,
        }
      );
      select(
        editor,
        threadPath
          .slice(0, threadPath.length - 1)
          .concat([last(threadPath)! + 2])
      );
      collapseSelection(editor, { edge: 'end' });
      insertHasBeenHandled = true;
    }
  }

  return insertHasBeenHandled;
};
