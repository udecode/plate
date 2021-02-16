import { useCallback } from 'react';
import { defaultEditor } from './slatePluginsStore';
import { SlatePluginsState, State } from './types';
import { useSlatePluginsStore } from './useSlatePluginsStore';

export const useSlatePluginsEditor = <TEditor = typeof defaultEditor>({
  key = 'main',
}: {
  key?: string;
} = {}) =>
  useSlatePluginsStore(
    useCallback((state) => state.byId[key]?.editor as TEditor, [key])
  );

export const useSlatePluginsValue = ({
  key = 'main',
}: {
  key?: string;
} = {}) =>
  useSlatePluginsStore(useCallback((state) => state.byId[key]?.value, [key]));

export const useSlatePluginsSetValue = ({
  key = 'main',
}: {
  key?: string;
} = {}) =>
  useSlatePluginsStore(
    useCallback(
      (state) => (value: State['value']) => state.setValue(key, value),
      [key]
    )
  );

export const useSlatePluginsComponent = <TNodeType extends string>({
  nodeType,
  key = 'main',
}: {
  nodeType: TNodeType;
  key?: string;
}) =>
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
