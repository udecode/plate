import { useCallback } from 'react';
import { useSlatePluginsStore } from './useSlatePluginsStore';

export const useSlatePluginsValue = (id = 'main') =>
  useSlatePluginsStore(useCallback((state) => state.byId[id]?.value, [id]));
