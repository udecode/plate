import { getNode, PlateEditor } from '@udecode/plate-core';
import { Path } from 'slate';
import { last } from '../utils/last';

export const retrievePreviousSibling = (editor: PlateEditor, path: Path) => {
  const index = last(path);
  if (index > 0) {
    const previousSiblingIndex = index - 1;
    const previousSiblingPath = path
      .slice(0, path.length - 1)
      .concat([previousSiblingIndex]);
    const previousSiblingNode = getNode(editor, previousSiblingPath);
    return previousSiblingNode
      ? [previousSiblingNode, previousSiblingPath]
      : undefined;
  }
};
