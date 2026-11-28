import {
  defaultRangeExtractor,
  useVirtualizer,
  type Range as VirtualRange,
} from '@tanstack/react-virtual';
import React from 'react';
import { flushSync } from 'react-dom';

import type { NodeKey, Path } from '../..';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import { parseCSSPixels } from '../scroll-root';
import {
  createEditableViewportPlan,
  createInitialViewportIndexes,
  type EditableViewportPlan,
} from '../viewport-plan';

export type VirtualizedEditableOptions = {
  estimatedBlockSize: number;
  overscan: number;
};

const TOP_LEVEL_NATIVE_SCROLLBAR_DRAG_OVERSCAN = 96;
const SCROLLBAR_POINTER_HIT_SLOP = 24;

const getElementViewportHeight = (
  element: HTMLElement | null,
  fallback: number
) => {
  if (!element) return fallback;
  if (element.clientHeight > 0) return element.clientHeight;

  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  const height = parseCSSPixels(style?.height);

  if (height > 0) return height;

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
  const start = scrollbarOnLeft ? rect.left : rect.right - gutterSize;
  const end = scrollbarOnLeft ? rect.left + gutterSize : rect.right;

  return event.clientX >= start && event.clientX <= end;
};

const readScrollMargin = (
  scrollElement: HTMLElement | null,
  rootElement: HTMLElement | null
) => {
  if (!scrollElement || !rootElement || scrollElement === rootElement) {
    return 0;
  }

  const scrollRect = scrollElement.getBoundingClientRect();
  const rootRect = rootElement.getBoundingClientRect();
  const margin =
    rootRect.top -
    (scrollRect.top + (scrollElement.clientTop || 0)) +
    scrollElement.scrollTop;

  return Number.isFinite(margin) && margin > 0 ? margin : 0;
};

const createRetainedRangeExtractor =
  ({
    count,
    retainedIndexes,
  }: {
    count: number;
    retainedIndexes: ReadonlyArray<number | null>;
  }) =>
  (range: VirtualRange) => {
    const indexes = new Set(defaultRangeExtractor(range));

    retainedIndexes.forEach((index) => {
      if (typeof index === 'number' && index >= 0 && index < count) {
        indexes.add(index);
      }
    });

    return [...indexes].sort((left, right) => left - right);
  };

export const useVirtualizedRootPlan = ({
  options,
  promotedTopLevelIndexes,
  retainedPaths,
  rootElement,
  scrollElement,
  selectionPaths,
  topLevelNodeKeys,
}: {
  options: VirtualizedEditableOptions;
  promotedTopLevelIndexes: readonly number[];
  retainedPaths?: readonly Path[];
  rootElement: HTMLElement | null;
  scrollElement: HTMLElement | null;
  selectionPaths: readonly Path[] | null;
  topLevelNodeKeys: readonly NodeKey[];
}): EditableViewportPlan => {
  const { estimatedBlockSize, overscan } = options;
  const count = topLevelNodeKeys.length;
  const selectedEndpointIndexes = React.useMemo(
    () =>
      selectionPaths
        ?.map((path) => path[0])
        .filter((index): index is number => typeof index === 'number') ?? [],
    [selectionPaths]
  );
  const retainedPathIndexes = React.useMemo(
    () =>
      retainedPaths
        ?.map((path) => path[0])
        .filter((index): index is number => typeof index === 'number') ?? [],
    [retainedPaths]
  );
  const retainedIndexes = React.useMemo(
    () => [
      ...selectedEndpointIndexes,
      ...retainedPathIndexes,
      ...promotedTopLevelIndexes,
    ],
    [promotedTopLevelIndexes, retainedPathIndexes, selectedEndpointIndexes]
  );
  const [nativeScrollbarDrag, setNativeScrollbarDrag] = React.useState(false);
  const [scrollMargin, setScrollMargin] = React.useState(0);

  useIsomorphicLayoutEffect(() => {
    const updateMargin = () => {
      const next = readScrollMargin(scrollElement, rootElement);
      setScrollMargin((prev) => (prev === next ? prev : next));
    };

    updateMargin();

    if (!scrollElement || !rootElement || scrollElement === rootElement) {
      return undefined;
    }

    const view = rootElement.ownerDocument.defaultView;
    const ResizeObserverConstructor =
      view?.ResizeObserver ??
      (typeof ResizeObserver === 'undefined' ? null : ResizeObserver);
    const observer = ResizeObserverConstructor
      ? new ResizeObserverConstructor(updateMargin)
      : null;

    observer?.observe(scrollElement);
    observer?.observe(rootElement);
    if (
      rootElement.parentElement &&
      rootElement.parentElement !== scrollElement
    ) {
      observer?.observe(rootElement.parentElement);
    }
    view?.addEventListener('resize', updateMargin);

    return () => {
      observer?.disconnect();
      view?.removeEventListener('resize', updateMargin);
    };
  }, [rootElement, scrollElement]);

  React.useEffect(() => {
    if (!scrollElement) return undefined;

    const start = (event: PointerEvent) => {
      if (!isVerticalScrollbarPointer(event, scrollElement)) return;
      flushSync(() => setNativeScrollbarDrag(true));
    };
    const stop = () => setNativeScrollbarDrag(false);

    scrollElement.addEventListener('pointerdown', start);
    scrollElement.ownerDocument.addEventListener('pointerup', stop);
    scrollElement.ownerDocument.addEventListener('pointercancel', stop);

    return () => {
      scrollElement.removeEventListener('pointerdown', start);
      scrollElement.ownerDocument.removeEventListener('pointerup', stop);
      scrollElement.ownerDocument.removeEventListener('pointercancel', stop);
    };
  }, [scrollElement]);

  const effectiveOverscan = nativeScrollbarDrag
    ? Math.max(overscan, TOP_LEVEL_NATIVE_SCROLLBAR_DRAG_OVERSCAN)
    : overscan;
  const rangeExtractor = React.useMemo(
    () => createRetainedRangeExtractor({ count, retainedIndexes }),
    [count, retainedIndexes]
  );
  const estimateSize = React.useCallback(
    () => estimatedBlockSize,
    [estimatedBlockSize]
  );
  // oxlint-disable-next-line react/incompatible-library -- TanStack Virtual owns imperative measurement state; React Compiler must not memoize this hook.
  const virtualizer = useVirtualizer<HTMLElement, HTMLElement>({
    count,
    enabled: scrollElement != null,
    estimateSize,
    getItemKey: (index) => topLevelNodeKeys[index] ?? index,
    getScrollElement: () => scrollElement,
    initialRect: {
      height: getElementViewportHeight(scrollElement, estimatedBlockSize * 8),
      width: scrollElement?.clientWidth || rootElement?.clientWidth || 1024,
    },
    overscan: effectiveOverscan,
    rangeExtractor,
    scrollMargin,
  });
  const virtualItems = scrollElement
    ? virtualizer.getVirtualItems().map((item) => ({
        index: item.index,
        size: item.size,
        start: Math.max(0, item.start - scrollMargin),
      }))
    : createInitialViewportIndexes({ count, retainedIndexes }).map((index) => ({
        index,
        size: estimatedBlockSize,
        start: index * estimatedBlockSize,
      }));
  const measureElement = React.useCallback(
    (element: HTMLElement | null) => {
      virtualizer.measureElement(element);
      if (!element) return;

      const index = Number(element.dataset.index);

      if (Number.isInteger(index) && element.offsetHeight > 0) {
        virtualizer.resizeItem(index, element.offsetHeight);
      }
    },
    [virtualizer]
  );
  const itemsByIndex = new Map(
    virtualItems.map((item) => [item.index, item] as const)
  );

  retainedIndexes.forEach((index) => {
    if (
      typeof index === 'number' &&
      index >= 0 &&
      index < count &&
      !itemsByIndex.has(index)
    ) {
      itemsByIndex.set(index, {
        index,
        size: estimatedBlockSize,
        start: index * estimatedBlockSize,
      });
    }
  });

  const indexes = [...itemsByIndex.keys()];
  const scrollToPath: EditableViewportPlan['scrollToPath'] = (
    path,
    align = 'auto'
  ) => {
    const index = path[0];

    if (typeof index !== 'number' || index < 0 || index >= count) return false;
    if (!scrollElement) return false;

    virtualizer.scrollToIndex(index, { align });
    return true;
  };

  return createEditableViewportPlan({
    coordinateSpace: 'flow',
    indexes,
    measureElement,
    scrollToPath,
    sizeAtIndex: (index) => itemsByIndex.get(index)?.size ?? estimatedBlockSize,
    startAtIndex: (index) =>
      itemsByIndex.get(index)?.start ?? index * estimatedBlockSize,
    topLevelNodeKeys,
    totalSize: scrollElement
      ? virtualizer.getTotalSize()
      : count * estimatedBlockSize,
  });
};
