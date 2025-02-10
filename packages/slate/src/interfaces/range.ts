import { Range as SlateRange } from 'slate';

import type { RangeDirection } from '../types';
import type { Operation } from './operation';
import type { Path } from './path';
import type { Point, PointEntry } from './point';

/**
 * `TRange` objects are a set of points that refer to a specific span of a Slate
 * document. They can define a span inside a single node or a can span across
 * multiple nodes.
 */
export type TRange = {
  /** The start point of the range. */
  anchor: Point;
  /** The end point of the range. */
  focus: Point;
};

export const RangeApi: {
  /**
   * Check if a range fully contains another range, meaning that both the start
   * and end points of the target range are included in the range.
   */
  contains: (range: TRange, target: TRange) => boolean;
  /**
   * Get the start and end points of a range, in the order in which they appear
   * in the document.
   */
  edges: (range: TRange, options?: RangeEdgesOptions) => [Point, Point];
  /** Get the end point of a range. */
  end: (range: TRange) => Point;
  /** Check if a range is exactly equal to another. */
  equals: (range: TRange, another: TRange) => boolean;
  /** Check if a range includes a path, a point or part of another range. */
  includes: (range: TRange, target: Path | Point | TRange) => boolean;
  /** Get the intersection of a range with another. */
  intersection: (range: TRange, another: TRange) => TRange | null;
  /**
   * Check if a range is backward, meaning that its anchor point appears in the
   * document _after_ its focus point.
   */
  isBackward: (range: TRange) => boolean;
  /**
   * Check if a range is collapsed, meaning that both its anchor and focus
   * points refer to the exact same position in the document.
   */
  isCollapsed: (range?: TRange | null) => boolean;
  /**
   * Check if a range is expanded.
   *
   * This is the opposite of [[RangeApi.isCollapsed]] and is provided for
   * legibility.
   */
  isExpanded: (range?: TRange | null) => boolean;
  /**
   * Check if a range is forward.
   *
   * This is the opposite of [[RangeApi.isBackward]] and is provided for
   * legibility.
   */
  isForward: (range: TRange) => boolean;
  /** Check if a value implements the [[TRange]] interface. */
  isRange: (value: any) => value is TRange;
  /** Iterate through all of the point entries in a range. */
  points: (range: TRange) => Generator<PointEntry, void, undefined>;
  /** Get the start point of a range. */
  start: (range: TRange) => Point;
  /** Check if a range includes another range. */
  surrounds: (range: TRange, target: TRange) => boolean;
  /** Transform a range by an operation. */
  transform: (
    range: TRange,
    op: Operation,
    options?: RangeTransformOptions
  ) => TRange | null;
} = {
  ...SlateRange,
  contains: (range: TRange, target: TRange) => {
    const [targetStart, targetEnd] = RangeApi.edges(target);

    return (
      RangeApi.includes(range, targetStart) &&
      RangeApi.includes(range, targetEnd)
    );
  },
  isCollapsed: (range?: TRange | null) =>
    !!range && SlateRange.isCollapsed(range),
  isExpanded: (range?: TRange | null) =>
    !!range && SlateRange.isExpanded(range),
} as any;

/**
 * `Range` objects are a set of points that refer to a specific span of a Slate
 * document. They can define a span inside a single node or a can span across
 * multiple nodes.
 */
export type Range = TRange;

export interface RangeEdgesOptions {
  reverse?: boolean;
}

export interface RangeTransformOptions {
  affinity?: RangeDirection | null;
}
