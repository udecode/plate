import { Path, Point } from 'slate';
import { getPointAfter } from '../slate/editor/getPointAfter';
import { getPointBefore } from '../slate/editor/getPointBefore';
import { getVoidNode } from '../slate/editor/getVoidNode';
import { TEditor, Value } from '../slate/editor/TEditor';
import { getBlockAbove } from './getBlockAbove';

/**
 * If the start point is inside an inline void, get the point before or after it.
 */
export const getPointNextToVoid = <V extends Value>(
  editor: TEditor<V>,
  {
    at,
    after,
  }: {
    at: Point;
    /**
     * Get the point after (instead of before) the void node.
     */
    after?: boolean;
  }
) => {
  const startVoid = getVoidNode(editor, { at, mode: 'highest' });

  if (startVoid) {
    const blockAbove = getBlockAbove(editor, { at });

    if (blockAbove) {
      let nextPoint: Point | undefined;
      if (after) {
        nextPoint = getPointAfter(editor, at);
      } else {
        nextPoint = getPointBefore(editor, at);
      }

      if (
        nextPoint &&
        blockAbove &&
        Path.isAncestor(blockAbove[1], nextPoint.path)
      ) {
        at = nextPoint;
      }
    }
  }

  return at;
};
