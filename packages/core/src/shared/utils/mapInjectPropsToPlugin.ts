import type { PlateEditor } from '../types/PlateEditor';
import type { PlatePlugin, PlatePlugin } from '../types/plugin/PlatePlugin';
import type { PluginKey } from '../types/plugin/PlatePluginKey';

import { getKeysByTypes } from './getKeysByTypes';

/** Map plugin inject props to injected plugin */
export const mapInjectPropsToPlugin = (
  editor: PlateEditor,
  plugin: PlatePlugin,
  injectedPlugin: Partial<PlatePlugin>
) => {
  const validTypes = plugin.inject.props?.validTypes;

  if (!validTypes) return;

  const keys = getKeysByTypes(editor, validTypes);

  const injected: Record<PluginKey, Partial<PlatePlugin>> = {};

  keys.forEach((key) => {
    injected[key] = injectedPlugin;
  });

  return {
    inject: {
      pluginsByKey: injected,
    },
  };
};
