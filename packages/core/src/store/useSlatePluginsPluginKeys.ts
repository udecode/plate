import { useCallback } from 'react';
import { useSlatePluginsStore } from './useSlatePluginsStore';

export const useSlatePluginsPluginKeys = (id = 'main') =>
  useSlatePluginsStore(
    useCallback((state) => state.byId[id]?.pluginKeys ?? [], [id])
  );
