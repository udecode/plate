import type { PlateEditor } from '../types/PlateEditor';
import type { AnyPlatePlugin } from '../types/plugin/PlatePlugin';
import type { PluginKey } from '../types/plugin/PlatePluginKey';

import { getKeysByTypes } from './getKeysByTypes';

/** Map plugin inject props to injected plugin */
export const mapInjectPropsToPlugin = (
  editor: PlateEditor,
  plugin: AnyPlatePlugin,
  injectedPlugin: Partial<AnyPlatePlugin>
) => {
  const validTypes = plugin.inject.props?.validTypes;

  if (!validTypes) return {};

  const keys = getKeysByTypes(editor, validTypes);

  const injected: Record<PluginKey, Partial<AnyPlatePlugin>> = {};

  keys.forEach((key) => {
    injected[key] = injectedPlugin;
  });

  return {
    inject: {
      pluginsByKey: injected,
    },
  };
};
