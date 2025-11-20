import React from 'react';

import type { TRange } from 'platejs';

import type { CursorOverlayProps } from '../components';
import type { SelectionRect } from '../types';

import { useRequestReRender } from './useRequestReRender';

export interface useRefreshOnResizeOptions
  extends Pick<CursorOverlayProps, 'containerRef' | 'refreshOnResize'> {
  selectionRectCache: React.MutableRefObject<WeakMap<TRange, SelectionRect[]>>;
}

export const useRefreshOnResize = ({
  containerRef,
  refreshOnResize,
  selectionRectCache: selectionRectCacheRef,
}: useRefreshOnResizeOptions) => {
  const requestReRender = useRequestReRender();

  // Reset the selection rect cache and request re-render.
  // ✅ Mutating ref inside callback is OK - callbacks run in response to events, not during render
  const refresh = React.useCallback(
    (sync = false) => {
      selectionRectCacheRef.current = new WeakMap();
      requestReRender(sync);
    },
    [requestReRender, selectionRectCacheRef]
  );

  // Refresh on container resize
  React.useEffect(() => {
    if (!refreshOnResize || !containerRef?.current) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => refresh());
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [containerRef, refresh, refreshOnResize]);

  return {
    refresh,
  };
};
