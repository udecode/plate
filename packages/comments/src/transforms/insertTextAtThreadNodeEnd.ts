import {
  collapseSelection,
  getNextSiblingNodes,
  getParentNode,
  insertNodes,
  isText,
  PlateEditor,
  select,
  TText,
  Value,
} from '@udecode/plate-core';
import { last } from 'lodash';
import { Path } from 'slate';
import { rebaseSelectionFromNextNode } from './rebaseSelectionFromNextNode';

export const insertTextAtThreadNodeEnd = <V extends Value = Value>(
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
  const parent = getParentNode(editor, at);
  if (parent) {
    const siblings = getNextSiblingNodes(parent, at);
    // @ts-ignore
    if (siblings.length >= 1 && isText(siblings[0][0])) {
      rebaseSelectionFromNextNode(editor);
    } else {
      const insertPath = at.slice(0, at.length - 1).concat([last(at)! + 1]);
      insertNodes<TText>(
        editor,
        { text },
        {
          at: insertPath,
          hanging: true,
        }
      );
      select(editor, at.slice(0, at.length - 1).concat([last(at)! + 2]));
      collapseSelection(editor, { edge: 'end' });
      insertHasBeenHandled = true;
    }
  }

  return insertHasBeenHandled;
};
