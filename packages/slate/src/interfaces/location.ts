import { Location as SlateLocation, Span as SlateSpan } from 'slate';

import type { At } from '../types';
import type { Path } from './path';
import type { Point } from './point';
import type { Range, TRange } from './range';

import { NodeApi } from './node';

/**
 * The `TLocation` interface is a union of the ways to refer to a specific
 * location in a Slate document: paths, points or ranges.
 *
 * Methods will often accept a `Location` instead of requiring only a `Path`,
 * `Point` or `TRange`. This eliminates the need for developers to manage
 * converting between the different interfaces in their own code base.
 */
export type TLocation = Path | Point | TRange;

/** Location check methods. */
export const LocationApi: {
  /** Check if a value implements the `At` interface. */
  isAt: (value: any) => value is At;
  /** Check if a value implements the `Location` interface. */
  isLocation: (value: any) => value is Location;
} = {
  ...(SlateLocation as any),
  isAt: (value) => LocationApi.isLocation(value) || NodeApi.isNode(value),
};

/**
 * The `Span` interface is a low-level way to refer to locations in nodes
 * without using `Point` which requires leaf text nodes to be present.
 */
export type Span = [Path, Path];

export const SpanApi: {
  /** Check if a value implements the `Span` interface. */
  isSpan: (value: any) => value is Span;
} = SlateSpan as any;

/**
 * The `Location` interface is a union of the ways to refer to a specific
 * location in a Slate document: paths, points or ranges.
 *
 * Methods will often accept a `Location` instead of requiring only a `Path`,
 * `Point` or `Range`. This eliminates the need for developers to manage
 * converting between the different interfaces in their own code base.
 */
export type Location = Path | Point | Range;
