import type { NodeKey, Path } from '..';
import type { MountedTopLevelRange } from './viewport-commands';

export type EditableViewportItem = {
  index: number;
  nodeKey: NodeKey;
  size: number;
  start: number;
};

export type EditableViewportMissingRange = {
  anchorNodeKey: NodeKey | null;
  boundaryId: string;
  endIndex: number;
  focusNodeKey: NodeKey | null;
  startIndex: number;
};

export type EditableViewportPlan = {
  coordinateSpace: 'canvas' | 'flow';
  missingRanges: readonly EditableViewportMissingRange[];
  mountedTopLevelNodeKeys: ReadonlySet<NodeKey>;
  mountedTopLevelRanges: readonly MountedTopLevelRange[];
  scrollToPath: (
    path: Path,
    align?: 'auto' | 'center' | 'end' | 'start'
  ) => boolean;
  totalSize: number;
  items: readonly EditableViewportItem[];
  measureElement?: (element: HTMLElement | null) => void;
  requestMount?: (index: number, path?: Path) => void;
};

const coalesceIndexes = (
  indexes: readonly number[]
): readonly MountedTopLevelRange[] => {
  const ranges: MountedTopLevelRange[] = [];
  let start: number | null = null;
  let end: number | null = null;

  for (const index of indexes) {
    if (start == null || end == null) {
      start = index;
      end = index;
      continue;
    }

    if (index === end + 1) {
      end = index;
      continue;
    }

    ranges.push({ endIndex: end, startIndex: start });
    start = index;
    end = index;
  }

  if (start != null && end != null) {
    ranges.push({ endIndex: end, startIndex: start });
  }

  return ranges;
};

const createMissingRanges = ({
  mountedRanges,
  topLevelNodeKeys,
}: {
  mountedRanges: readonly MountedTopLevelRange[];
  topLevelNodeKeys: readonly NodeKey[];
}): readonly EditableViewportMissingRange[] => {
  const ranges: EditableViewportMissingRange[] = [];
  let nextIndex = 0;
  const push = (startIndex: number, endIndex: number) => {
    if (startIndex > endIndex) return;

    ranges.push({
      anchorNodeKey: topLevelNodeKeys[startIndex] ?? null,
      boundaryId: `viewport:${startIndex}-${endIndex}`,
      endIndex,
      focusNodeKey: topLevelNodeKeys[endIndex] ?? null,
      startIndex,
    });
  };

  mountedRanges.forEach((range) => {
    push(nextIndex, range.startIndex - 1);
    nextIndex = range.endIndex + 1;
  });
  push(nextIndex, topLevelNodeKeys.length - 1);

  return ranges;
};

export const createEditableViewportPlan = ({
  coordinateSpace,
  indexes,
  measureElement,
  requestMount,
  scrollToPath,
  sizeAtIndex,
  startAtIndex,
  topLevelNodeKeys,
  totalSize,
}: {
  coordinateSpace: EditableViewportPlan['coordinateSpace'];
  indexes: Iterable<number>;
  scrollToPath: EditableViewportPlan['scrollToPath'];
  sizeAtIndex: (index: number) => number;
  startAtIndex: (index: number) => number;
  topLevelNodeKeys: readonly NodeKey[];
  totalSize: number;
  measureElement?: EditableViewportPlan['measureElement'];
  requestMount?: EditableViewportPlan['requestMount'];
}): EditableViewportPlan => {
  const mountedIndexes = [...new Set(indexes)]
    .filter((index) => index >= 0 && index < topLevelNodeKeys.length)
    .sort((left, right) => left - right);
  const items = mountedIndexes.flatMap<EditableViewportItem>((index) => {
    const nodeKey = topLevelNodeKeys[index];

    return nodeKey
      ? [
          {
            index,
            nodeKey,
            size: sizeAtIndex(index),
            start: startAtIndex(index),
          },
        ]
      : [];
  });
  const mountedTopLevelRanges = coalesceIndexes(
    items.map((item) => item.index)
  );

  return {
    coordinateSpace,
    items,
    measureElement,
    missingRanges: createMissingRanges({
      mountedRanges: mountedTopLevelRanges,
      topLevelNodeKeys,
    }),
    mountedTopLevelNodeKeys: new Set(items.map((item) => item.nodeKey)),
    mountedTopLevelRanges,
    requestMount,
    scrollToPath,
    totalSize,
  };
};

export const createInitialViewportIndexes = ({
  count,
  retainedIndexes,
}: {
  count: number;
  retainedIndexes: ReadonlyArray<number | null>;
}) =>
  [
    ...new Set([
      ...Array.from({ length: Math.min(8, count) }, (_, index) => index),
      ...retainedIndexes.filter(
        (index): index is number =>
          typeof index === 'number' && index >= 0 && index < count
      ),
    ]),
  ].sort((left, right) => left - right);
