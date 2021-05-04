import { useCallback } from 'react';
import { useSlatePluginsStore } from '../slate-plugins.store';
import { getSlatePluginsState } from './getSlatePluginsState';

export const useStoreSlatePluginKeys = (id?: string | null) =>
  useSlatePluginsStore(
    useCallback((state) => getSlatePluginsState(state, id)?.pluginKeys, [id])
  );
