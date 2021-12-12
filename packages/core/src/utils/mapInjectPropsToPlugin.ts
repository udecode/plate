import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin, WithPlatePlugin } from '../types/plugins/PlatePlugin';
import { PluginKey } from '../types/plugins/PlatePluginKey';
import { getKeysByTypes } from './getKeysByTypes';

/**
 * Map plugin inject props to injected plugin
 */
export const mapInjectPropsToPlugin = <T = {}, P = {}>(
  editor: PlateEditor<T>,
  plugin: WithPlatePlugin<T, P>,
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
