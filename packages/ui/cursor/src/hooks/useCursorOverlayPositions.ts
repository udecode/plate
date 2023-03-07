import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { UnknownObject, useEditorRef } from '@udecode/plate-common';
import { Range } from 'slate';
import { CursorOverlayProps } from '../components/index';
import { getCursorOverlayState } from '../queries/getCursorOverlayState';
import { getSelectionRects } from '../queries/getSelectionRects';
import { CursorState, SelectionRect } from '../types';
import { useRefreshOnResize } from './useRefreshOnResize';

export const FROZEN_EMPTY_ARRAY = (Object.freeze(
  []
) as unknown) as SelectionRect[];

export const useCursorOverlayPositions = <TCursorData extends UnknownObject>({
  containerRef,
  cursors: cursorStates,
  refreshOnResize = true,
}: CursorOverlayProps<TCursorData> = {}) => {
  const editor = useEditorRef();

  const selectionRectCache = useRef<WeakMap<Range, SelectionRect[]>>(
    new WeakMap()
  );

  const [selectionRects, setSelectionRects] = useState<
    Record<string, SelectionRect[]>
  >({});

  const updateSelectionRects = useCallback(() => {
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
  }, [containerRef, cursorStates, editor, selectionRects]);

  // Update selection rects after paint
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    updateSelectionRects();
  });

  const cursors = useMemo(
    () =>
      getCursorOverlayState({
        selectionRects,
        cursors: cursorStates,
      }),
    [cursorStates, selectionRects]
  );

  const { refresh } = useRefreshOnResize({
    containerRef,
    selectionRectCache,
    refreshOnResize,
  });

  return { refresh, cursors };
};
