import type { TEditor } from '@udecode/slate';
import type { Point } from 'slate';

import { ReactEditor } from 'slate-react';

/** Find a native DOM selection point from a Slate point. */
export const toDOMPoint = (editor: TEditor, point: Point) => {
  try {
    return ReactEditor.toDOMPoint(editor as any, point);
  } catch (error) {}
};
