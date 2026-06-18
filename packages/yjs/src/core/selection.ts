import type { Point, Range } from '@platejs/slate';
import * as Y from 'yjs';

import { getYjsLength, getYjsNode, getYjsVisiblePath } from './document';

export type YjsRelativeRange = {
  readonly anchor: Y.RelativePosition;
  readonly focus: Y.RelativePosition;
};

const clampTextOffset = (offset: number, length: number): number =>
  Math.max(0, Math.min(offset, length));

export const slatePointToYjsRelativePosition = (
  root: Y.XmlElement,
  point: Point
): Y.RelativePosition => {
  const target = getYjsNode(root, point.path);

  if (!(target instanceof Y.XmlText)) {
    throw new Error('Slate point does not target a Y.XmlText.');
  }

  const length = getYjsLength(target);
  const offset = clampTextOffset(point.offset, length);

  return Y.createRelativePositionFromTypeIndex(
    target,
    offset,
    offset === length ? -1 : 0
  );
};

export const yjsRelativePositionToSlatePoint = (
  root: Y.XmlElement,
  position: Y.RelativePosition
): Point | null => {
  if (root.doc === null) {
    throw new Error('Yjs root must be attached to a Y.Doc.');
  }

  const absolute = Y.createAbsolutePositionFromRelativePosition(
    position,
    root.doc
  );

  if (absolute === null || !(absolute.type instanceof Y.XmlText)) {
    return null;
  }

  const path = getYjsVisiblePath(root, absolute.type);

  if (path === null) {
    return null;
  }

  return {
    path,
    offset: clampTextOffset(absolute.index, getYjsLength(absolute.type)),
  };
};

export const slateRangeToYjsRelativeRange = (
  root: Y.XmlElement,
  range: Range
): YjsRelativeRange => ({
  anchor: slatePointToYjsRelativePosition(root, range.anchor),
  focus: slatePointToYjsRelativePosition(root, range.focus),
});

export const yjsRelativeRangesEqual = (
  a: YjsRelativeRange,
  b: YjsRelativeRange
): boolean =>
  Y.compareRelativePositions(a.anchor, b.anchor) &&
  Y.compareRelativePositions(a.focus, b.focus);

export const yjsRelativeRangeToSlateRange = (
  root: Y.XmlElement,
  range: YjsRelativeRange
): Range | null => {
  const anchor = yjsRelativePositionToSlatePoint(root, range.anchor);

  if (anchor === null) {
    return null;
  }

  const focus = yjsRelativePositionToSlatePoint(root, range.focus);

  if (focus === null) {
    return null;
  }

  return { anchor, focus };
};
