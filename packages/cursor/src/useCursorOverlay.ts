import React from 'react';

import { useEditor } from '@platejs/core/react';
import type { Range } from '@platejs/plite';
import { useIsomorphicLayoutEffect } from '@udecode/react-utils';
import type { UnknownObject } from '@udecode/utils';

import {
  FROZEN_EMPTY_ARRAY,
  getCursorOverlayState,
  getSelectionRects,
} from './cursorGeometry';
import type { CursorState, SelectionRect } from './types';

export type UseCursorOverlayPositionsOptions<
  TCursorData extends UnknownObject = UnknownObject,
> = {
  containerRef?: React.RefObject<HTMLElement | null>;
  cursors?: Record<string, CursorState<TCursorData>>;
  refreshOnResize?: boolean;
};

export const useRequestReRender = () => {
  const [, setUpdateCounter] = React.useState(0);
  const animationFrameRef = React.useRef<number | null>(null);

  const requestReRender = React.useCallback((immediate = false) => {
    if (animationFrameRef.current !== null && !immediate) return;

    if (!immediate) {
      animationFrameRef.current = requestAnimationFrame(() => {
        setUpdateCounter((state) => state + 1);
        animationFrameRef.current = null;
      });

      return;
    }
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setUpdateCounter((state) => state + 1);
  }, []);

  React.useEffect(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  });

  React.useEffect(
    () => () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    },
    []
  );

  return requestReRender;
};

export const useRefreshOnResize = ({
  containerRef,
  refreshOnResize,
  selectionRectCache,
}: Pick<
  UseCursorOverlayPositionsOptions,
  'containerRef' | 'refreshOnResize'
> & {
  selectionRectCache: React.MutableRefObject<
    WeakMap<Range, readonly SelectionRect[]>
  >;
}) => {
  const requestReRender = useRequestReRender();
  const refresh = React.useCallback(
    (sync = false) => {
      selectionRectCache.current = new WeakMap();
      requestReRender(sync);
    },
    [requestReRender, selectionRectCache]
  );

  React.useEffect(() => {
    if (!refreshOnResize || !containerRef?.current) return;

    const resizeObserver = new ResizeObserver(() => refresh());
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [containerRef, refresh, refreshOnResize]);

  return { refresh };
};

export const useCursorOverlayPositions = <TCursorData extends UnknownObject>({
  containerRef,
  cursors,
  refreshOnResize = true,
}: UseCursorOverlayPositionsOptions<TCursorData> = {}) => {
  const editor = useEditor();
  const selectionRectCache = React.useRef<
    WeakMap<Range, readonly SelectionRect[]>
  >(new WeakMap());
  const [selectionRects, setSelectionRects] = React.useState<
    Record<string, readonly SelectionRect[]>
  >({});

  const updateSelectionRects = React.useCallback(() => {
    const container = containerRef?.current;

    if (containerRef && !container) return;
    if (!cursors) return;

    let xOffset = 0;
    let yOffset = 0;

    if (container) {
      const contentRect = container.getBoundingClientRect();
      xOffset = contentRect.x;
      yOffset = contentRect.y - container.scrollTop;
    }

    let changed =
      Object.keys(selectionRects).length !== Object.keys(cursors).length;

    const updated = Object.fromEntries(
      Object.entries(cursors).map(([id, cursor]) => {
        const range = cursor.selection;

        if (!range) return [id, FROZEN_EMPTY_ARRAY];

        const cached = selectionRectCache.current.get(range);

        if (cached) return [id, cached];

        const rects = getSelectionRects(editor, { range, xOffset, yOffset });
        changed = true;
        selectionRectCache.current.set(range, rects);

        return [id, rects];
      })
    );

    if (changed) setSelectionRects(updated);
  }, [containerRef, cursors, editor, selectionRects]);

  useIsomorphicLayoutEffect(() => {
    updateSelectionRects();
  });

  const overlay = React.useMemo(
    () => getCursorOverlayState({ cursors, selectionRects }),
    [cursors, selectionRects]
  );
  const { refresh } = useRefreshOnResize({
    containerRef,
    refreshOnResize,
    selectionRectCache,
  });

  return { cursors: overlay, refresh };
};
