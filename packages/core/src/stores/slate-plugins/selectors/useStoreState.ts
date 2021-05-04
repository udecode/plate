import { useCallback } from 'react';
import shallow from 'zustand/shallow';
import { useSlatePluginsStore } from '../slate-plugins.store';
import { getSlatePluginsState } from './getSlatePluginsState';

export const useStoreState = (id?: string | null) =>
  useSlatePluginsStore(
    useCallback((state) => getSlatePluginsState(state, id), [id]),
    shallow
  );
