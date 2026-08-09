import type { Path, NodeKey } from '@platejs/plite';
import type { DOMTextSyncOptions } from '../dom-text-sync';

export type DOMStrategyType = 'auto' | 'full' | 'staged';

type DOMStrategyTextSyncConfig = {
  textSync?: DOMTextSyncOptions;
};

export type DOMStrategyVirtualizedLayout = {
  pageItems?: readonly VirtualizedPageLayoutItem[];
  topLevelItems?: readonly VirtualizedTopLevelLayoutItem[];
  visiblePageItems?: readonly VirtualizedPageLayoutItem[];
};

export type VirtualizedPageLayoutItem = {
  fragmentPaths?: readonly Path[];
  index: number;
  key: string;
  pageIndexes: readonly number[];
  size: number;
  start: number;
  topLevelIndexes: readonly number[];
  unitPaths?: readonly Path[];
};

export type VirtualizedTopLevelLayoutItem = {
  index: number;
  left?: number;
  size: number;
  start: number;
  width?: number;
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
      layout?: DOMStrategyVirtualizedLayout;
      overscan?: number;
      textSync?: DOMTextSyncOptions;
      threshold?: number;
      type: 'virtualized';
    };

export type DOMStrategySegment = {
  endIndex: number;
  segmentIndex: number;
  isActive: boolean;
  mountedNodeKeys: readonly NodeKey[];
  nodeKeys: readonly NodeKey[];
  startIndex: number;
};

export const createSegmentPlan = ({
  overscan,
  defaultActiveSegmentIndex,
  segmentSize,
  promotedSegmentIndex,
  topLevelNodeKeys,
}: {
  overscan: number;
  defaultActiveSegmentIndex: number;
  segmentSize: number;
  promotedSegmentIndex: number | null;
  topLevelNodeKeys: readonly NodeKey[];
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
    startIndex < topLevelNodeKeys.length;
    startIndex += segmentSize, segmentIndex += 1
  ) {
    const endIndex = Math.min(
      topLevelNodeKeys.length - 1,
      startIndex + segmentSize - 1
    );
    const isActive = segmentIndex >= activeStart && segmentIndex <= activeEnd;
    const nodeKeys = topLevelNodeKeys.slice(startIndex, endIndex + 1);

    segments.push({
      endIndex,
      segmentIndex,
      isActive,
      mountedNodeKeys: isActive ? nodeKeys : [],
      nodeKeys,
      startIndex,
    });
  }

  return {
    activeSegmentIndex,
    segments,
  };
};
