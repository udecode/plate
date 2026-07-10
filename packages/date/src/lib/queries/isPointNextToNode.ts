import type { BaseEditor } from '@platejs/core';
import { type Path, type Point, ElementApi, PathApi } from '@platejs/plite';

export const isPointNextToNode = (
  editor: BaseEditor,
  options: {
    nodeType: string;
    at?: Point;
    reverse?: boolean;
  }
): boolean => {
  let { at, nodeType, reverse = false } = options;

  if (!at) {
    at = editor.read.selection()?.anchor;
  }
  if (!at) {
    throw new Error('No valid selection point found');
  }

  const selectedRange = editor.read.ranges.get(at.path);

  if (!selectedRange) return false;

  const boundary = (() => {
    let isStart = false;
    let isEnd = false;

    if (editor.read.points.isStart(at, selectedRange)) {
      isStart = true;
    }
    if (editor.read.points.isEnd(at, selectedRange)) {
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
      if (reverse && boundary === 'start') return PathApi.previous(path);
      if (!reverse && boundary === 'end') return PathApi.next(path);
      if (boundary === 'single') {
        return reverse ? PathApi.previous(path) : PathApi.next(path);
      }
    } catch {
      return null;
    }
  };

  if (!adjacentPathFn) return false;

  const adjacentPath = adjacentPathFn(at.path);

  if (!adjacentPath) return false;

  const nextNodeEntry = editor.read.nodes.get(adjacentPath);

  return !!(
    nextNodeEntry &&
    ElementApi.isElement(nextNodeEntry[0]) &&
    nextNodeEntry[0].type === nodeType
  );
};
