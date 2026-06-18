/** Serializable Slate path used by browser proof snapshots. */
export type Path = readonly number[];

/** Serializable Slate point used by browser proof snapshots. */
export type Point = {
  path: Path;
  offset: number;
};

/** Serializable Slate range used by browser proof snapshots. */
export type Range = {
  anchor: Point;
  focus: Point;
};

/** Serialize a proof point as `path:offset`. */
export const serializePoint = (point: Point) =>
  `${point.path.join('.')}:${point.offset}`;

/** Serialize a proof range as `anchor|focus`. */
export const serializeRange = (range: Range) =>
  `${serializePoint(range.anchor)}|${serializePoint(range.focus)}`;

/** Return true when a proof range has the same anchor and focus point. */
export const isCollapsed = (range: Range) =>
  range.anchor.offset === range.focus.offset &&
  range.anchor.path.length === range.focus.path.length &&
  range.anchor.path.every(
    (segment, index) => segment === range.focus.path[index]
  );
