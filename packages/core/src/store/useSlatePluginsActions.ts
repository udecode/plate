import { useMemo } from 'react';
import { SlatePluginsActions } from '../types/SlatePluginsStore';
import { useSlatePluginsStore } from './useSlatePluginsStore';

const s = useSlatePluginsStore;

const getSetterById = <T extends (...args: any) => any>(
  action: T,
  storeId?: string
) => (value: Parameters<T>[0], id: Parameters<T>[1]) =>
  action(value, id ?? storeId);

export const useSlatePluginsActions = (
  storeId?: string
): SlatePluginsActions => {
  return useMemo(
    () => ({
      setInitialState: (id?: string) =>
        s.getState().setInitialState(id ?? storeId),
      setValue: getSetterById(s.getState().setValue, storeId),
      setEditor: getSetterById(s.getState().setEditor, storeId),
      setPlugins: getSetterById(s.getState().setPlugins, storeId),
      setElementKeys: getSetterById(s.getState().setElementKeys, storeId),
      resetEditorKey: (id?: string) =>
        s.getState().resetEditorKey(id ?? storeId),
    }),
    [storeId]
  );
};
