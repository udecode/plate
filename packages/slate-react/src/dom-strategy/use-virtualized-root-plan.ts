import {
  defaultRangeExtractor,
  useVirtualizer,
  type VirtualItem,
  type Range as VirtualRange,
} from '@tanstack/react-virtual';
import React from 'react';
import { flushSync } from 'react-dom';
import type { Path, RuntimeId } from '@platejs/slate';

import type { MountedTopLevelRange } from './dom-strategy-commands';

export type DOMStrategyVirtualizedConfig = {
  estimatedBlockSize: number;
  overscan: number;
  threshold: number;
};

export type VirtualizedTopLevelItem = {
  index: number;
  key: VirtualItem['key'];
  left?: number;
  runtimeId: RuntimeId;
  size: number;
  start: number;
  width?: number;
};

export type VirtualizedTopLevelLayoutItem = {
  index: number;
  left?: number;
  size: number;
  start: number;
  width?: number;
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

export type VirtualizedMissingTopLevelRange = {
  boundaryId: string;
  endIndex: number;
  focusRuntimeId: RuntimeId | null;
  runtimeIds: readonly RuntimeId[];
  startIndex: number;
  anchorRuntimeId: RuntimeId | null;
};

const SCROLLABLE_OVERFLOW_PATTERN = /(auto|scroll|overlay)/;
// Native scrollbar thumbs can advance the visual scroll offset before React
// commits the next virtual range. Keep a bounded row buffer so that one paint
// behind does not expose a blank editor.
const TOP_LEVEL_NATIVE_SCROLLBAR_DRAG_OVERSCAN = 96;
const SCROLLBAR_POINTER_HIT_SLOP = 24;

const parseCSSPixels = (value: string | null | undefined) => {
  if (!value || value === 'auto' || value === 'none') {
    return 0;
  }

  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : 0;
};

const getElementViewportHeight = (
  element: HTMLElement | null,
  fallback: number
) => {
  if (!element) {
    return fallback;
  }

  if (element.clientHeight > 0) {
    return element.clientHeight;
  }

  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  const styleHeight = parseCSSPixels(style?.height);

  if (styleHeight > 0) {
    return styleHeight;
  }

  const maxHeight = parseCSSPixels(style?.maxHeight);

  return maxHeight > 0 ? maxHeight : fallback;
};

const isVerticalScrollbarPointer = (
  event: PointerEvent,
  element: HTMLElement
) => {
  const rect = element.getBoundingClientRect();
  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  const borderLeftWidth = parseCSSPixels(style?.borderLeftWidth);
  const scrollbarWidth = Math.max(0, element.offsetWidth - element.clientWidth);
  const gutterSize = Math.max(scrollbarWidth, SCROLLBAR_POINTER_HIT_SLOP);
  const scrollbarOnLeft =
    element.clientLeft > borderLeftWidth + 1 ||
    (scrollbarWidth === 0 && style?.direction === 'rtl');
  const scrollbarStart = scrollbarOnLeft ? rect.left : rect.right - gutterSize;
  const scrollbarEnd = scrollbarOnLeft ? rect.left + gutterSize : rect.right;

  return event.clientX >= scrollbarStart && event.clientX <= scrollbarEnd;
};

export const canUseElementAsVirtualizerScrollRoot = (
  element: HTMLElement | null
) => {
  if (!element) {
    return false;
  }

  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  const overflow = `${style?.overflow ?? ''} ${style?.overflowY ?? ''}`;
  const hasScrollableOverflow = SCROLLABLE_OVERFLOW_PATTERN.test(overflow);
  const hasBoundedHeight =
    element.clientHeight > 0 ||
    parseCSSPixels(style?.height) > 0 ||
    parseCSSPixels(style?.maxHeight) > 0;

  return hasScrollableOverflow && hasBoundedHeight;
};

export const getVirtualizerScrollElement = (
  element: HTMLElement | null
): HTMLElement | null => {
  let current = element;

  while (current) {
    if (canUseElementAsVirtualizerScrollRoot(current)) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
};

const createRetainedRangeExtractor =
  ({
    count,
    retainedIndexes,
  }: {
    count: number;
    retainedIndexes: readonly (number | null)[];
  }) =>
  (range: VirtualRange) => {
    const indexes = new Set(defaultRangeExtractor(range));

    for (const index of retainedIndexes) {
      if (typeof index === 'number' && index >= 0 && index < count) {
        indexes.add(index);
      }
    }

    return [...indexes].sort((left, right) => left - right);
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

export const createLayoutVirtualizerSizeMap = (
  topLevelLayoutItems:
    | readonly VirtualizedTopLevelLayoutItem[]
    | null
    | undefined
) => {
  const sizes = new Map<number, number>();
  const sortedItems = [...(topLevelLayoutItems ?? [])].sort(
    (left, right) => left.index - right.index
  );

  for (let index = 0; index < sortedItems.length; index++) {
    const item = sortedItems[index]!;
    const nextItem = sortedItems[index + 1];
    const extent =
      nextItem && nextItem.start > item.start
        ? nextItem.start - item.start
        : item.size;

    sizes.set(item.index, Math.max(item.size, extent));
  }

  return sizes;
};

const createPageVirtualizerSizeMap = (
  pageLayoutItems: readonly VirtualizedPageLayoutItem[] | null | undefined
) => {
  const sizes = new Map<number, number>();
  const sortedItems = [...(pageLayoutItems ?? [])].sort(
    (left, right) => left.index - right.index
  );

  for (let index = 0; index < sortedItems.length; index++) {
    const item = sortedItems[index]!;
    const nextItem = sortedItems[index + 1];
    const extent =
      nextItem && nextItem.start > item.start
        ? nextItem.start - item.start
        : item.size;

    sizes.set(item.index, Math.max(item.size, extent));
  }

  return sizes;
};

const createPageItemIndexesByTopLevelIndex = (
  pageLayoutItems: readonly VirtualizedPageLayoutItem[] | null | undefined
) => {
  const pageIndexesByTopLevelIndex = new Map<number, number[]>();

  for (const pageItem of pageLayoutItems ?? []) {
    for (const topLevelIndex of pageItem.topLevelIndexes) {
      const current = pageIndexesByTopLevelIndex.get(topLevelIndex) ?? [];

      current.push(pageItem.index);
      pageIndexesByTopLevelIndex.set(topLevelIndex, current);
    }
  }

  return pageIndexesByTopLevelIndex;
};

const isPathWithin = (path: Path, ancestor: Path) =>
  ancestor.length <= path.length &&
  ancestor.every((segment, index) => path[index] === segment);

const pathsOverlap = (left: Path, right: Path) =>
  isPathWithin(left, right) || isPathWithin(right, left);

export const createPageItemIndexesForPath = (
  pageLayoutItems: readonly VirtualizedPageLayoutItem[] | null | undefined,
  path: Path
) => {
  if (path.length <= 1) {
    return pageLayoutItems
      ?.filter((item) => item.topLevelIndexes.includes(path[0] ?? -1))
      .map((item) => item.index);
  }

  const unitMatches = pageLayoutItems
    ?.filter((item) =>
      item.unitPaths?.some((unitPath) => pathsOverlap(path, unitPath))
    )
    .map((item) => item.index);

  if (unitMatches?.length) {
    return unitMatches;
  }

  return pageLayoutItems
    ?.filter((item) =>
      item.fragmentPaths?.some((fragmentPath) =>
        pathsOverlap(path, fragmentPath)
      )
    )
    .map((item) => item.index);
};

const getMissingRanges = ({
  count,
  mountedRanges,
  topLevelRuntimeIds,
}: {
  count: number;
  mountedRanges: readonly MountedTopLevelRange[];
  topLevelRuntimeIds: readonly RuntimeId[];
}): readonly VirtualizedMissingTopLevelRange[] => {
  const ranges: VirtualizedMissingTopLevelRange[] = [];
  let nextIndex = 0;

  const pushRange = (startIndex: number, endIndex: number) => {
    if (startIndex > endIndex) {
      return;
    }

    const runtimeIds = topLevelRuntimeIds.slice(startIndex, endIndex + 1);

    ranges.push({
      anchorRuntimeId: runtimeIds[0] ?? null,
      boundaryId: `viewport-virtualization:${startIndex}-${endIndex}`,
      endIndex,
      focusRuntimeId: runtimeIds.at(-1) ?? null,
      runtimeIds,
      startIndex,
    });
  };

  for (const range of mountedRanges) {
    pushRange(nextIndex, range.startIndex - 1);
    nextIndex = range.endIndex + 1;
  }

  pushRange(nextIndex, count - 1);

  return ranges;
};

export const useVirtualizedRootPlan = ({
  config,
  enabled,
  promotedTopLevelIndex,
  pageLayoutItems,
  rootElement,
  scrollElement,
  selectionPaths,
  selectedTopLevelIndex,
  topLevelLayoutItems,
  topLevelRuntimeIds,
  visiblePageLayoutItems,
}: {
  config: DOMStrategyVirtualizedConfig | null;
  enabled: boolean;
  promotedTopLevelIndex: number | null;
  rootElement: HTMLElement | null;
  scrollElement: HTMLElement | null;
  selectionPaths: readonly Path[] | null;
  selectedTopLevelIndex: number | null;
  pageLayoutItems?: readonly VirtualizedPageLayoutItem[] | null;
  topLevelLayoutItems?: readonly VirtualizedTopLevelLayoutItem[] | null;
  topLevelRuntimeIds: readonly RuntimeId[];
  visiblePageLayoutItems?: readonly VirtualizedPageLayoutItem[] | null;
}) => {
  const hasPageLayoutItems = Boolean(pageLayoutItems?.length);
  const count = config
    ? hasPageLayoutItems
      ? (pageLayoutItems?.length ?? 0)
      : topLevelRuntimeIds.length
    : 0;
  const estimatedBlockSize = config?.estimatedBlockSize ?? 32;
  const configuredOverscan = config?.overscan ?? 0;
  const layoutItemByIndex = React.useMemo(
    () =>
      new Map(
        (topLevelLayoutItems ?? []).map((item) => [item.index, item] as const)
      ),
    [topLevelLayoutItems]
  );
  const pageItemByIndex = React.useMemo(
    () =>
      new Map(
        (pageLayoutItems ?? []).map((item) => [item.index, item] as const)
      ),
    [pageLayoutItems]
  );
  const pageItemIndexesByTopLevelIndex = React.useMemo(
    () => createPageItemIndexesByTopLevelIndex(pageLayoutItems),
    [pageLayoutItems]
  );
  const virtualizerSizeByIndex = React.useMemo(
    () =>
      hasPageLayoutItems
        ? createPageVirtualizerSizeMap(pageLayoutItems)
        : createLayoutVirtualizerSizeMap(topLevelLayoutItems),
    [hasPageLayoutItems, pageLayoutItems, topLevelLayoutItems]
  );
  const estimateSize = React.useCallback(
    (index: number) => virtualizerSizeByIndex.get(index) ?? estimatedBlockSize,
    [estimatedBlockSize, virtualizerSizeByIndex]
  );
  const [
    nativeScrollbarDragOverscanActive,
    setNativeScrollbarDragOverscanActive,
  ] = React.useState(false);
  React.useEffect(() => {
    if (!scrollElement || hasPageLayoutItems) {
      return;
    }

    const activateNativeScrollbarDragOverscan = (event: PointerEvent) => {
      if (!isVerticalScrollbarPointer(event, scrollElement)) {
        return;
      }

      flushSync(() => {
        setNativeScrollbarDragOverscanActive(true);
      });
    };
    const deactivateNativeScrollbarDragOverscan = () => {
      setNativeScrollbarDragOverscanActive(false);
    };

    scrollElement.addEventListener(
      'pointerdown',
      activateNativeScrollbarDragOverscan
    );
    scrollElement.ownerDocument.addEventListener(
      'pointerup',
      deactivateNativeScrollbarDragOverscan
    );
    scrollElement.ownerDocument.addEventListener(
      'pointercancel',
      deactivateNativeScrollbarDragOverscan
    );

    return () => {
      scrollElement.removeEventListener(
        'pointerdown',
        activateNativeScrollbarDragOverscan
      );
      scrollElement.ownerDocument.removeEventListener(
        'pointerup',
        deactivateNativeScrollbarDragOverscan
      );
      scrollElement.ownerDocument.removeEventListener(
        'pointercancel',
        deactivateNativeScrollbarDragOverscan
      );
    };
  }, [hasPageLayoutItems, scrollElement]);
  const effectiveOverscan = hasPageLayoutItems
    ? configuredOverscan
    : nativeScrollbarDragOverscanActive
      ? Math.max(configuredOverscan, TOP_LEVEL_NATIVE_SCROLLBAR_DRAG_OVERSCAN)
      : configuredOverscan;
  const selectedEndpointIndexes = React.useMemo(
    () =>
      selectionPaths
        ?.map((path) => path[0])
        .filter((index): index is number => typeof index === 'number') ?? [],
    [selectionPaths]
  );
  const retainedVirtualIndexes = React.useMemo(() => {
    if (!hasPageLayoutItems) {
      return [
        ...selectedEndpointIndexes,
        selectedTopLevelIndex,
        promotedTopLevelIndex,
      ];
    }

    return [];
  }, [
    hasPageLayoutItems,
    promotedTopLevelIndex,
    selectedEndpointIndexes,
    selectedTopLevelIndex,
  ]);
  const rangeExtractor = React.useMemo(
    () =>
      createRetainedRangeExtractor({
        count,
        retainedIndexes: retainedVirtualIndexes,
      }),
    [count, retainedVirtualIndexes]
  );
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual returns imperative helpers; this hook owns them locally.
  const virtualizer = useVirtualizer<HTMLElement, HTMLElement>({
    count,
    enabled: Boolean(config && enabled),
    estimateSize,
    getItemKey: (index) =>
      hasPageLayoutItems
        ? (pageItemByIndex.get(index)?.key ?? index)
        : (topLevelRuntimeIds[index] ?? index),
    getScrollElement: () => scrollElement,
    initialRect: {
      height: getElementViewportHeight(scrollElement, estimatedBlockSize * 8),
      width: scrollElement?.clientWidth || rootElement?.clientWidth || 1024,
    },
    overscan: effectiveOverscan,
    rangeExtractor,
  });

  if (!config || !enabled || !scrollElement || count < config.threshold) {
    return null;
  }

  const visiblePageLayoutVirtualizerItems =
    hasPageLayoutItems && visiblePageLayoutItems
      ? [
          ...new Set([
            ...visiblePageLayoutItems.map((item) => item.index),
            ...retainedVirtualIndexes.filter(
              (index): index is number => typeof index === 'number'
            ),
          ]),
        ]
          .map((index) => pageItemByIndex.get(index))
          .filter((item): item is VirtualizedPageLayoutItem => Boolean(item))
          .sort((left, right) => left.index - right.index)
          .map((item) => ({
            index: item.index,
            key: item.key,
            size: item.size,
            start: item.start,
          }))
      : null;
  const virtualizerItems =
    visiblePageLayoutVirtualizerItems ?? virtualizer.getVirtualItems();
  const virtualTopLevelIndexes = hasPageLayoutItems
    ? [
        ...new Set(
          virtualizerItems.flatMap(
            (item) => pageItemByIndex.get(item.index)?.topLevelIndexes ?? []
          )
        ),
      ].sort((left, right) => left - right)
    : virtualizerItems.map((item) => item.index);
  const virtualizerItemByIndex = new Map(
    virtualizerItems.map((item) => [item.index, item] as const)
  );
  const getVirtualizerItemForTopLevelIndex = (index: number) => {
    if (!hasPageLayoutItems) {
      return virtualizerItemByIndex.get(index);
    }

    const pageIndex = pageItemIndexesByTopLevelIndex
      .get(index)
      ?.find((candidate) => virtualizerItemByIndex.has(candidate));

    return typeof pageIndex === 'number'
      ? virtualizerItemByIndex.get(pageIndex)
      : undefined;
  };
  const virtualItemsByIndex = new Map(
    virtualTopLevelIndexes
      .map<VirtualizedTopLevelItem>((index) => {
        const layoutItem = layoutItemByIndex.get(index);
        const virtualizerItem = getVirtualizerItemForTopLevelIndex(index);

        return {
          index,
          key: topLevelRuntimeIds[index] ?? index,
          left: layoutItem?.left,
          runtimeId: topLevelRuntimeIds[index]!,
          size: layoutItem?.size ?? virtualizerItem?.size ?? estimatedBlockSize,
          start:
            layoutItem?.start ??
            virtualizerItem?.start ??
            index * estimatedBlockSize,
          width: layoutItem?.width,
        };
      })
      .filter((item) => item.runtimeId)
      .map((item) => [item.index, item])
  );

  for (const index of [
    ...selectedEndpointIndexes,
    selectedTopLevelIndex,
    promotedTopLevelIndex,
  ]) {
    if (
      typeof index !== 'number' ||
      index < 0 ||
      index >= topLevelRuntimeIds.length ||
      virtualItemsByIndex.has(index)
    ) {
      continue;
    }

    const runtimeId = topLevelRuntimeIds[index];

    if (!runtimeId) {
      continue;
    }

    const layoutItem = layoutItemByIndex.get(index);

    virtualItemsByIndex.set(index, {
      index,
      key: runtimeId,
      left: layoutItem?.left,
      runtimeId,
      size: layoutItem?.size ?? estimatedBlockSize,
      start: layoutItem?.start ?? index * estimatedBlockSize,
      width: layoutItem?.width,
    });
  }

  const virtualItems = [...virtualItemsByIndex.values()].sort(
    (left, right) => left.index - right.index
  );
  const mountedIndexes = virtualItems.map((item) => item.index);
  const mountedTopLevelRanges = coalesceIndexes(mountedIndexes);
  const mountedTopLevelRuntimeIds = new Set(
    virtualItems.map((item) => item.runtimeId)
  );
  const missingRanges = getMissingRanges({
    count: topLevelRuntimeIds.length,
    mountedRanges: mountedTopLevelRanges,
    topLevelRuntimeIds,
  });
  const pageLayoutTotalSize =
    pageLayoutItems && pageLayoutItems.length > 0
      ? pageLayoutItems.reduce(
          (size, item) => Math.max(size, item.start + item.size),
          0
        )
      : null;
  const layoutTotalSize =
    topLevelLayoutItems && topLevelLayoutItems.length > 0
      ? topLevelLayoutItems.reduce(
          (size, item) => Math.max(size, item.start + item.size),
          0
        )
      : null;
  const scrollToVirtualizerOffset = (
    start: number,
    size: number,
    align: 'start' | 'center' | 'end' | 'auto'
  ) => {
    if (!scrollElement) {
      return;
    }

    const viewportHeight = getElementViewportHeight(
      scrollElement,
      estimatedBlockSize * 8
    );
    const top =
      align === 'center'
        ? start - (viewportHeight - size) / 2
        : align === 'end'
          ? start - viewportHeight + size
          : start;

    virtualizer.scrollToOffset(Math.max(0, top));
  };
  const scrollToTopLevelIndex = (
    index: number,
    align: 'start' | 'center' | 'end' | 'auto' = 'auto'
  ) => {
    if (hasPageLayoutItems) {
      const pageIndex = pageItemIndexesByTopLevelIndex.get(index)?.[0];
      const pageItem =
        typeof pageIndex === 'number' ? pageItemByIndex.get(pageIndex) : null;

      if (pageItem) {
        scrollToVirtualizerOffset(pageItem.start, pageItem.size, align);
        return;
      }

      return;
    }

    const layoutItem = layoutItemByIndex.get(index);

    if (layoutItem && scrollElement) {
      scrollToVirtualizerOffset(layoutItem.start, layoutItem.size, align);
      return;
    }

    virtualizer.scrollToIndex(index, { align });
  };
  const scrollToPath = (
    path: Path,
    align: 'start' | 'center' | 'end' | 'auto' = 'auto'
  ) => {
    if (hasPageLayoutItems) {
      const pageIndex = createPageItemIndexesForPath(
        pageLayoutItems,
        path
      )?.[0];
      const pageItem =
        typeof pageIndex === 'number' ? pageItemByIndex.get(pageIndex) : null;

      if (pageItem) {
        scrollToVirtualizerOffset(pageItem.start, pageItem.size, align);
        return true;
      }

      if (path.length > 1) {
        return false;
      }
    }

    const topLevelIndex = path[0];

    if (typeof topLevelIndex === 'number') {
      scrollToTopLevelIndex(topLevelIndex, align);
      return true;
    }

    return false;
  };

  return {
    estimatedBlockSize,
    missingRanges,
    mountedTopLevelRanges,
    mountedTopLevelRuntimeIds,
    scrollToTopLevelIndex,
    scrollToPath,
    totalSize:
      pageLayoutTotalSize ?? layoutTotalSize ?? virtualizer.getTotalSize(),
    virtualItems,
    virtualizerMeasuredCount: virtualItems.length,
    measureElement: hasPageLayoutItems ? undefined : virtualizer.measureElement,
  };
};
