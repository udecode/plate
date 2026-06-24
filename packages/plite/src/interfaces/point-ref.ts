import { type Operation, type Point, PointApi } from '..';
import {
  getOperationRoot,
  getPointRefRootMeta,
  getPointRoot,
  stripImplicitPointRoot,
  withImplicitPointRoot,
} from '../internal/root-location';
import type { TextDirection } from '../types/types';

/**
 * `PointRef` objects keep a specific point in a document synced over time as new
 * operations are applied to the editor. You can access their `current` property
 * at any time for the up-to-date point value.
 */

export interface PointRef {
  current: Point | null;
  affinity: TextDirection | null;
  unref(): Point | null;
}

export interface PointRefInterface {
  /**
   * Transform the point ref's current value by an operation.
   */
  transform: (ref: PointRef, op: Operation) => void;
}

// eslint-disable-next-line no-redeclare
export const PointRefApi: PointRefInterface = {
  transform(ref: PointRef, op: Operation): void {
    const { current, affinity } = ref;

    if (current == null) {
      return;
    }

    const rootMeta = getPointRefRootMeta(ref) ?? getPointRoot(current);
    const { root } = rootMeta;

    if (root !== getOperationRoot(op)) {
      return;
    }

    const transformPoint = withImplicitPointRoot(current, root);
    const point = PointApi.transform(transformPoint, op, { affinity });

    ref.current = point ? stripImplicitPointRoot(point, rootMeta) : null;

    if (point == null) {
      ref.unref();
    }
  },
};
