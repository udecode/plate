import { useCallback } from 'react';
import { pick } from 'lodash';
import shallow from 'zustand/shallow';
import {
  SlatePluginOptionKey,
  SlatePluginOptions,
  SlatePluginsStore,
} from '../types/SlatePluginsStore';
import { useEditorId } from './useEditorId';
import { useSlatePluginsStore } from './useSlatePluginsStore';

// const pick = <T>(obj: T, keys: string[] = []) => {
//   const filtered = {};
//   keys.forEach((key) => {
//     if (obj.hasOwnProperty(key)) {
//       filtered[key] = obj[key];
//     }
//   });
//   return filtered;
// };

export const getOptions = (
  state: SlatePluginsStore,
  id: string,
  pluginKey: string,
  optionKey?: SlatePluginOptionKey | SlatePluginOptionKey[]
): SlatePluginOptions => {
  const options = state.byId[id]?.options[pluginKey];
  if (!options.type) options.type = pluginKey;

  return optionKey ? (pick(options, optionKey) as SlatePluginOptions) : options;
};

export const useEditorOptions = (
  pluginKey: string,
  optionKey?: SlatePluginOptionKey | SlatePluginOptionKey[]
) => {
  const id = useEditorId();

  return useSlatePluginsStore(
    useCallback(
      (state) => {
        return getOptions(state, id, pluginKey, optionKey);
      },
      [id, optionKey, pluginKey]
    ),
    shallow
  );
};

export const useEditorMultiOptions = (
  pluginKeys: string[],
  optionKey?: SlatePluginOptionKey | SlatePluginOptionKey[]
) => {
  const id = useEditorId();

  return useSlatePluginsStore(
    useCallback(
      (state) => {
        const opt: Record<string, SlatePluginOptions> = {};

        pluginKeys.forEach((pluginKey) => {
          opt[pluginKey] = getOptions(state, id, pluginKey, optionKey);
        });

        return opt;
      },
      [id, optionKey, pluginKeys]
    ),
    shallow
  );
};

export const useRenderElementOptions = (pluginKey: string) =>
  useEditorOptions(pluginKey, ['type', 'component', 'nodeToProps']);

export const useRenderLeafOptions = (pluginKey: string) =>
  useEditorOptions(pluginKey, ['type', 'component', 'nodeToProps']);

export const useHotkeyOptions = (pluginKey: string) =>
  useEditorOptions(pluginKey, ['type', 'hotkey', 'clear']);

export const useEditorComponent = (pluginKey: string) =>
  useEditorOptions(pluginKey, 'component');

export const useEditorType = (pluginKey: string) =>
  useEditorOptions(pluginKey, 'type').type;
