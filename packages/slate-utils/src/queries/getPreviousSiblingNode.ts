import type { Path } from 'slate';

import { type TEditor, type Value, getNode } from '@udecode/slate';
import last from 'lodash/last.js';

export const getPreviousSiblingNode = <V extends Value = Value>(
  editor: TEditor<V>,
  path: Path
) => {
  const index = last(path)!;

  if (index > 0) {
    const previousSiblingIndex = index - 1;
    const previousSiblingPath = path
      .slice(0, -1)
      .concat([previousSiblingIndex]);
    const previousSiblingNode = getNode(editor, previousSiblingPath);

    return previousSiblingNode
      ? [previousSiblingNode, previousSiblingPath]
      : undefined;
  }
};
