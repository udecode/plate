import React from 'react';

import type { UnknownObject } from '@udecode/plate-common';
import type { Range } from 'slate';

import {
  useEditorContainerRef,
  useEditorRef,
  useIsomorphicLayoutEffect,
} from '@udecode/plate-common/react';

import type { CursorOverlayState, CursorState, SelectionRect } from '../types';

import { CursorOverlayPlugin } from '../CursorOverlayPlugin';
import { getCursorOverlayState } from '../queries/getCursorOverlayState';
import { getSelectionRects } from '../queries/getSelectionRects';
import { useRefreshOnResize } from './useRefreshOnResize';

export type UseCursorOverlayOptions = {
  /**
   * Minimum width of a selection rect.
   *
   * @default 1
   */
  minSelectionWidth?: number;

  /**
   * Whether to refresh the cursor overlay positions on container resize.
   *
   * @default true
   */
  refreshOnResize?: boolean;
};

export const FROZEN_EMPTY_ARRAY = Object.freeze(
  []
) as unknown as SelectionRect[];

export const useCursorOverlay = <TCursorData extends UnknownObject>({
  minSelectionWidth = 1,
  refreshOnResize = true,
}: UseCursorOverlayOptions = {}): {
  cursors: CursorOverlayState<TCursorData>[];
  refresh: () => void;
} => {
  const editor = useEditorRef();
  const containerRef = useEditorContainerRef();

  const cursorStates = editor.useOption(
    CursorOverlayPlugin,
    'cursors'
  ) as Record<string, CursorState<TCursorData>>;

  const selectionRectCache = React.useRef<WeakMap<Range, SelectionRect[]>>(
    new WeakMap()
  );

  const [selectionRects, setSelectionRects] = React.useState<
    Record<string, SelectionRect[]>
  >({});

  const updateSelectionRects = React.useCallback(() => {
    // We have a container ref but the ref is null => container
    // isn't mounted to we can't calculate the selection rects.
    if (!containerRef?.current) return;
    if (!cursorStates) return;

    let xOffset = 0;
    let yOffset = 0;

    if (containerRef) {
      const contentRect = containerRef.current!.getBoundingClientRect();
      xOffset = contentRect.x;
      yOffset = contentRect.y;
      yOffset -= containerRef.current.scrollTop;
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

      const rects = getSelectionRects(editor, { range, xOffset, yOffset }).map(
        (rect) => {
          // Handle collapsed selection (cursor) positioning
          if (rect.width < minSelectionWidth) {
            return {
              ...rect,
              // Adjust left position to account for minimum width
              left: rect.left - (minSelectionWidth - rect.width) / 2,
              width: minSelectionWidth,
            };
          }

          return rect;
        }
      );

      selectionRectsChanged = true;
      selectionRectCache.current.set(range, rects);

      return rects;
    };

    const updated: Record<string, SelectionRect[]> = Object.fromEntries(
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
  }, [containerRef, cursorStates, editor, selectionRects, minSelectionWidth]);

  // Update selection rects after paint
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
