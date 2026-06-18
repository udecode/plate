import {
  type Path,
  PathApi,
  type Point,
  PointApi,
  type Range,
  RangeApi,
} from '..';

/**
 * The `Location` interface is a union of the ways to refer to a specific
 * location in a Slate document: paths, points or ranges.
 *
 * Methods will often accept a `Location` instead of requiring only a `Path`,
 * `Point` or `Range`. This eliminates the need for developers to manage
 * converting between the different interfaces in their own code base.
 */

export type Location = Path | Point | Range;

export interface LocationInterface {
  /**
   * Check if a value implements the `Location` interface.
   */
  isLocation: (value: unknown) => value is Location;

  /**
   * Check if a location is a `Path`.
   */
  isPath: (at: Location) => at is Path;

  /**
   * Check if a location is a `Point`.
   */
  isPoint: (at: Location) => at is Point;

  /**
   * Check if a location is a `Range`.
   */
  isRange: (at: Location) => at is Range;

  /**
   * Differentiate between a normal `Location` and a `Span`.
   */
  isSpan: (at: Location | Span) => at is Span;
}

// eslint-disable-next-line no-redeclare
export const LocationApi: LocationInterface = {
  isLocation(value: unknown): value is Location {
    return (
      PathApi.isPath(value) ||
      PointApi.isPoint(value) ||
      RangeApi.isRange(value)
    );
  },

  isPath(at: Location): at is Path {
    return Array.isArray(at);
  },

  isPoint(at: Location): at is Point {
    return 'offset' in at;
  },

  isRange(at: Location): at is Range {
    return 'anchor' in at;
  },

  isSpan(at: Location | Span): at is Span {
    return Array.isArray(at) && Array.isArray(at[0]);
  },
};

/**
 * The `Span` interface is a low-level way to refer to locations in nodes
 * without using `Point` which requires leaf text nodes to be present.
 */

export type Span = [Path, Path];

export interface SpanInterface {
  /**
   * Check if a value implements the `Span` interface.
   */
  isSpan: (value: unknown) => value is Span;
}

// eslint-disable-next-line no-redeclare
export const SpanApi: SpanInterface = {
  isSpan(value: unknown): value is Span {
    return (
      Array.isArray(value) && value.length === 2 && value.every(PathApi.isPath)
    );
  },
};
