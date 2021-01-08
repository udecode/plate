import { useCallback } from 'react';
import { SlatePluginsStore } from './types';
import { defaultEditor, useSlatePluginsStore } from './useSlatePluginsStore';

export const useSlatePluginsEditor = <TEditor = typeof defaultEditor>(
  key = 'main'
) =>
  useSlatePluginsStore(
    useCallback((state) => state.byId[key]?.editor as TEditor, [key])
  );

export const useSlatePluginsComponent = <TNodeType extends string>(
  nodeType: TNodeType,
  key = 'main'
) =>
  useSlatePluginsStore(
    useCallback((state) => state.byId[key]?.components[nodeType], [
      key,
      nodeType,
    ])
  );

const selActions = (state: SlatePluginsStore) => ({
  setValue: state.setValue,
  setComponents: state.setComponents,
  setEditor: state.setEditor,
  setPlugins: state.setPlugins,
});

export const useSlatePluginsActions = () => useSlatePluginsStore(selActions);
