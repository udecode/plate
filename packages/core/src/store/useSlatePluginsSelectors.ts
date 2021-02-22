import { useCallback } from 'react';
import shallow from 'zustand/shallow';
import { SlatePluginsState } from '../types/SlatePluginsState';
import { defaultEditor } from './slatePluginsStore';
import { useSlatePluginsStore } from './useSlatePluginsStore';

export const useSlatePluginsEditor = <TEditor = typeof defaultEditor>(
  key = 'main'
) =>
  useSlatePluginsStore(
    useCallback((state) => state.byId[key]?.editor as TEditor, [key])
  );

export const useSlatePluginsValue = (key = 'main') =>
  useSlatePluginsStore(useCallback((state) => state.byId[key]?.value, [key]));

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

export const useSlatePluginsActions = () =>
  useSlatePluginsStore(selActions, shallow);
