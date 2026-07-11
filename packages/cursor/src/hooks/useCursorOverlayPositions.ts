import React from 'react';

import type { Range } from '@platejs/plite';
import { useIsomorphicLayoutEffect } from '@udecode/react-utils';
import type { UnknownObject } from '@udecode/utils';

import { useEditorRef } from '@platejs/core/react';

import type { CursorOverlayProps } from '../components/CursorOverlay';
import {
  FROZEN_EMPTY_ARRAY,
  type CursorState,
  type SelectionRect,
} from '../types';

import { getCursorOverlayState } from '../queries/getCursorOverlayState';
import { getSelectionRects } from '../queries/getSelectionRects';
import { useRefreshOnResize } from './useRefreshOnResize';

export type UseCursorOverlayPositionsOptions<
  TCursorData extends UnknownObject = UnknownObject,
> = Pick<
  CursorOverlayProps<TCursorData>,
  'containerRef' | 'cursors' | 'refreshOnResize'
>;

export const useCursorOverlayPositions = <TCursorData extends UnknownObject>({
  containerRef,
  cursors: cursorStates,
  refreshOnResize = true,
}: UseCursorOverlayPositionsOptions<TCursorData> = {}) => {
  const editor = useEditorRef();

  const selectionRectCache = React.useRef<
    WeakMap<Range, readonly SelectionRect[]>
  >(new WeakMap());

  const [selectionRects, setSelectionRects] = React.useState<
    Record<string, readonly SelectionRect[]>
  >({});

  const updateSelectionRects = React.useCallback(() => {
    const container = containerRef?.current;

    // A provided container must be mounted before relative geometry is valid.
    if (containerRef && !container) return;
    if (!cursorStates) return;

    let xOffset = 0;
    let yOffset = 0;

    if (container) {
      const contentRect = container.getBoundingClientRect();
      xOffset = contentRect.x;
      yOffset = contentRect.y;
      yOffset -= container.scrollTop;
    }

    let selectionRectsChanged =
      Object.keys(selectionRects).length !== Object.keys(cursorStates).length;

    const getCachedSelectionRects = ({
      cursor,
    }: {
      cursor: CursorState<TCursorData>;
    }) => {
      const range = cursor.selection;

      if (!range) {
        return FROZEN_EMPTY_ARRAY;
      }

      const cached = selectionRectCache.current.get(range);

      if (cached) {
        return cached;
      }

      const rects = getSelectionRects(editor, { range, xOffset, yOffset });
      selectionRectsChanged = true;
      selectionRectCache.current.set(range, rects);

      return rects;
    };

    const updated: Record<string, readonly SelectionRect[]> =
      Object.fromEntries(
        Object.entries(cursorStates).map(([key, cursor]) => [
          key,
          getCachedSelectionRects({
            cursor,
          }),
        ])
      );

    if (selectionRectsChanged) {
      setSelectionRects(updated);
    }
  }, [containerRef, cursorStates, editor, selectionRects]);

  // Update selection rects after paint

  useIsomorphicLayoutEffect(() => {
    updateSelectionRects();
  });

  const cursors = React.useMemo(
    () =>
      getCursorOverlayState({
        cursors: cursorStates,
        selectionRects,
      }),
    [cursorStates, selectionRects]
  );

  const { refresh } = useRefreshOnResize({
    containerRef,
    refreshOnResize,
    selectionRectCache,
  });

  return { cursors, refresh };
};
