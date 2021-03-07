import { useMemo } from 'react';
import { SlatePluginsActions } from '../types/SlatePluginsStore';
import { useSlatePluginsStore } from './useSlatePluginsStore';

const getSetterById = <T extends (...args: any) => any>(
  action: T,
  storeId?: string
) => (value: Parameters<T>[0], id: Parameters<T>[1]) =>
  action(value, id ?? storeId);

export const useSlatePluginsActions = (
  storeId?: string
): SlatePluginsActions => {
  const store = useSlatePluginsStore;

  return useMemo(
    () => ({
      setInitialState: (id?: string) =>
        store.getState().setInitialState(id ?? storeId),
      setValue: getSetterById(store.getState().setValue, storeId),
      setComponents: getSetterById(store.getState().setComponents, storeId),
      setEditor: getSetterById(store.getState().setEditor, storeId),
      setPlugins: getSetterById(store.getState().setPlugins, storeId),
      setWithPlugins: getSetterById(store.getState().setWithPlugins, storeId),
      setElementKeys: getSetterById(store.getState().setElementKeys, storeId),
    }),
    [store, storeId]
  );
};
