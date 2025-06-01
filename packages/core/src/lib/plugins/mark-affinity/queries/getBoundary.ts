import type { TText } from '@udecode/slate';

import { type NodeEntry, Path } from 'slate';

import type { SlateEditor } from '../../../editor';
import type { Boundary } from '../types';

export const getBoundary = (editor: SlateEditor): Boundary | null => {
  const { selection } = editor;
  if (!selection || editor.api.isExpanded()) return null;
  const point = selection.anchor;

  const selectedLeafRange = editor.api.range(point.path);

  const direction = (() => {
    if (!selectedLeafRange) return null;

    if (editor.api.isStart(point, selectedLeafRange)) {
      return 'backward';
    }

    if (editor.api.isEnd(point, selectedLeafRange)) {
      return 'forward';
    }

    return null;
  })();

  if (!direction) return null;

  const currentLeafEntry = editor.api.node<TText>(point.path)!;

  if (direction === 'backward' && point.path.at(-1) === 0)
    return [null, currentLeafEntry];

  const adjacentPathFn = direction === 'forward' ? Path.next : Path.previous;
  const adjacentPath = adjacentPathFn(point.path);
  const adjacentNode = editor.api.node(adjacentPath) ?? null;

  const adjacentLeafEntry = adjacentNode
    ? (adjacentNode as NodeEntry<TText>)
    : null;

  return direction === 'forward'
    ? [currentLeafEntry, adjacentLeafEntry]
    : [adjacentLeafEntry, currentLeafEntry];
};
