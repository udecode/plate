import * as Y from 'yjs';

import type { NodeList } from '../../core/change/document-index';
import type { Descendant, Point, Range } from '../../index';
import { readPliteValueFromYjs } from './document';
import {
  pliteToYjsTextPosition,
  yjsToPliteSpacerPoint,
  yjsToPliteTextPoint,
} from './text-runs';

export type YjsRelativeRange = {
  readonly anchor: Y.RelativePosition;
  readonly focus: Y.RelativePosition;
};

export const pointToYjsRelativePosition = (
  root: Y.XmlElement,
  point: Point,
  children: NodeList<Descendant> = readPliteValueFromYjs(root)
): Y.RelativePosition => {
  const position = pliteToYjsTextPosition(root, children, point);
  if (!position) throw new Error('Editor point does not target a text group.');
  return Y.createRelativePositionFromTypeIndex(
    position.type,
    position.index,
    position.assoc
  );
};

export const yjsRelativePositionToPoint = (
  root: Y.XmlElement,
  position: Y.RelativePosition,
  children: NodeList<Descendant> = readPliteValueFromYjs(root)
): Point | null => {
  if (root.doc === null) {
    throw new Error('Yjs root must be attached to a Y.Doc.');
  }

  const absolute = Y.createAbsolutePositionFromRelativePosition(
    position,
    root.doc
  );

  if (absolute === null) return null;
  if (absolute.type instanceof Y.XmlElement) {
    return yjsToPliteSpacerPoint(root, children, absolute.type, absolute.assoc);
  }
  if (!(absolute.type instanceof Y.XmlText)) return null;

  return yjsToPliteTextPoint(
    root,
    children,
    absolute.type,
    absolute.index,
    absolute.assoc
  );
};

export const rangeToYjsRelativeRange = (
  root: Y.XmlElement,
  range: Range,
  children: NodeList<Descendant> = readPliteValueFromYjs(root)
): YjsRelativeRange => ({
  anchor: pointToYjsRelativePosition(root, range.anchor, children),
  focus: pointToYjsRelativePosition(root, range.focus, children),
});

export const yjsRelativeRangesEqual = (
  a: YjsRelativeRange,
  b: YjsRelativeRange
): boolean =>
  Y.compareRelativePositions(a.anchor, b.anchor) &&
  Y.compareRelativePositions(a.focus, b.focus);

export const yjsRelativeRangeToRange = (
  root: Y.XmlElement,
  range: YjsRelativeRange,
  children: NodeList<Descendant> = readPliteValueFromYjs(root)
): Range | null => {
  const anchor = yjsRelativePositionToPoint(root, range.anchor, children);

  if (anchor === null) {
    return null;
  }

  const focus = yjsRelativePositionToPoint(root, range.focus, children);

  if (focus === null) {
    return null;
  }

  return { anchor, focus };
};
