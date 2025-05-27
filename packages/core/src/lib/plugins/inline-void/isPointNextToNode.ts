import { type Path, type Point, ElementApi, PathApi } from '@udecode/slate';

import type { SlateEditor } from '../..';

export const isPointNextToNode = (
  editor: SlateEditor,
  options: {
    at?: Point;
    nodeType?: string;
    reverse?: boolean;
  } = {}
): boolean => {
  // eslint-disable-next-line prefer-const
  let { at, reverse = false } = options;

  if (!at) {
    at = editor.selection?.anchor;
  }
  if (!at) {
    throw new Error('No valid selection point found');
  }

  const selectedRange = editor.api.range(at.path)!;
  const boundary = (() => {
    let isStart = false;
    let isEnd = false;

    if (editor.api.isStart(at, selectedRange)) {
      isStart = true;
    }
    if (editor.api.isEnd(at, selectedRange)) {
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

  const nextNodeEntry = editor.api.node(adjacentPath) ?? null;

  return !!(
    nextNodeEntry &&
    ElementApi.isElement(nextNodeEntry[0]) &&
    (!editor.api.isSelectable(nextNodeEntry[0]) ||
      nextNodeEntry[0].type === options.nodeType)
  );
};
