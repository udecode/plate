import type { Editor, ValueOf } from '../../interfaces/editor/editor-type';

import {
  type EditorAboveOptions,
  type TLocation,
  PathApi,
  PointApi,
  RangeApi,
} from '../../interfaces';

/**
 * Check if a location (point/range) is at a specific position.
 *
 * For ranges:
 *
 * - If text=true, check if range is in single text node
 * - If block=true, check if range is in single block
 * - If blocks=true, check if range is across multiple blocks
 * - If start=true, check if range starts at block start
 * - If end=true, check if range ends at block end
 *
 * For points:
 *
 * - If word=true, check relative to word boundaries
 * - If start=true, check if at start
 * - If end=true, check if at end
 */
export const isAt = <E extends Editor>(
  editor: E,
  {
    at = editor.selection,
    block,
    blocks,
    end,
    start,
    text,
    word,
    ...options
  }: {
    /** The location to check. Defaults to current selection */
    at?: TLocation | null;
    /** Check if range is in single block */
    block?: boolean;
    /** Check if range is across multiple blocks */
    blocks?: boolean;
    /** Check if range ends at block end or point is at word end */
    end?: boolean;
    /** Check if range starts at block start */
    start?: boolean;
    /** Check if range is in single text node */
    text?: boolean;
    /** Check if point is at word boundary (only with end=true) */
    word?: boolean;
  } & Omit<EditorAboveOptions<ValueOf<E>>, 'at' | 'block'> = {}
) => {
  if (!at) return false;
  // Handle Point
  if (PointApi.isPoint(at)) {
    if (word && end) {
      const after = editor.api.after(at);

      if (!after) return true;

      const afterRange = editor.api.range(at, after);
      const afterText = editor.api.string(afterRange);

      return /^(?:\s|$)/.test(afterText);
    }

    return false;
  }
  // Handle Range
  if (RangeApi.isRange(at)) {
    const [startPoint, endPoint] = RangeApi.edges(at);

    // Check if range is in single text node
    if (text) {
      return PathApi.equals(startPoint.path, endPoint.path);
    }

    const startBlock = editor.api.block({
      at: startPoint,
      ...options,
    });
    const endBlock = editor.api.block({
      at: endPoint,
      ...options,
    });

    // Handle blocks edge cases
    if (blocks) {
      if (!startBlock && !endBlock) return false;
      if (!startBlock || !endBlock) return true;

      return !PathApi.equals(startBlock[1], endBlock[1]);
    }
    if (!startBlock || !endBlock) return false;
    // Check if range is in single block
    if (block) {
      return PathApi.equals(startBlock[1], endBlock[1]);
    }
    // Check block boundaries
    if (start) {
      return (
        editor.api.isStart(startPoint, startBlock[1]) ||
        (RangeApi.isExpanded(at) && editor.api.isStart(endPoint, startBlock[1]))
      );
    }
    if (end) {
      return editor.api.isEnd(endPoint, endBlock[1]);
    }
  }

  return false;
};
