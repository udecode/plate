import {
  getNextSiblingNodes,
  getParentNode,
  PlateEditor,
} from '@udecode/plate-core';
import { Path, Transforms } from 'slate';
import { isTextNode } from '../queries/isTextNode';
import { last } from '../utils/last';
import { changeSelectionToBeBasedOnTheNextNode } from './changeSelectionToBeBasedOnTheNextNode';

export function insertTextAtTheEndOfAThreadNode(
  editor: PlateEditor,
  threadPath: Path,
  text: string
): boolean {
  let insertHasBeenHandled = false;
  const parent = getParentNode(editor, threadPath);
  if (parent) {
    const siblings = getNextSiblingNodes(parent, threadPath);
    if (siblings.length >= 1 && isTextNode(siblings[0][0])) {
      changeSelectionToBeBasedOnTheNextNode(editor);
    } else {
      const insertPath = threadPath
        .slice(0, threadPath.length - 1)
        .concat([last(threadPath) + 1]);
      Transforms.insertNodes(
        editor as any,
        { text },
        {
          at: insertPath,
          hanging: true,
        }
      );
      Transforms.select(
        editor as any,
        threadPath
          .slice(0, threadPath.length - 1)
          .concat([last(threadPath) + 2])
      );
      Transforms.collapse(editor as any, { edge: 'end' });
      insertHasBeenHandled = true;
    }
  }

  return insertHasBeenHandled;
}
