import React from 'react';

import type { Range } from 'slate';

import type { SelectionRect } from '../types';

import { useRequestReRender } from './useRequestReRender';

export interface UseRefreshOnResizeOptions {
  selectionRectCache: React.MutableRefObject<WeakMap<
    Range,
    SelectionRect[]
  > | null>;
  containerRef?: React.RefObject<HTMLElement | null>;
  refreshOnResize?: boolean;
}

export const useRefreshOnResize = ({
  containerRef,
  refreshOnResize,
  selectionRectCache,
}: UseRefreshOnResizeOptions) => {
  const requestReRender = useRequestReRender();

  // Reset the selection rect cache and request re-render.
  const refresh = React.useCallback(
    (sync = false) => {
      selectionRectCache.current = new WeakMap();
      requestReRender(sync);
    },
    [requestReRender, selectionRectCache]
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
