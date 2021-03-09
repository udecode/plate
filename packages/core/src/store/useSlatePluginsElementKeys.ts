import { useCallback } from 'react';
import { useSlatePluginsStore } from './useSlatePluginsStore';

export const useSlatePluginsElementKeys = (id = 'main') =>
  useSlatePluginsStore(
    useCallback((state) => state.byId[id]?.elementKeys ?? [], [id])
  );
