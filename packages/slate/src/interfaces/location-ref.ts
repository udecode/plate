import { PointRef as SlatePointRef, RangeRef as SlateRangeRef } from 'slate';

import type { TextDirection } from '../types';
import type { Operation } from './operation';
import type { Point } from './point';
import type { TRange } from './range';

import { type Path, PathApi } from './path';

/**
 * `PathRef` objects keep a specific path in a document synced over time as new
 * operations are applied to the editor. You can access their `current` property
 * at any time for the up-to-date path value.
 */
export type PathRef = {
  affinity: 'backward' | 'forward' | null;
  current: Path | null;
  unref: () => Path | null;
};

export const PathRefApi: {
  /** Transform the path ref's current value by an operation. */
  transform: (ref: PathRef, op: Operation) => void;
} = {
  transform(ref, op) {
    const { affinity, current } = ref;

    if (current == null) {
      return;
    }

    const path = PathApi.transform(current, op, { affinity });
    ref.current = path;

    if (path == null) {
      ref.unref();
    }
  },
};

/**
 * `PointRef` objects keep a specific point in a document synced over time as
 * new operations are applied to the editor. You can access their `current`
 * property at any time for the up-to-date point value.
 */
export type PointRef = {
  affinity: TextDirection | null;
  current: Point | null;
  unref: () => Point | null;
};

export const PointRefApi: {
  /** Transform the point ref's current value by an operation. */
  transform: (ref: PointRef, op: Operation) => void;
} = SlatePointRef as any;

/**
 * `RangeRef` objects keep a specific range in a document synced over time as
 * new operations are applied to the editor. You can access their `current`
 * property at any time for the up-to-date range value.
 */
export type RangeRef = {
  affinity: 'backward' | 'forward' | 'inward' | 'outward' | null;
  current: TRange | null;
  unref: () => TRange | null;
};

export const RangeRefApi: {
  /** Transform the range ref's current value by an operation. */
  transform: (ref: RangeRef, op: Operation) => void;
} = SlateRangeRef as any;
