import type { TElement } from '@udecode/plate-common';

import { type TReactEditor, findNodePath } from '@udecode/plate-common/react';
import { Path } from 'slate';

/** Get table row index of a cell node. */
export const getTableRowIndex = (editor: TReactEditor, cellNode: TElement) => {
  const path = findNodePath(editor, cellNode);

  if (!path) return 0;

  const rowPath = Path.parent(path);

  return rowPath.at(-1)!;
};
