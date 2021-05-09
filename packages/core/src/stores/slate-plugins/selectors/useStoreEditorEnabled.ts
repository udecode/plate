import { useCallback } from 'react';
import { useSlatePluginsStore } from '../slate-plugins.store';
import { getSlatePluginsState } from './getSlatePluginsState';

export const useStoreEditorEnabled = (id?: string | null) =>
  useSlatePluginsStore(
    useCallback((state) => getSlatePluginsState(state, id)?.enabled, [id])
  );
