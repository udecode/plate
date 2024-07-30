import type { Point } from 'slate';

import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** Find a native DOM selection point from a Slate point. */
export const toDOMPoint = (editor: TReactEditor, point: Point) => {
  try {
    return ReactEditor.toDOMPoint(editor as any, point);
  } catch (error) {}
};
