import type { RuntimeId } from '@platejs/plite';
import type { DOMTextSyncOptions } from '../dom-text-sync';

export type DOMStrategyType = 'auto' | 'full' | 'staged';

type DOMStrategyTextSyncConfig = {
  textSync?: DOMTextSyncOptions;
};

export type DOMStrategyOptions =
  | DOMStrategyType
  | (DOMStrategyTextSyncConfig & {
      type: DOMStrategyType;
    })
  | {
      /**
       * Experimental viewport-only rendering for pathological documents.
       * Intentionally object-only so it does not look like a stable rendering
       * strategy peer of `full` or `staged`.
       */
      estimatedBlockSize?: number;
      overscan?: number;
      textSync?: DOMTextSyncOptions;
      threshold?: number;
      type: 'virtualized';
    };

export type DOMStrategySegment = {
  endIndex: number;
  segmentIndex: number;
  isActive: boolean;
  mountedRuntimeIds: readonly RuntimeId[];
  runtimeIds: readonly RuntimeId[];
  startIndex: number;
};

export const createSegmentPlan = ({
  overscan,
  defaultActiveSegmentIndex,
  segmentSize,
  promotedSegmentIndex,
  topLevelRuntimeIds,
}: {
  overscan: number;
  defaultActiveSegmentIndex: number;
  segmentSize: number;
  promotedSegmentIndex: number | null;
  topLevelRuntimeIds: readonly RuntimeId[];
}) => {
  if (!Number.isInteger(segmentSize) || segmentSize <= 0) {
    throw new RangeError('segmentSize must be a positive integer');
  }

  const segments: DOMStrategySegment[] = [];
  const activeSegmentIndex = promotedSegmentIndex ?? defaultActiveSegmentIndex;
  const activeStart = Math.max(0, activeSegmentIndex - overscan);
  const activeEnd = activeSegmentIndex + overscan;

  for (
    let startIndex = 0, segmentIndex = 0;
    startIndex < topLevelRuntimeIds.length;
    startIndex += segmentSize, segmentIndex += 1
  ) {
    const endIndex = Math.min(
      topLevelRuntimeIds.length - 1,
      startIndex + segmentSize - 1
    );
    const isActive = segmentIndex >= activeStart && segmentIndex <= activeEnd;
    const runtimeIds = topLevelRuntimeIds.slice(startIndex, endIndex + 1);

    segments.push({
      endIndex,
      segmentIndex,
      isActive,
      mountedRuntimeIds: isActive ? runtimeIds : [],
      runtimeIds,
      startIndex,
    });
  }

  return {
    activeSegmentIndex,
    segments,
  };
};
