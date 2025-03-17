import {
  type Path,
  type Point,
  type SlateEditor,
  PathApi,
} from '@udecode/plate';

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

  return !!(nextNodeEntry && nextNodeEntry[0].type === nodeType);
};
