import type { EditorDocumentValue } from '../interfaces/editor';
import type { Path } from '../interfaces/path';
import { type Point, PointApi } from '../interfaces/point';
import { type Range, RangeApi } from '../interfaces/range';
import {
  DocumentChange,
  getInternalDocumentRootChange,
  valueRoot,
} from './change/document-change';
import { DocumentIndex } from './change/document-index';
import type { JsonEditorValue } from './change/tokens';

export type AuthoredLocationMap = Readonly<{
  path: (path: Path) => Path | null;
  point: (point: Point, assoc: -1 | 1) => Point | null;
  range: (range: Range) => Range | null;
}>;

/** Each map returns null for content the projection does not keep. */
export const locationMapOver = (
  beforeIndex: DocumentIndex,
  afterIndex: DocumentIndex,
  position: (from: number, assoc: -1 | 1) => number | null,
  root: string
): AuthoredLocationMap => {
  const point = (at: Point, assoc: -1 | 1): Point | null => {
    const mapped = position(beforeIndex.positionAt(at), assoc);
    const landed = mapped === null ? null : afterIndex.pointAt(mapped, assoc);

    return landed && { ...landed, ...(root === 'main' ? {} : { root }) };
  };

  return {
    path: (path) => {
      const mapped = position(beforeIndex.nodeRange(path).from, 1);
      const entry = mapped === null ? null : afterIndex.nodeStartingAt(mapped);

      return entry ? [...entry.path] : null;
    },
    point,
    range: (range) => {
      const [start, end] = RangeApi.edges(range);
      const from = point(start, 1);
      const to = point(end, -1);

      if (!from || !to) return null;
      if (!RangeApi.isCollapsed(range) && PointApi.compare(from, to) >= 0) {
        return null;
      }

      return RangeApi.isBackward(range)
        ? { anchor: to, focus: from }
        : { anchor: from, focus: to };
    },
  };
};

export const authoredLocationMap = (
  document: JsonEditorValue,
  projected: JsonEditorValue,
  change: DocumentChange,
  root: string
): AuthoredLocationMap => {
  const rootChange = getInternalDocumentRootChange(change, root);

  return locationMapOver(
    DocumentIndex.fromValue(valueRoot(document, root)),
    DocumentIndex.fromValue(valueRoot(projected, root)),
    (from, assoc) => (rootChange ? rootChange.mapPos(from, assoc) : from),
    root
  );
};

/**
 * Map a range of a stored document onto one of its projections, or null when
 * the projection keeps none of its content.
 *
 * @internal
 */
export const projectAuthoredRange = (
  document: EditorDocumentValue,
  projected: EditorDocumentValue,
  range: Range
): Range | null => {
  const before = document as JsonEditorValue;
  const after = projected as JsonEditorValue;

  if (before === after) return range;

  return authoredLocationMap(
    before,
    after,
    DocumentChange.between(before, after),
    range.anchor.root ?? 'main'
  ).range(range);
};
