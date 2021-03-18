import { useCallback } from 'react';
import { useSlatePluginsStore } from './useSlatePluginsStore';

export const usePlugins = (id = 'main') =>
  useSlatePluginsStore(
    useCallback((state) => state.byId[id]?.plugins ?? [], [id])
  );
