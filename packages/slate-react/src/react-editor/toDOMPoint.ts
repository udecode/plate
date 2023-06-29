import { Value } from '@udecode/slate';
import { Point } from 'slate';
import { ReactEditor } from 'slate-react';

import { TReactEditor } from '../types/TReactEditor';

/**
 * Find a native DOM selection point from a Slate point.
 */
export const toDOMPoint = <V extends Value>(
  editor: TReactEditor<V>,
  point: Point
) => {
  try {
    return ReactEditor.toDOMPoint(editor as any, point);
  } catch (error) {}
};
