import { useCallback } from 'react';
import { defaultEditor } from './slatePluginsStore';
import { SlatePluginsState } from './types';
import { useSlatePluginsStore } from './useSlatePluginsStore';

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

const selActions = (state: SlatePluginsState) => ({
  setValue: state.setValue,
  setComponents: state.setComponents,
  setEditor: state.setEditor,
  setPlugins: state.setPlugins,
});

export const useSlatePluginsActions = () => useSlatePluginsStore(selActions);
