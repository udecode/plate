import {
  type SlateEditor,
  getNodeEntry,
  getRange,
  isEndPoint,
  isStartPoint,
} from '@udecode/plate-common';
import { type Point, Path } from 'slate';

export const isPointNextToNode = (
  editor: SlateEditor,
  options: {
    nodeType: string;
    at?: Point;
    reverse?: boolean;
  }
): boolean => {
  // eslint-disable-next-line prefer-const
  let { at, nodeType, reverse = false } = options;

  if (!at) {
    at = editor.selection?.anchor;
  }
  if (!at) {
    throw new Error('No valid selection point found');
  }

  const selectedRange = getRange(editor, at.path);
  const boundary = (() => {
    let isStart = false;
    let isEnd = false;

    if (isStartPoint(editor, at, selectedRange)) {
      isStart = true;
    }
    if (isEndPoint(editor, at, selectedRange)) {
      isEnd = true;
    }
    if (isStart && isEnd) {
      return 'single';
    }
    if (isStart) {
      return 'start';
    }
    if (isEnd) {
      return 'end';
    }

    return null;
  })();

  if (!boundary) return false;

  const adjacentPathFn = (path: Path) => {
    try {
      if (reverse && boundary === 'start') return Path.previous(path);
      if (!reverse && boundary === 'end') return Path.next(path);
      if (boundary === 'single') {
        return reverse ? Path.previous(path) : Path.next(path);
      }
    } catch (error) {
      return null;
    }
  };

  if (!adjacentPathFn) return false;

  const adjacentPath = adjacentPathFn(at.path);

  if (!adjacentPath) return false;

  const nextNodeEntry = getNodeEntry(editor, adjacentPath) ?? null;

  return !!(nextNodeEntry && nextNodeEntry[0].type === nodeType);
};
