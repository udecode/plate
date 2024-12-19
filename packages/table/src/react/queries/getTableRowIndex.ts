import type { TEditor, TElement } from '@udecode/plate-common';

import { findPath } from '@udecode/plate-common/react';
import { Path } from 'slate';

/** Get table row index of a cell node. */
export const getTableRowIndex = (editor: TEditor, cellNode: TElement) => {
  const path = findPath(editor, cellNode);

  if (!path) return 0;

  const rowPath = Path.parent(path);

  return rowPath.at(-1)!;
};
