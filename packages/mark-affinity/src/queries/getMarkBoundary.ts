import {
  getNodeEntry,
  getRange,
  isEndPoint,
  isSelectionExpanded,
  isStartPoint,
  isText,
  PlateEditor,
  TText,
} from '@udecode/plate-common';
import { NodeEntry, Path } from 'slate';

import { MarkBoundary } from '../types';

export const getMarkBoundary = (editor: PlateEditor): MarkBoundary | null => {
  const { selection } = editor;
  if (!selection || isSelectionExpanded(editor)) return null;
  const point = selection.anchor;

  const selectedLeafRange = getRange(editor, point.path);

  const direction = (() => {
    if (isStartPoint(editor, point, selectedLeafRange)) {
      return 'backward';
    }

    if (isEndPoint(editor, point, selectedLeafRange)) {
      return 'forward';
    }

    return null;
  })();

  if (!direction) return null;

  const currentLeafEntry = getNodeEntry<TText>(editor, point.path)!;

  if (direction === 'backward' && point.path.at(-1) === 0)
    return [null, currentLeafEntry];

  const adjacentPathFn = direction === 'forward' ? Path.next : Path.previous;
  const adjacentPath = adjacentPathFn(point.path);
  const adjacentNode = getNodeEntry(editor, adjacentPath) ?? null;

  const adjacentLeafEntry =
    adjacentNode && isText(adjacentNode[0])
      ? (adjacentNode as NodeEntry<TText>)
      : null;

  return direction === 'forward'
    ? [currentLeafEntry, adjacentLeafEntry]
    : [adjacentLeafEntry, currentLeafEntry];
};
