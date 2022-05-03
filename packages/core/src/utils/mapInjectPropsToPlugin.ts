import { Value } from '../slate/types/TEditor';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin, WithPlatePlugin } from '../types/plugins/PlatePlugin';
import { PluginKey } from '../types/plugins/PlatePluginKey';
import { getKeysByTypes } from './getKeysByTypes';

/**
 * Map plugin inject props to injected plugin
 */
export const mapInjectPropsToPlugin = <V extends Value, T = {}, P = {}>(
  editor: PlateEditor<V, T>,
  plugin: WithPlatePlugin<V, T, P>,
  injectedPlugin: Partial<PlatePlugin<V>>
) => {
  const validTypes = plugin.inject.props?.validTypes;
  if (!validTypes) return;

  const keys = getKeysByTypes(editor, validTypes);

  const injected: Record<PluginKey, Partial<PlatePlugin<V>>> = {};

  keys.forEach((key) => {
    injected[key] = injectedPlugin;
  });

  return {
    inject: {
      pluginsByKey: injected,
    },
  };
};
