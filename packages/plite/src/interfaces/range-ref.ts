import { type Operation, type Range, RangeApi } from '..';
import {
  getOperationRoot,
  getRangeRefDraftCurrent,
  getRangeRefRootMeta,
  getRangeRefVisibility,
  getRangeRoot,
  hasRangeRefDraftCurrent,
  setRangeRefDraftCurrent,
  stripImplicitRangeRoots,
  withImplicitRangeRoot,
} from '../internal/root-location';

/**
 * `RangeRef` objects keep a specific range in a document synced over time as new
 * operations are applied to the editor. You can access their `current` property
 * at any time for the up-to-date range value.
 */

export interface RangeRef {
  current: Range | null;
  affinity: 'forward' | 'backward' | 'outward' | 'inward' | null;
  unref(): Range | null;
}

export interface RangeRefInterface {
  /**
   * Transform the range ref's current value by an operation.
   */
  transform: (ref: RangeRef, op: Operation) => void;
}

// eslint-disable-next-line no-redeclare
export const RangeRefApi: RangeRefInterface = {
  transform(ref: RangeRef, op: Operation): void {
    const current = hasRangeRefDraftCurrent(ref)
      ? getRangeRefDraftCurrent(ref)
      : ref.current;
    const { affinity } = ref;

    if (current == null) {
      return;
    }

    const rootMeta = getRangeRefRootMeta(ref) ?? getRangeRoot(current);
    const { root } = rootMeta;

    if (!root || root !== getOperationRoot(op)) {
      return;
    }

    const transformRange = withImplicitRangeRoot(current, root);
    const next = RangeApi.transform(transformRange, op, { affinity });
    const nextPublic = next ? stripImplicitRangeRoots(next, rootMeta) : null;

    if (getRangeRefVisibility(ref) === 'public') {
      setRangeRefDraftCurrent(ref, nextPublic);
    } else {
      ref.current = nextPublic;
    }

    if (nextPublic == null && getRangeRefVisibility(ref) !== 'public') {
      ref.unref();
    }
  },
};
