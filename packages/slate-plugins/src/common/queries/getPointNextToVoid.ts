import { Editor, Path, Point } from 'slate';
import { getBlockAbove } from './getBlockAbove';

/**
 * If the start point is inside an inline void, get the point before or after it.
 */
export const getPointNextToVoid = (
  editor: Editor,
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
  const startVoid = Editor.void(editor, { at, mode: 'highest' });

  if (startVoid) {
    const blockAbove = getBlockAbove(editor, { at });

    if (blockAbove) {
      let nextPoint: Point | undefined;
      if (after) {
        nextPoint = Editor.after(editor, at);
      } else {
        nextPoint = Editor.before(editor, at);
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
